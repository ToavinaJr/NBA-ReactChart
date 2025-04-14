import express, { Request, Response } from 'express';
import db from './db'; // Assurez-vous que ce chemin est correct
import cors from 'cors';

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
    // "(Non renseigné)": [null, null] // Pourrait être ajouté si besoin
};

// Propriétés autorisées pour les stats agrégées
const ALLOWED_STATS_PROPERTIES = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];
// Propriétés autorisées pour le filtrage DÉTAILLÉ via l'API /filter
const ALLOWED_FILTER_PROPERTIES = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];

// --- Route pour les statistiques agrégées (/api/players/stats/...) ---
// (Cette partie reste inchangée par rapport à votre code original)
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
                 // Gérer le cas pour les salaires NULL si un label est défini
                 // else if (min === null && max === null) { // Correspond au label "(Non renseigné)"
                 //    caseStatement += ` WHEN salary IS NULL THEN ?`;
                 //    queryParams.push(label);
                 // }
            }
            // Gérer les salaires hors tranches (si besoin) ou les NULLs non explicitement gérés
            // caseStatement += ' ELSE "Autre" END'; // Optionnel: catégorie "Autre"
            caseStatement += ' ELSE NULL END'; // Optionnel: exclure ceux hors tranches définies et les NULLs non gérés

            sql = `
              SELECT
                ${caseStatement} AS label,
                COUNT(*) AS count
              FROM players
              -- WHERE clause pour exclure les NULLs si pas gérés par un label spécifique
              WHERE salary IS NOT NULL OR (? IN (SELECT label FROM (SELECT ${caseStatement} as label FROM players) as sub WHERE label IS NOT NULL)) -- Inclure si un label NULL existe
              GROUP BY label
              HAVING label IS NOT NULL -- Exclure les groupes correspondant à 'ELSE NULL'
              -- ORDER BY MIN(salary) ASC; -- Tentative de tri par la valeur min de la tranche, peut être complexe
              -- Il est plus simple de trier côté frontend basé sur l'ordre de SALARY_RANGES
            `;
            // Si un label "(Non renseigné)" existe, on le passe en paramètre pour le WHERE
            // const nonRenseigneLabel = Object.keys(SALARY_RANGES).find(k => SALARY_RANGES[k][0] === null && SALARY_RANGES[k][1] === null);
            // queryParams.push(nonRenseigneLabel || null); // Ajoute le label ou null

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
    if (typeof property !== 'string' || !property || typeof value !== 'string' /* value peut être vide mais doit être string */) {
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
            const rangeLabel = value; // La valeur est le label de la tranche (ex: "1M - 5M")
            const rangeBounds = SALARY_RANGES[rangeLabel];

            if (!rangeBounds) {
                console.warn(`[FILTER] Intervalle de salaire inconnu demandé: "${rangeLabel}"`);
                // Retourner une liste vide si la tranche est inconnue plutôt qu'une erreur 400 ?
                // return res.status(400).json({ error: `Intervalle de salaire inconnu: "${rangeLabel}"` });
                return res.status(200).json([]); // Renvoie une liste vide
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
            // --- Logique de filtrage standard pour les AUTRES PROPRIÉTÉS ---
            // Utilise TRIM() sur la colonne ET la valeur pour une comparaison robuste
            // (utile si les données ou la valeur cliquée peuvent avoir des espaces)
            sql = `SELECT ${selectColumns} FROM players WHERE TRIM(??) = TRIM(?) ORDER BY name ASC`;
            queryParams = [columnName, value];
        }

        // Exécuter la requête de filtrage
        console.log("[FILTER] SQL:", sql);
        console.log("[FILTER] Params:", queryParams);
        const [filteredPlayers] = await db.query(sql, queryParams);

        // Assurer que la réponse est toujours un tableau
        const playersResult = Array.isArray(filteredPlayers) ? filteredPlayers : [];

        console.log(`[FILTER] Filtrage pour ${columnName} = "${value}", Joueurs trouvés: ${playersResult.length}`);
        res.status(200).json(playersResult); // Envoyer le tableau (potentiellement vide) de joueurs

    } catch (error) {
        console.error(`[FILTER] Erreur pour ${columnName} = "${value}":`, error);
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