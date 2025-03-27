import express from 'express';
import db from './db'; // Votre connexion à la base de données
import cors from 'cors';

const app = express();

// Middleware pour permettre les requêtes CORS (nécessaire pour que le frontend puisse accéder à l'API)
app.use(cors());
app.use(express.json());

// Route pour récupérer tous les joueurs
app.get('/api/players', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM players');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des joueurs :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const PORT = 3001; // Choisissez un port différent de celui de votre frontend React
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});