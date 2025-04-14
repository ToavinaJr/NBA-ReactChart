import express, { Request, Response } from 'express';
import db from './db';
import cors from 'cors';
import { RowDataPacket } from 'mysql2';

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Constantes ---
const SALARY_RANGES: Record<string, [number | null, number | null]> = {
    "< 1M": [0, 999999],
    "1M - 5M": [1000000, 4999999],
    "5M - 10M": [5000000, 9999999],
    "10M - 20M": [10000000, 19999999],
    "20M+": [20000000, null],
};


const ALLOWED_STATS_PROPERTIES = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];
const ALLOWED_FILTER_PROPERTIES = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];


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

            // Construction dynamique du CASE pour les tranches de salaire
            for (const label in SALARY_RANGES) {
                const [min, max] = SALARY_RANGES[label];
                if (min !== null && max !== null) {
                    caseStatement += ` WHEN salary >= ? AND salary <= ? THEN ?`;
                    queryParams.push(min, max, label);
                } else if (min !== null && max === null) {
                    caseStatement += ` WHEN salary >= ? THEN ?`;
                    queryParams.push(min, label);
                }
                 // Gérer le cas où min est null et max non null (moins probable ici)
                 else if (min === null && max !== null) {
                    caseStatement += ` WHEN salary <= ? THEN ?`;
                    queryParams.push(max, label);
                 }
            }
            caseStatement += ' ELSE NULL END'; // Optionnel: exclure ceux hors tranches définies et les NULLs non gérés

            sql = `
              SELECT
                ${caseStatement} AS label,
                COUNT(*) AS count
              FROM players
              -- WHERE clause pour exclure les NULLs si pas gérés par un label spécifique
              WHERE salary IS NOT NULL
              GROUP BY label
              HAVING label IS NOT NULL -- Exclure les groupes correspondant à 'ELSE NULL'
              -- ORDER BY MIN(salary) ASC; -- Tentative de tri par la valeur min de la tranche, peut être complexe
              -- Il est plus simple de trier côté frontend basé sur l'ordre de SALARY_RANGES
            `;

        } else {
            // Logique pour les autres propriétés (Age, Position, Team, etc.)
            sql = `
              SELECT
                TRIM(??) AS label, -- Nettoyer les espaces
                COUNT(*) AS count
              FROM players
              WHERE ?? IS NOT NULL AND TRIM(??) <> '' -- Exclure NULLs et chaînes vides après trim
              GROUP BY label
              ORDER BY label ASC;
            `;
            queryParams = [columnName, columnName, columnName];
        }

        console.log("[STATS] SQL:", sql);
        console.log("[STATS] Params:", queryParams);
        const [results] = await db.query(sql, queryParams);

        const labels: (string | number)[] = [];
        const data: number[] = [];

        if (Array.isArray(results)) {
            // Tri spécifique pour le salaire basé sur l'ordre défini dans SALARY_RANGES
            if (columnName === 'salary') {
                const order = Object.keys(SALARY_RANGES);
                (results as any[]).sort((a, b) => {
                    const indexA = order.indexOf(a.label);
                    const indexB = order.indexOf(b.label);
                    if (indexA === -1) return 1; // Mettre les inconnus à la fin
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });
            }

            results.forEach((row: any) => {
                if (row.label !== null && row.label !== undefined) {
                    labels.push(row.label);
                    data.push(row.count);
                } else {
                     console.warn("[STATS] Ligne de résultat ignorée (label null/undefined):", row);
                }
            });
        } else {
             console.warn("[STATS] Résultat de la requête non-conforme (attendu: tableau):", results);
        }

        console.log(`[STATS] Stats pour ${columnName}: ${labels.length} groupes trouvés.`);
        res.status(200).json({ labels, data });

    } catch (error) {
        console.error(`[STATS] Erreur pour ${columnName}:`, error);
        res.status(500).json({ error: 'Erreur serveur lors du calcul des statistiques.' });
    }
});

// --- Route pour récupérer les joueurs filtrés (/api/players/filter?property=...&value=...) ---
// C'EST CETTE ROUTE QUI EFFECTUE LE FILTRAGE POUR LE MODAL
app.get('/api/players/filter', async (req: Request, res: Response) => {
    const { property, value } = req.query;

    // Validation des paramètres (essentielle)
    if (typeof property !== 'string' || !property || typeof value !== 'string') {
         console.warn(`[FILTER] Tentative de filtre invalide: property=${property}, value=${value}`);
         return res.status(400).json({ error: 'Les paramètres "property" (string non vide) et "value" (string) sont requis.' });
    }

    const propertyLower = property.toLowerCase();

    // Validation de la propriété autorisée pour le filtrage
    if (!ALLOWED_FILTER_PROPERTIES.includes(propertyLower)) {
        console.warn(`[FILTER] Tentative de filtre sur propriété non autorisée: ${propertyLower}`);
        return res.status(400).json({ error: `Filtrage par propriété "${property}" non autorisé.` });
    }

    const columnName = propertyLower; // Nom de colonne validé
    let sql: string;
    // Utilisation de 'any[]' pour simplifier la gestion des types mixtes (string/number/null)
    let queryParams: any[] = [];

    try {
        // Sélection des colonnes nécessaires pour l'affichage dans le modal
        const selectColumns = 'id, name, age, position, team, college, height, number, weight, salary';

        // --- Logique de filtrage spécifique pour SALARY (basée sur la tranche/label) ---
        if (columnName === 'salary') {
            const rangeLabel = value;
            const rangeBounds = SALARY_RANGES[rangeLabel];

            if (!rangeBounds) {
                console.warn(`[FILTER] Intervalle de salaire inconnu demandé: "${rangeLabel}"`);
                return res.status(200).json([]);
            }

            const [min, max] = rangeBounds;
            let whereClauses: string[] = [];
            queryParams = []; // Réinitialiser les paramètres

            // Construire la clause WHERE dynamiquement
            if (min !== null) {
                whereClauses.push('salary >= ?');
                queryParams.push(min);
            }
            if (max !== null) {
                whereClauses.push('salary <= ?');
                queryParams.push(max);
            }
             // Gérer le cas spécial d'un label pour les NULLs
             if (min === null && max === null /* && rangeLabel === "(Non renseigné)" */) {
                 whereClauses = ['salary IS NULL']; // Remplace les autres clauses
                 queryParams = [];
             } else if (whereClauses.length > 0) {
                // S'assurer qu'on ne sélectionne pas les NULL quand on filtre sur une tranche numérique
                whereClauses.push('salary IS NOT NULL');
             }


            const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
            sql = `SELECT ${selectColumns} FROM players ${whereSql} ORDER BY name ASC`;

        } else {
            sql = `SELECT ${selectColumns} FROM players WHERE TRIM(??) = TRIM(?) ORDER BY name ASC`;
            queryParams = [columnName, value];
        }

        console.log("[FILTER] SQL:", sql);
        console.log("[FILTER] Params:", queryParams);
        const [filteredPlayers] = await db.query(sql, queryParams);

        const playersResult = Array.isArray(filteredPlayers) ? filteredPlayers : [];

        console.log(`[FILTER] Filtrage pour ${columnName} = "${value}", Joueurs trouvés: ${playersResult.length}`);
        res.status(200).json(playersResult); // Envoyer le tableau (potentiellement vide) de joueurs

    } catch (error) {
        console.error(`[FILTER] Erreur pour ${columnName} = "${value}":`, error);
        res.status(500).json({ error: 'Erreur serveur lors du filtrage des joueurs.' });
    }
});

// --- NOUVELLE ROUTE: Détails d'une équipe ---
app.get('/api/teams/details/:teamName', async (req: Request, res: Response) => {
    const teamName = req.params.teamName; // Get team name from URL parameter

    // Decode the team name in case it contains spaces or special characters
    const decodedTeamName = decodeURIComponent(teamName);

    console.log(`[TEAM DETAILS] Request received for team: "${decodedTeamName}"`);

    if (!decodedTeamName) {
        return res.status(400).json({ error: 'Nom de l\'équipe manquant.' });
    }

    // SQL Query to get counts and averages per position for the specified team
    const sql = `
        SELECT
            CASE
                WHEN position IS NULL OR TRIM(position) = '' THEN '(Non spécifié)' -- Group NULL/empty positions
                ELSE TRIM(position)
            END AS positionLabel,
            COUNT(*) AS playerCount,
            AVG(salary) AS averageSalary, -- AVG automatically ignores NULL salaries
            AVG(age) AS averageAge       -- AVG automatically ignores NULL ages
        FROM
            players
        WHERE
            -- Use LOWER and TRIM for robust matching
            TRIM(LOWER(team)) = TRIM(LOWER(?))
        GROUP BY
            positionLabel -- Group by the potentially modified position label
        ORDER BY
            -- Optional: Custom order for positions (e.g., PG, SG, SF, PF, C)
            CASE positionLabel
                WHEN 'PG' THEN 1
                WHEN 'SG' THEN 2
                WHEN 'SF' THEN 3
                WHEN 'PF' THEN 4
                WHEN 'C' THEN 5
                ELSE 6 -- Put others/unspecified at the end
            END,
            positionLabel ASC; -- Fallback alphabetical sort
    `;

    try {
        console.log("[TEAM DETAILS] SQL:", sql);
        console.log("[TEAM DETAILS] Params:", [decodedTeamName]);
        const [results] = await db.query(sql, [decodedTeamName]);

        if (!Array.isArray(results) || results.length === 0) {
             console.log(`[TEAM DETAILS] Aucune donnée trouvée pour l'équipe: "${decodedTeamName}"`);
             // Still return a 200 OK, but with empty data structure
             return res.status(200).json({
                 teamName: decodedTeamName,
                 labels: [],
                 playerCounts: [],
                 averageSalaries: [],
                 averageAges: []
             });
         }

        // Process results into separate arrays for Chart.js
        const labels: string[] = [];
        const playerCounts: number[] = [];
        const averageSalaries: (number | null)[] = []; // Allow null if AVG returns null (unlikely but possible)
        const averageAges: (number | null)[] = [];     // Allow null

        results.forEach((row: any) => {
            labels.push(row.positionLabel);
            playerCounts.push(row.playerCount || 0); // Default to 0 if somehow null
            // AVG might return a string representation or number, ensure it's a number or null
            averageSalaries.push(row.averageSalary !== null ? parseFloat(row.averageSalary) : null);
            averageAges.push(row.averageAge !== null ? parseFloat(row.averageAge) : null);
        });

        console.log(`[TEAM DETAILS] Data préparée pour ${decodedTeamName}: ${labels.length} positions trouvées.`);
        res.status(200).json({
            teamName: decodedTeamName, // Echo back the name for confirmation
            labels,
            playerCounts,
            averageSalaries,
            averageAges
        });

    } catch (error) {
        console.error(`[TEAM DETAILS] Erreur pour l'équipe "${decodedTeamName}":`, error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des détails de l\'équipe.' });
    }
});

// --- NOUVELLE ROUTE: Liste des équipes ---
app.get('/api/teams/list', async (req: Request, res: Response) => {
    try {

        type TeamRow = { teamName: string };
        
        // `query` renvoie un tuple : [rows, fields]
        const [rows] = await db.query<RowDataPacket[]>(
          `
            SELECT DISTINCT TRIM(team) AS teamName
            FROM players
            WHERE team IS NOT NULL AND TRIM(team) != ''
            ORDER BY teamName ASC
          `
        );
        
        // TypeScript ne sait pas que chaque RowDataPacket a `teamName`, on force ici :
        const teams = (rows as TeamRow[]).map(row => row.teamName);
        
        res.status(200).json(teams);
        

    } catch (error) {
        console.error('[TEAM LIST] Erreur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des équipes.' });
    }
});

// --- Route pour récupérer les joueurs filtrés (/api/players/filter?property=...&value=...[&team=...]) ---
app.get('/api/players/filter', async (req: Request, res: Response) => {
    // Récupérer les paramètres, y compris 'team' (nouveau)
    const { property, value, team } = req.query; // Ajouter 'team' ici

    // Validation des paramètres 'property' et 'value' (inchangée)
    if (typeof property !== 'string' || !property || typeof value !== 'string') {
         console.warn(`[FILTER] Tentative de filtre invalide: property=${property}, value=${value}, team=${team}`);
         return res.status(400).json({ error: 'Les paramètres "property" (string non vide) et "value" (string) sont requis.' });
    }
    // Validation du paramètre 'team' (s'il est fourni)
    if (team !== undefined && typeof team !== 'string') {
        console.warn(`[FILTER] Paramètre 'team' invalide (doit être string): ${team}`);
        return res.status(400).json({ error: 'Le paramètre "team" doit être une chaîne de caractères.' });
    }


    const propertyLower = property.toLowerCase();

    // Validation de la propriété autorisée (inchangée)
    if (!ALLOWED_FILTER_PROPERTIES.includes(propertyLower)) {
        console.warn(`[FILTER] Tentative de filtre sur propriété non autorisée: ${propertyLower}`);
        return res.status(400).json({ error: `Filtrage par propriété "${property}" non autorisé.` });
    }

    const columnName = propertyLower;
    let sql: string;
    let queryParams: any[] = [];
    // Utiliser un tableau pour construire dynamiquement les clauses WHERE
    const whereConditions: string[] = [];

    try {
        // Sélection des colonnes (inchangée)
        const selectColumns = 'id, name, age, position, team, college, height, number, weight, salary';

        // --- Logique spécifique pour SALARY (inchangée, mais sera combinée avec 'team') ---
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
                    whereConditions.push('salary IS NULL'); // Remplace les autres si label spécifique pour NULL
                } else if (whereConditions.length > 0) {
                    whereConditions.push('salary IS NOT NULL'); // Ne pas inclure NULL sauf si explicitement demandé
                }
            } else {
                // Si l'intervalle n'est pas trouvé, retourner un tableau vide (plutôt qu'une erreur)
                 console.warn(`[FILTER] Intervalle de salaire inconnu demandé: "${rangeLabel}"`);
                 return res.status(200).json([]);
            }
        }
        // --- Logique spécifique pour POSITION (ou autre propriété textuelle exacte) ---
        // Gérer le cas spécial '(Non spécifié)' envoyé par le frontend si on clique sur cette catégorie
        else if (columnName === 'position' && value === '(Non spécifié)') {
             whereConditions.push(`(TRIM(??) IS NULL OR TRIM(??) = '')`);
             queryParams.push(columnName, columnName); // Ajouter columnName deux fois pour les ??
        }
        // --- Logique générale pour les autres propriétés (égalité) ---
        else {
            whereConditions.push(`TRIM(??) = TRIM(?)`);
            queryParams.push(columnName, value);
        }

        // --- AJOUT DU FILTRE PAR ÉQUIPE (si le paramètre 'team' est fourni) ---
        if (typeof team === 'string' && team.trim() !== '') {
            whereConditions.push(`TRIM(LOWER(team)) = TRIM(LOWER(?))`); // Comparaison insensible à la casse et aux espaces
            queryParams.push(team); // Ajouter la valeur de team aux paramètres
        }
        // --- Fin de l'ajout du filtre par équipe ---

        // Construction finale de la requête SQL
        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        sql = `SELECT ${selectColumns} FROM players ${whereClause} ORDER BY name ASC`;


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
});

// --- Démarrage du serveur ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur http://localhost:${PORT}`);
    console.log(`-> API Stats: /api/players/stats/{propriete}`);
    console.log(`-> API Filtre: /api/players/filter?property={propriete}&value={valeur}`);
});