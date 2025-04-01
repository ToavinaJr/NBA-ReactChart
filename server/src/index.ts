// import express from 'express';
// import db from './db'; // Votre connexion à la base de données
// import cors from 'cors';

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // --- Route pour les statistiques agrégées (pour le graphique) ---
// app.get('/api/players/stats/:targetProperty', async (req, res) => {
//   const targetProperty = req.params.targetProperty.toLowerCase();
//   // *** AJOUTÉ: 'salary' aux propriétés autorisées ***
//   const allowedProperties = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];

//   if (!allowedProperties.includes(targetProperty)) {
//     return res.status(400).json({ error: 'Propriété invalide pour les statistiques' });
//   }
//   const columnName = targetProperty; // Le nom de colonne correspond après validation

//   try {
//     // La requête SQL fonctionne pour les nombres et les chaînes
//     // L'ordre ORDER BY label ASC triera les salaires numériquement
//     const sql = `
//       SELECT ?? AS label, COUNT(*) AS count
//       FROM players
//       WHERE ?? IS NOT NULL AND ?? <> '' -- Exclure NULL et chaînes vides (le cas '' est moins pertinent pour salary)
//       GROUP BY ??
//       ORDER BY label ASC;
//     `;
//     // Utilisation de db.query avec des placeholders pour la sécurité
//     const [results] = await db.query(sql, [columnName, columnName, columnName, columnName]);

//     const labels: (string | number)[] = [];
//     const data: number[] = [];

//     if (Array.isArray(results)) {
//       results.forEach((row: any) => {
//         // S'assurer que les salaires sont renvoyés comme nombres si possible
//         const labelValue = (columnName === 'salary' && typeof row.label === 'string')
//                            ? parseFloat(row.label) // Tenter de convertir en nombre si c'est une chaîne
//                            : row.label;
//          // Si la conversion échoue ou si ce n'était pas une chaîne, on garde la valeur originale
//         labels.push(isNaN(labelValue as number) ? row.label : labelValue);
//         data.push(row.count);
//       });
//     } else {
//       console.warn("Le résultat de la requête stats n'est pas un tableau:", results);
//     }

//     console.log(`Stats pour ${columnName}: ${labels.length} groupes trouvés.`);
//     res.json({ labels, data });

//   } catch (error) {
//     console.error(`Erreur lors de la récupération des statistiques pour ${columnName}:`, error);
//     res.status(500).json({ error: 'Erreur serveur lors du calcul des statistiques' });
//   }
// });

// // --- NOUVELLE ROUTE : Récupérer les joueurs filtrés par propriété/valeur ---
// app.get('/api/players/filter', async (req, res) => {
//   const { property, value } = req.query;

//   if (typeof property !== 'string' || typeof value !== 'string') {
//     return res.status(400).json({ error: 'Les paramètres "property" et "value" sont requis et doivent être des chaînes.' });
//   }

//   const propertyLower = property.toLowerCase();
//   // *** AJOUTÉ: 'salary' aux propriétés de filtrage autorisées ***
//   const allowedFilterProperties = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];

//   if (!allowedFilterProperties.includes(propertyLower)) {
//     return res.status(400).json({ error: `Filtrage par propriété "${property}" non autorisé.` });
//   }

//   const columnName = propertyLower; // Nom de colonne validé

//   try {
//     // Utiliser des placeholders ?? pour la colonne et ? pour la valeur
//     // La base de données devrait gérer la comparaison même si 'value' est une chaîne représentant un nombre
//     const sql = 'SELECT * FROM players WHERE ?? = ? ORDER BY name ASC'; // Ajout d'un tri pour la cohérence
//     const [filteredPlayers] = await db.query(sql, [columnName, value]);

//     console.log(`Filtrage pour ${columnName} = "${value}", Joueurs trouvés:`, Array.isArray(filteredPlayers) ? filteredPlayers.length : 0);
//     res.json(filteredPlayers);

//   } catch (error) {
//     console.error(`Erreur lors du filtrage des joueurs pour ${columnName} = "${value}":`, error);
//     res.status(500).json({ error: 'Erreur serveur lors du filtrage des joueurs.' });
//   }
// });


// const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(`Serveur démarré sur le port ${PORT}`);
// });

// server/index.ts
import express from 'express';
import db from './db';
import cors from 'cors';
import mysql from 'mysql2/promise'; // Import si vous utilisez mysql2 pour les fonctions SQL

const app = express();

app.use(cors());
app.use(express.json());

// --- Constante pour les intervalles (pour la cohérence) ---
// Clé: Label affiché, Valeur: [min, max] (null pour pas de limite)
const SALARY_RANGES: Record<string, [number | null, number | null]> = {
    "< 1M": [0, 999999],
    "1M - 5M": [1000000, 4999999],
    "5M - 10M": [5000000, 9999999],
    "10M - 20M": [10000000, 19999999],
    "20M+": [20000000, null], // null signifie pas de limite supérieure
    // "(Non renseigné)": [null, null] // Si on voulait traiter les NULLs explicitement
};

// Helper pour obtenir le label de la tranche pour un salaire donné
const getSalaryRangeLabel = (salary: number | null | undefined): string | null => {
    if (salary === null || salary === undefined) return null; // Ou return "(Non renseigné)";
    for (const label in SALARY_RANGES) {
        const [min, max] = SALARY_RANGES[label];
        const minOk = (min === null || salary >= min);
        const maxOk = (max === null || salary <= max);
        if (minOk && maxOk) {
            return label;
        }
    }
    return null; // Ne devrait pas arriver si les ranges couvrent tout
};

// --- Route pour les statistiques agrégées ---
app.get('/api/players/stats/:targetProperty', async (req, res) => {
    const targetProperty = req.params.targetProperty.toLowerCase();
    const allowedProperties = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];

    if (!allowedProperties.includes(targetProperty)) {
        return res.status(400).json({ error: 'Propriété invalide pour les statistiques' });
    }

    const columnName = targetProperty;

    try {
        let sql: string;
        let queryParams: (string | number)[] = [columnName, columnName, columnName, columnName];

        // *** SPÉCIFIQUE POUR SALARY ***
        if (columnName === 'salary') {
            // Construire l'instruction CASE dynamiquement
            let caseStatement = 'CASE';
            let orderMap: Record<string, number> = {}; // Pour trier les labels logiquement
            let orderIndex = 0;

            for (const label in SALARY_RANGES) {
                const [min, max] = SALARY_RANGES[label];
                if (min !== null && max !== null) {
                    caseStatement += ` WHEN salary >= ? AND salary <= ? THEN ?`;
                    queryParams.push(min, max, label);
                } else if (min !== null && max === null) { // Cas X+
                    caseStatement += ` WHEN salary >= ? THEN ?`;
                    queryParams.push(min, label);
                } else if (min === null && max !== null) { // Cas < X (improbable ici, mais complet)
                    caseStatement += ` WHEN salary <= ? THEN ?`;
                    queryParams.push(max, label);
                }
                 // Assigner un ordre numérique pour le tri
                 orderMap[label] = orderIndex++;
            }
            caseStatement += ' ELSE NULL END'; // Gérer les cas non couverts (ou NULL)

            // Remplacer les ?? par la colonne salary et le CASE statement
            sql = `
              SELECT
                ${caseStatement} AS label,
                COUNT(*) AS count
              FROM players
              WHERE salary IS NOT NULL -- Exclure les salaires non renseignés du graphique
              GROUP BY label
              HAVING label IS NOT NULL -- Exclure le groupe NULL potentiel du CASE
              ORDER BY MIN(salary) ASC; -- Trier par le salaire minimum de chaque groupe
            `;
            // Les queryParams contiennent maintenant les bornes et les labels pour le CASE
            queryParams = queryParams.slice(4); // Enlever les 4 premiers ?? placeholders non utilisés

        } else {
             // Requête standard pour les autres propriétés
            sql = `
              SELECT ?? AS label, COUNT(*) AS count
              FROM players
              WHERE ?? IS NOT NULL AND ?? <> ''
              GROUP BY ??
              ORDER BY label ASC;
            `;
             // queryParams reste [columnName, columnName, columnName, columnName]
        }


        // Exécuter la requête
        console.log("SQL Stats:", sql);
        console.log("Params Stats:", queryParams);
        const [results] = await db.query(sql, queryParams);

        const labels: (string | number)[] = [];
        const data: number[] = [];

        if (Array.isArray(results)) {
           // Si c'était le salaire, on peut vouloir trier les labels selon notre ordre défini
           if (columnName === 'salary') {
               results.sort((a: any, b: any) => {
                   // Utiliser l'ordre défini dans SALARY_RANGES si possible
                   const orderA = Object.keys(SALARY_RANGES).indexOf(a.label);
                   const orderB = Object.keys(SALARY_RANGES).indexOf(b.label);
                   return orderA - orderB;
               });
           }

            results.forEach((row: any) => {
                if (row.label !== null) { // S'assurer de ne pas inclure de groupe NULL
                    labels.push(row.label);
                    data.push(row.count);
                }
            });
        } else {
            console.warn("Le résultat de la requête stats n'est pas un tableau:", results);
        }

        console.log(`Stats pour ${columnName}: ${labels.length} groupes trouvés.`);
        res.json({ labels, data });

    } catch (error) {
        console.error(`Erreur lors de la récupération des statistiques pour ${columnName}:`, error);
        res.status(500).json({ error: 'Erreur serveur lors du calcul des statistiques' });
    }
});

// --- Route pour récupérer les joueurs filtrés ---
app.get('/api/players/filter', async (req, res) => {
    const { property, value } = req.query;

    if (typeof property !== 'string' || typeof value !== 'string') {
        return res.status(400).json({ error: 'Les paramètres "property" et "value" sont requis et doivent être des chaînes.' });
    }

    const propertyLower = property.toLowerCase();
    const allowedFilterProperties = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];

    if (!allowedFilterProperties.includes(propertyLower)) {
        return res.status(400).json({ error: `Filtrage par propriété "${property}" non autorisé.` });
    }

    const columnName = propertyLower;
    let sql: string;
    let queryParams: (string | number | null)[]; // Autoriser null pour les bornes

    try {
        // *** SPÉCIFIQUE POUR SALARY ***
        if (columnName === 'salary') {
            const rangeLabel = value; // La valeur est maintenant le label de la tranche, ex: "1M - 5M"
            const rangeBounds = SALARY_RANGES[rangeLabel];

            if (!rangeBounds) {
                 return res.status(400).json({ error: `Intervalle de salaire inconnu: "${rangeLabel}"` });
            }

            const [min, max] = rangeBounds;
            let whereClause = 'WHERE salary IS NOT NULL'; // Commencer par exclure les NULL
            queryParams = [];

            if (min !== null) {
                whereClause += ' AND salary >= ?';
                queryParams.push(min);
            }
            if (max !== null) {
                whereClause += ' AND salary <= ?';
                queryParams.push(max);
            }
            // Si min et max sont null (pour "(Non renseigné)"), la requête serait WHERE salary IS NULL
            // if (min === null && max === null) {
            //    whereClause = 'WHERE salary IS NULL';
            //    queryParams = [];
            // }

            sql = `SELECT * FROM players ${whereClause} ORDER BY name ASC`;

        } else {
            // Filtrage standard pour les autres propriétés
            sql = 'SELECT * FROM players WHERE ?? = ? ORDER BY name ASC';
            queryParams = [columnName, value];
        }

        console.log("SQL Filter:", sql);
        console.log("Params Filter:", queryParams);
        const [filteredPlayers] = await db.query(sql, queryParams);

        console.log(`Filtrage pour ${columnName} = "${value}", Joueurs trouvés:`, Array.isArray(filteredPlayers) ? filteredPlayers.length : 0);
        res.json(filteredPlayers);

    } catch (error) {
        console.error(`Erreur lors du filtrage des joueurs pour ${columnName} = "${value}":`, error);
        res.status(500).json({ error: 'Erreur serveur lors du filtrage des joueurs.' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});