import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Configurer la connexion à la base de données
const db = createPool({
  host: process.env.DB_HOST || 'localhost', // Valeur par défaut si la variable n'est pas définie
  user: process.env.DB_USER || 'toavina-jr',
  password: process.env.DB_PASSWORD || 'azertyuiop',
  database: process.env.DB_NAME || 'nba_stats',
  port: parseInt(process.env.DB_PORT || '3306', 10), // Convertir le port en nombre
});

// Tester la connexion (optionnel, pour déboguer)
db.getConnection()
  .then(() => console.log('Connexion à la base de données réussie'))
  .catch((err) => console.error('Erreur de connexion à la base de données :', err));

export default db;