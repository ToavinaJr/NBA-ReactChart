import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'toavina-jr',
  password: process.env.DB_PASSWORD || 'azertyuiop',
  database: process.env.DB_NAME || 'nba_stats',
  port: parseInt(process.env.DB_PORT || '3306', 10),
});


db.getConnection()
  .then(() => console.log('Connexion à la base de données réussie'))
  .catch((err) => console.error('Erreur de connexion à la base de données :', err));

export default db;