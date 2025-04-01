// server/index.ts
import express from 'express';
import db from './db'; // Votre connexion à la base de données
import cors from 'cors';

const app = express();

// Middleware
app.use(cors()); // Autoriser toutes les origines (ajuster si nécessaire pour la production)
app.use(express.json());

// --- Route pour les statistiques agrégées (pour le graphique) ---
app.get('/api/players/stats/:targetProperty', async (req, res) => {
  const targetProperty = req.params.targetProperty.toLowerCase();
  const allowedProperties = ['age', 'position', 'team', 'college', 'height', 'number', 'weight'];

  if (!allowedProperties.includes(targetProperty)) {
    return res.status(400).json({ error: 'Propriété invalide pour les statistiques' });
  }
  const columnName = targetProperty;

  try {
    // Utiliser des placeholders ?? pour les noms de colonnes
    const sql = `
      SELECT ?? AS label, COUNT(*) AS count
      FROM players
      WHERE ?? IS NOT NULL AND ?? <> '' -- Exclure NULL et chaînes vides
      GROUP BY ??
      ORDER BY label ASC;
    `;
    const [results] = await db.query(sql, [columnName, columnName, columnName, columnName]);

    const labels: (string | number)[] = [];
    const data: number[] = [];

    if (Array.isArray(results)) {
      results.forEach((row: any) => {
        labels.push(row.label);
        data.push(row.count);
      });
    } else {
      console.warn("Le résultat de la requête stats n'est pas un tableau:", results);
    }
    res.json({ labels, data });

  } catch (error) {
    console.error(`Erreur lors de la récupération des statistiques pour ${columnName}:`, error);
    res.status(500).json({ error: 'Erreur serveur lors du calcul des statistiques' });
  }
});

// --- NOUVELLE ROUTE : Récupérer les joueurs filtrés par propriété/valeur ---
app.get('/api/players/filter', async (req, res) => {
  const { property, value } = req.query;

  // Validation essentielle
  if (typeof property !== 'string' || typeof value !== 'string') {
    return res.status(400).json({ error: 'Les paramètres "property" et "value" sont requis et doivent être des chaînes.' });
  }

  const propertyLower = property.toLowerCase();
  // Liste des colonnes sur lesquelles on AUTORISE le filtrage
  const allowedFilterProperties = ['age', 'position', 'team', 'college', 'height', 'number', 'weight'];
  if (!allowedFilterProperties.includes(propertyLower)) {
    return res.status(400).json({ error: `Filtrage par propriété "${property}" non autorisé.` });
  }

  const columnName = propertyLower; // Nom de colonne validé

  try {
    // Utiliser des placeholders ?? pour la colonne et ? pour la valeur
    const sql = 'SELECT * FROM players WHERE ?? = ?';
    const [filteredPlayers] = await db.query(sql, [columnName, value]);

    console.log(`Filtrage pour ${columnName} = "${value}", Joueurs trouvés:`, Array.isArray(filteredPlayers) ? filteredPlayers.length : 0);
    res.json(filteredPlayers); // Renvoyer le tableau (peut être vide)

  } catch (error) {
    console.error(`Erreur lors du filtrage des joueurs pour ${columnName} = "${value}":`, error);
    res.status(500).json({ error: 'Erreur serveur lors du filtrage des joueurs.' });
  }
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});