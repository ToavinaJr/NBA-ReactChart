import express, { Request, Response } from 'express';
import db from './db';
import cors from 'cors';
import { RowDataPacket } from 'mysql2';
import { 
    ALLOWED_STATS_PROPERTIES, 
    ALLOWED_FILTER_PROPERTIES, 
    SALARY_RANGES 
} from './constants';
import { PositionStats, EntityComparisonData } from './interfaces';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/players/stats/:targetProperty', async (req: Request, res: Response) => {
    const targetProperty = req.params.targetProperty.toLowerCase();

    if (!ALLOWED_STATS_PROPERTIES.includes(targetProperty)) {
        console.warn(`[STATS] Tentative d'accès stats invalide: ${targetProperty}`);
        return res.status(400).json({ error: 'Propriété invalide pour les statistiques' });
    }

    const columnName = targetProperty;
    let sql: string;
    let queryParams: (string | number)[] = [];

    try {
        if (columnName === 'salary') {
            let caseStatement = 'CASE';
            queryParams = [];

            for (const label in SALARY_RANGES) {
                const [min, max] = SALARY_RANGES[label];
                if (min !== null && max !== null) {
                    caseStatement += ` WHEN salary >= ? AND salary <= ? THEN ?`;
                    queryParams.push(min, max, label);
                } else if (min !== null && max === null) {
                    caseStatement += ` WHEN salary >= ? THEN ?`;
                    queryParams.push(min, label);
                }
                 else if (min === null && max !== null) {
                    caseStatement += ` WHEN salary <= ? THEN ?`;
                    queryParams.push(max, label);
                 }
            }
            caseStatement += ' ELSE NULL END';

            sql = `
              SELECT
                ${caseStatement} AS label,
                COUNT(*) AS count
              FROM players
              WHERE salary IS NOT NULL
              GROUP BY label
              HAVING label IS NOT NULL
            `;

        } else {
            sql = `
              SELECT
                CASE
                    WHEN ?? IS NULL OR TRIM(??) = '' THEN '(Non spécifié)'
                    ELSE TRIM(??)
                END AS label,
                COUNT(*) AS count
              FROM players
              GROUP BY label
              HAVING label IS NOT NULL AND TRIM(label) <> ''
              ORDER BY label ASC;
            `;
            queryParams = [columnName, columnName, columnName];
        }

        console.log(`[STATS] Generating SQL for ${columnName}:`, sql);
        console.log("[STATS] Params:", queryParams);
        const [results] = await db.query(sql, queryParams);

        const labels: (string | number)[] = [];
        const data: number[] = [];

        if (Array.isArray(results)) {
            if (columnName === 'salary') {
                const order = Object.keys(SALARY_RANGES);
                (results as any[]).sort((a, b) => {
                    const indexA = order.indexOf(String(a.label));
                    const indexB = order.indexOf(String(b.label));
                    if (indexA === -1 && indexB === -1) return 0;
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });
            }

            results.forEach((row: any) => {
                 if (row.label !== null && row.label !== undefined && String(row.label).trim() !== '') {
                    labels.push(row.label);
                    data.push(row.count);
                } else {
                     console.warn("[STATS] Ligne de résultat ignorée (label null/undefined/vide):", row);
                }
            });
        } else {
             console.warn("[STATS] Résultat de la requête non-conforme (attendu: tableau):", results);
        }

        console.log(`[STATS] Stats pour ${columnName}: ${labels.length} groupes trouvés.`);
        res.status(200).json({ labels, data });

    } catch (error) {
        console.error(`[STATS] Erreur serveur lors du calcul des stats pour ${columnName}:`, error);
        res.status(500).json({ error: 'Erreur serveur lors du calcul des statistiques.' });
    }
});


app.get('/api/teams/details/:teamName', async (req: Request, res: Response) => {
    const teamName = req.params.teamName;
    const decodedTeamName = decodeURIComponent(teamName);

    console.log(`[TEAM DETAILS] Request received for team: "${decodedTeamName}"`);

    if (!decodedTeamName) {
        return res.status(400).json({ error: 'Nom de l\'équipe manquant.' });
    }

    const sqlPositionStats = `
        SELECT
            CASE
                WHEN position IS NULL OR TRIM(position) = '' THEN '(Non spécifié)'
                ELSE TRIM(position)
            END AS position,
            COUNT(*) AS playerCount,
            AVG(salary) AS averageSalary,
            AVG(age) AS averageAge
        FROM
            players
        WHERE
             TRIM(LOWER(team)) = TRIM(LOWER(?))
             AND salary IS NOT NULL
             AND age IS NOT NULL
        GROUP BY
            position
        ORDER BY
            CASE position
                WHEN 'PG' THEN 1 WHEN 'SG' THEN 2 WHEN 'SF' THEN 3
                WHEN 'PF' THEN 4 WHEN 'C' THEN 5 ELSE 6
            END,
            position ASC;
    `;

    // Nouvelle requête pour les moyennes globales de l'équipe
    const sqlOverallStats = `
        SELECT
            AVG(age) AS overallAverageAge,
            AVG(salary) AS overallAverageSalary
        FROM
            players
        WHERE
             TRIM(LOWER(team)) = TRIM(LOWER(?))
             AND salary IS NOT NULL
             AND age IS NOT NULL;
    `;

    try {
        console.log("[TEAM DETAILS] Fetching per-position stats for:", decodedTeamName);
        const [positionResults] = await db.query(sqlPositionStats, [decodedTeamName]);

        console.log("[TEAM DETAILS] Fetching overall team stats for:", decodedTeamName);
        const [overallResults] = await db.query(sqlOverallStats, [decodedTeamName]);

        // Traitement des stats par position
        const positionRows = positionResults as {
            position: string;
            playerCount: number;
            averageSalary: string | null;
            averageAge: string | null;
        }[];

        const positionStats: {
            position: string;
            playerCount: number;
            averageSalary: number | null;
            averageAge: number | null;
        }[] = Array.isArray(positionRows) ? positionRows.map(row => ({
             position: row.position,
             playerCount: Number(row.playerCount),
             averageSalary: row.averageSalary !== null ? parseFloat(row.averageSalary) : null,
             averageAge: row.averageAge !== null ? parseFloat(row.averageAge) : null,
        })) : [];

        const labels: string[] = [];
        const playerCounts: number[] = [];
        const averageAges: (number | null)[] = [];
        const averageSalaries: (number | null)[] = [];

        positionStats.forEach(stat => {
            labels.push(stat.position);
            playerCounts.push(stat.playerCount);
            averageAges.push(stat.averageAge);
            averageSalaries.push(stat.averageSalary);
        });

        // Traitement des stats globales
        let overallAverageAge: number | null = null;
        let overallAverageSalary: number | null = null;

        if (Array.isArray(overallResults) && overallResults.length > 0) {
            const overallRow = overallResults[0] as { overallAverageAge: string | null, overallAverageSalary: string | null };
            overallAverageAge = overallRow.overallAverageAge !== null ? parseFloat(overallRow.overallAverageAge) : null;
            overallAverageSalary = overallRow.overallAverageSalary !== null ? parseFloat(overallRow.overallAverageSalary) : null;
        }

        console.log(`[TEAM DETAILS] Data prepared for ${decodedTeamName}: Positions=${labels.length}, Overall Age=${overallAverageAge}, Overall Salary=${overallAverageSalary}`);

        // Envoyer toutes les données
        res.status(200).json({
             teamName: decodedTeamName,
             labels: labels,
             playerCounts: playerCounts,
             averageAges: averageAges,
             averageSalaries: averageSalaries,
             overallAverageAge: overallAverageAge,
             overallAverageSalary: overallAverageSalary
        });

    } catch (error) {
        console.error(`[TEAM DETAILS] Error fetching details for team "${decodedTeamName}":`, error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des détails de l\'équipe.' });
    }
});

app.get('/api/players/filter', async (req: Request, res: Response) => {
    const { property, value, team } = req.query;

    if (typeof property !== 'string' || !property || typeof value !== 'string') {
         console.warn(`[FILTER] Tentative de filtre invalide: property=${property}, value=${value}`);
         return res.status(400).json({ error: 'Les paramètres "property" (string non vide) et "value" (string) sont requis.' });
    }

    if (team !== undefined && typeof team !== 'string') {
        console.warn(`[FILTER] Paramètre 'team' invalide (doit être string): ${team}`);
        return res.status(400).json({ error: 'Le paramètre "team" doit être une chaîne de caractères.' });
    }

    const propertyLower = property.toLowerCase();

    if (!ALLOWED_FILTER_PROPERTIES.includes(propertyLower)) {
        console.warn(`[FILTER] Tentative de filtre sur propriété non autorisée: ${propertyLower}`);
        return res.status(400).json({ error: `Filtrage par propriété "${property}" non autorisé.` });
    }

    const columnName = propertyLower;
    const selectColumns = 'id, name, age, position, team, college, height, number, weight, salary';
    const whereConditions: string[] = [];
    const queryParams: any[] = [];

    try {
        if (columnName === 'salary') {
            const rangeLabel = value;
            const rangeBounds = SALARY_RANGES[rangeLabel];

            if (rangeBounds) {
                const [min, max] = rangeBounds;
                if (min !== null) {
                    whereConditions.push('salary >= ?');
                    queryParams.push(min);
                }
                if (max !== null) {
                    whereConditions.push('salary <= ?');
                    queryParams.push(max);
                }
                if (min === null && max === null) {
                    whereConditions.push('salary IS NULL');
                } else if (whereConditions.length > 0) {
                    whereConditions.push('salary IS NOT NULL');
                }
            } else {
                 console.warn(`[FILTER] Intervalle de salaire inconnu demandé: "${rangeLabel}"`);
                 return res.status(200).json([]);
            }
        }
        else if (['position', 'team', 'college', 'height', 'weight'].includes(columnName) && value === '(Non spécifié)') {
             whereConditions.push(`(TRIM(??) IS NULL OR TRIM(??) = '')`);
             queryParams.push(columnName, columnName);
        }
        else {
            whereConditions.push(`TRIM(??) = TRIM(?)`);
            queryParams.push(columnName, value);
        }

        if (typeof team === 'string' && team.trim() !== '') {
            whereConditions.push(`TRIM(LOWER(team)) = TRIM(LOWER(?))`);
            queryParams.push(team);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const sql = `SELECT ${selectColumns} FROM players ${whereClause} ORDER BY name ASC`;

        console.log("[FILTER] SQL Final:", sql);
        console.log("[FILTER] Params:", queryParams);
        const [filteredPlayers] = await db.query(sql, queryParams);

        const playersResult = Array.isArray(filteredPlayers) ? filteredPlayers : [];

        console.log(`[FILTER] Query Params: property=${property}, value=${value}, team=${team || 'N/A'}. Joueurs trouvés: ${playersResult.length}`);
        res.status(200).json(playersResult);

    } catch (error) {
        console.error(`[FILTER] Erreur pour property=${property}, value="${value}", team=${team || 'N/A'}:`, error);
        res.status(500).json({ error: 'Erreur serveur lors du filtrage des joueurs.' });
    }
})

app.get('/api/teams/details/:teamName', async (req: Request, res: Response) => {
    const teamName = req.params.teamName;
    const decodedTeamName = decodeURIComponent(teamName);

    console.log(`[TEAM DETAILS] Request received for team: "${decodedTeamName}"`);

    if (!decodedTeamName) {
        return res.status(400).json({ error: 'Nom de l\'équipe manquant.' });
    }

    const sql = `
        SELECT
            CASE
                WHEN position IS NULL OR TRIM(position) = '' THEN '(Non spécifié)'
                ELSE TRIM(position)
            END AS position,
            COUNT(*) AS playerCount,
            AVG(salary) AS averageSalary,
            AVG(age) AS averageAge
        FROM
            players
        WHERE
             TRIM(LOWER(team)) = TRIM(LOWER(?))
             AND salary IS NOT NULL
             AND age IS NOT NULL
        GROUP BY
            position
        ORDER BY
            CASE position
                WHEN 'PG' THEN 1
                WHEN 'SG' THEN 2
                WHEN 'SF' THEN 3
                WHEN 'PF' THEN 4
                WHEN 'C' THEN 5
                ELSE 6
            END,
            position ASC;
    `;

    try {
        console.log("[TEAM DETAILS] Executing SQL for team:", decodedTeamName);
        const [results] = await db.query(sql, [decodedTeamName]);

        const rows = results as {
            position: string;
            playerCount: number;
            averageSalary: string | null;
            averageAge: string | null;
        }[];

        const positionStats: {
            position: string;
            playerCount: number;
            averageSalary: number | null;
            averageAge: number | null;
        }[] = Array.isArray(rows) ? rows.map(row => ({
             position: row.position,
             playerCount: Number(row.playerCount),
             averageSalary: row.averageSalary !== null ? parseFloat(row.averageSalary) : null,
             averageAge: row.averageAge !== null ? parseFloat(row.averageAge) : null,
        })) : [];

        console.log(`[TEAM DETAILS] Raw stats for ${decodedTeamName}: ${positionStats.length} positions found.`);

        const labels: string[] = [];
        const playerCounts: number[] = [];
        const averageAges: (number | null)[] = [];
        const averageSalaries: (number | null)[] = [];

        positionStats.forEach(stat => {
            labels.push(stat.position);
            playerCounts.push(stat.playerCount);
            averageAges.push(stat.averageAge);
            averageSalaries.push(stat.averageSalary);
        });

        console.log(`[TEAM DETAILS] Data transformed for frontend`);

        res.status(200).json({
             teamName: decodedTeamName,
             labels: labels,
             playerCounts: playerCounts,
             averageAges: averageAges,
             averageSalaries: averageSalaries
        });

    } catch (error) {
        console.error(`[TEAM DETAILS] Error fetching details for team "${decodedTeamName}":`, error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des détails de l\'équipe.' });
    }
});

app.get('/api/teams/list', async (req: Request, res: Response) => {
    try {
        type TeamRow = { teamName: string };

        const [rows] = await db.query<RowDataPacket[]>(
          `
            SELECT DISTINCT TRIM(team) AS teamName
            FROM players
            WHERE team IS NOT NULL AND TRIM(team) != ''
            ORDER BY teamName ASC
          `
        );

        const teams = (rows as TeamRow[]).map(row => row.teamName);

        res.status(200).json(teams);

    } catch (error) {
        console.error('[TEAM LIST] Erreur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des équipes.' });
    }
});

app.get('/api/colleges/list', async (req: Request, res: Response) => {
    try {
        type CollegeRow = { collegeName: string };

        const [rows] = await db.query<RowDataPacket[]>(
          `
            SELECT DISTINCT TRIM(college) AS collegeName
            FROM players
            WHERE college IS NOT NULL AND TRIM(college) != ''
            ORDER BY collegeName ASC
          `
        );

        const colleges = (rows as CollegeRow[]).map(row => row.collegeName);

        res.status(200).json(colleges);

    } catch (error) {
        console.error('[COLLEGE LIST] Erreur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des collèges.' });
    }
});


app.get('/api/players/all', async (req: Request, res: Response) => {
    try {
        const sql = 'SELECT id, name, age, position, team, college, height, number, weight, salary FROM players ORDER BY name ASC';
        console.log("[ALL PLAYERS] SQL:", sql);
        const [allPlayers] = await db.query(sql);
        const playersResult = Array.isArray(allPlayers) ? allPlayers : [];
        console.log(`[ALL PLAYERS] Found ${playersResult.length} players.`);
        res.status(200).json(playersResult);
    } catch (error) {
        console.error('[ALL PLAYERS] Error fetching all players:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération de tous les joueurs.' });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur http://localhost:${PORT}`);
    console.log(`-> API Stats: /api/players/stats/{propriete}`);
    console.log(`-> API Filtre: /api/players/filter?property={propriete}&value={valeur}&team={nomEquipe?}`);
    console.log(`-> API Teams List: /api/teams/list`);
    console.log(`-> API Colleges List: /api/colleges/list`);
    console.log(`-> API All Players: /api/players/all`);
});