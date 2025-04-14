import express, { Request, Response } from 'express'; // Ajout des types Request, Response
import db from './db'; // Assurez-vous que ce chemin est correct pour votre connexion DB
import cors from 'cors';

const app = express();

// --- Middleware ---
app.use(cors()); // Activer CORS pour toutes les routes
app.use(express.json()); // Pour parser les corps de requête JSON

// --- Constantes ---

// Clé: Label affiché dans le frontend/graphique, Valeur: [min, max] (null pour pas de limite)
// Important: L'ordre des clés ici peut être utilisé pour trier les résultats si besoin
const SALARY_RANGES: Record<string, [number | null, number | null]> = {
    "< 1M": [0, 999999],
    "1M - 5M": [1000000, 4999999],
    "5M - 10M": [5000000, 9999999],
    "10M - 20M": [10000000, 19999999],
    "20M+": [20000000, null], // null signifie pas de limite supérieure
    // "(Non renseigné)": [null, null] // Décommenter si vous voulez une catégorie pour les NULLs
};

const ALLOWED_STATS_PROPERTIES = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];
const ALLOWED_FILTER_PROPERTIES = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary']; // Peut être identique ou différent

// --- Route pour les statistiques agrégées (/api/players/stats/...) ---
app.get('/api/players/stats/:targetProperty', async (req: Request, res: Response) => {
    const targetProperty = req.params.targetProperty.toLowerCase();

    // Validation de la propriété demandée
    if (!ALLOWED_STATS_PROPERTIES.includes(targetProperty)) {
        console.warn(`Tentative d'accès stats invalide: ${targetProperty}`);
        return res.status(400).json({ error: 'Propriété invalide pour les statistiques' });
    }

    const columnName = targetProperty; // Le nom de la colonne correspond au paramètre validé

    try {
        let sql: string;
        let queryParams: (string | number)[] = [];

        // --- Logique spécifique pour le SALAIRE ---
        if (columnName === 'salary') {
            // Construire l'instruction CASE dynamiquement basé sur SALARY_RANGES
            let caseStatement = 'CASE';
            queryParams = []; // Réinitialiser pour le salaire

            for (const label in SALARY_RANGES) {
                const [min, max] = SALARY_RANGES[label];
                if (min !== null && max !== null) { // Intervalle [min, max]
                    caseStatement += ` WHEN salary >= ? AND salary <= ? THEN ?`;
                    queryParams.push(min, max, label);
                } else if (min !== null && max === null) { // Intervalle [min, +∞)
                    caseStatement += ` WHEN salary >= ? THEN ?`;
                    queryParams.push(min, label);
                } else if (min === null && max !== null) { // Intervalle (-∞, max] (peu probable ici)
                    caseStatement += ` WHEN salary <= ? THEN ?`;
                    queryParams.push(max, label);
                }
                // Cas pour les NULLs (si "(Non renseigné)": [null, null] est défini)
                // else if (min === null && max === null) {
                //     caseStatement += ` WHEN salary IS NULL THEN ?`;
                //     queryParams.push(label);
                // }
            }
            // Gérer les salaires qui ne tombent dans aucune tranche définie (si besoin)
            // caseStatement += ' ELSE "Autre" END';
            // Ou exclure les salaires NULL explicitement si pas géré par un label dédié
             caseStatement += ' ELSE NULL END';

            sql = `
              SELECT
                ${caseStatement} AS label,
                COUNT(*) AS count
              FROM players
              WHERE salary IS NOT NULL -- Exclure les salaires non renseignés du comptage principal (sauf si géré par CASE)
              GROUP BY label
              HAVING label IS NOT NULL -- Exclure les groupes qui ne correspondent à aucun label (ceux du ELSE NULL)
              ORDER BY MIN(salary) ASC; -- Trier les tranches par leur valeur minimale
            `;
            // queryParams a été rempli dans la boucle for

        } else {
            // --- Logique CORRIGÉE pour les AUTRES PROPRIÉTÉS (Age, Position, Team, etc.) ---
            // Utilise TRIM() pour nettoyer les données textuelles (ignore espaces avant/après)
            sql = `
              SELECT
                TRIM(??) AS label, -- Sélectionne la valeur nettoyée
                COUNT(*) AS count
              FROM players
              WHERE ?? IS NOT NULL      -- Exclut les vrais NULL
                AND TRIM(??) <> ''    -- Exclut les chaînes vides APRÈS nettoyage (enlève aussi " ", "  ", etc.)
              GROUP BY label           -- Groupe par la valeur nettoyée (l'alias 'label')
              ORDER BY label ASC;      -- Trie alphabétiquement par label
            `;
            // Les paramètres sont les noms de colonnes, répétés pour chaque ??
            queryParams = [columnName, columnName, columnName];
        }

        // Exécuter la requête SQL
        console.log("SQL Stats:", sql);
        console.log("Params Stats:", queryParams);
        const [results] = await db.query(sql, queryParams);

        const labels: (string | number)[] = [];
        const data: number[] = [];

        // Vérifier si results est bien un tableau (attendu de db.query)
        if (Array.isArray(results)) {
             // Tri spécifique pour le salaire basé sur l'ordre de SALARY_RANGES (si SQL ORDER BY n'est pas suffisant)
             // Normalement, ORDER BY MIN(salary) devrait bien fonctionner.
             if (columnName === 'salary' && results.length > 0) {
                  results.sort((a: any, b: any) => {
                      const orderA = Object.keys(SALARY_RANGES).indexOf(a.label);
                      const orderB = Object.keys(SALARY_RANGES).indexOf(b.label);
                      if (orderA === -1) return 1; // Mettre les labels inconnus à la fin
                      if (orderB === -1) return -1;
                      return orderA - orderB; // Trier selon l'ordre défini dans SALARY_RANGES
                  });
              }

            // Formater les résultats pour la réponse JSON
            results.forEach((row: any) => {
                // Vérification supplémentaire, bien que HAVING/WHERE devrait déjà filtrer
                if (row.label !== null && row.label !== undefined) {
                    labels.push(row.label);
                    data.push(row.count);
                } else {
                    console.warn("Stat Row skipped due to null/undefined label:", row);
                }
            });
        } else {
            console.warn("Le résultat de la requête stats n'est pas un tableau:", results);
        }

        console.log(`Stats pour ${columnName}: ${labels.length} groupes trouvés.`);
        res.status(200).json({ labels, data }); // Envoyer les données formatées

    } catch (error) {
        console.error(`Erreur lors de la récupération des statistiques pour ${columnName}:`, error);
        res.status(500).json({ error: 'Erreur serveur lors du calcul des statistiques.' });
    }
});

// --- Route pour récupérer les joueurs filtrés (/api/players/filter?property=...&value=...) ---
app.get('/api/players/filter', async (req: Request, res: Response) => {
    const { property, value } = req.query;

    // Validation simple des paramètres de requête
    if (typeof property !== 'string' || !property || typeof value !== 'string' || value === undefined || value === null) {
         console.warn(`Tentative de filtre invalide: property=${property}, value=${value}`);
         return res.status(400).json({ error: 'Les paramètres "property" (string non vide) et "value" (string) sont requis.' });
    }

    const propertyLower = property.toLowerCase();

    // Validation de la propriété pour le filtre
    if (!ALLOWED_FILTER_PROPERTIES.includes(propertyLower)) {
        console.warn(`Tentative de filtre sur propriété non autorisée: ${propertyLower}`);
        return res.status(400).json({ error: `Filtrage par propriété "${property}" non autorisé.` });
    }

    const columnName = propertyLower; // Nom de colonne validé
    let sql: string;
    let queryParams: (string | number | null)[] = []; // Autoriser null pour les bornes de salaire

    try {
        // --- Logique spécifique pour filtrer par tranche de SALAIRE ---
        if (columnName === 'salary') {
            const rangeLabel = value; // La valeur est le label de la tranche (ex: "1M - 5M")
            const rangeBounds = SALARY_RANGES[rangeLabel];

            if (!rangeBounds) {
                console.warn(`Intervalle de salaire inconnu demandé pour filtre: "${rangeLabel}"`);
                return res.status(400).json({ error: `Intervalle de salaire inconnu: "${rangeLabel}"` });
            }

            const [min, max] = rangeBounds;
            let whereClause = 'WHERE salary IS NOT NULL'; // Commencer par exclure les NULLs
            queryParams = [];

            // Construire la clause WHERE dynamiquement
            if (min !== null) {
                whereClause += ' AND salary >= ?';
                queryParams.push(min);
            }
            if (max !== null) {
                whereClause += ' AND salary <= ?';
                queryParams.push(max);
            }
            // Si on avait un label pour les NULLs:
            // else if (min === null && max === null) {
            //     whereClause = 'WHERE salary IS NULL';
            //     queryParams = [];
            // }

            // Sélectionner toutes les colonnes nécessaires pour le modal frontend
            sql = `SELECT id, name, age, position, team, college, height, number, weight, salary
                   FROM players ${whereClause} ORDER BY name ASC`;

        } else {
            // --- Logique de filtrage standard pour les AUTRES PROPRIÉTÉS ---
            // Compare directement la colonne avec la valeur reçue (qui devrait être propre car issue du graphique)
            // Sélectionner toutes les colonnes nécessaires pour le modal frontend
            sql = `SELECT id, name, age, position, team, college, height, number, weight, salary
                   FROM players WHERE ?? = ? ORDER BY name ASC`;
            queryParams = [columnName, value];

            // Optionnel: Si on suspecte que `value` pourrait contenir des espaces non désirés
            // et que la colonne `columnName` peut aussi en avoir, utiliser TRIM des deux côtés :
            // sql = `SELECT * FROM players WHERE TRIM(??) = TRIM(?) ORDER BY name ASC`;
            // queryParams = [columnName, value];
        }

        // Exécuter la requête de filtrage
        console.log("SQL Filter:", sql);
        console.log("Params Filter:", queryParams);
        const [filteredPlayers] = await db.query(sql, queryParams);

        // Assurer que la réponse est toujours un tableau
        const playersResult = Array.isArray(filteredPlayers) ? filteredPlayers : [];

        console.log(`Filtrage pour ${columnName} = "${value}", Joueurs trouvés:`, playersResult.length);
        res.status(200).json(playersResult); // Envoyer le tableau de joueurs

    } catch (error) {
        console.error(`Erreur lors du filtrage des joueurs pour ${columnName} = "${value}":`, error);
        res.status(500).json({ error: 'Erreur serveur lors du filtrage des joueurs.' });
    }
});

// --- Démarrage du serveur ---
const PORT = process.env.PORT || 3001; // Utiliser variable d'env ou 3001 par défaut
app.listen(PORT, () => {
    console.log(`Serveur Express démarré sur le port ${PORT}`);
    console.log(`API Stats accessible sur: http://localhost:${PORT}/api/players/stats/{propriete}`);
    console.log(`API Filtre accessible sur: http://localhost:${PORT}/api/players/filter?property={propriete}&value={valeur}`);
});