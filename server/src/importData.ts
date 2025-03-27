import fs from 'fs';
import { parse } from 'csv-parse';
import db from './db';
import path from 'path';

// Construire le chemin absolu vers data.csv
const filePath = path.join(__dirname, '..', 'data.csv');

// Vérifier si le fichier existe (pour déboguer)
console.log('Chemin du fichier :', filePath);
if (!fs.existsSync(filePath)) {
  throw new Error(`Le fichier ${filePath} n'existe pas`);
}

// Lire le fichier (juste pour déboguer, vous pouvez retirer cette partie si elle n'est pas nécessaire)
const data = fs.readFileSync(filePath, 'utf-8');
console.log(data);

const importData = async () => {
  const csvData: any[] = [];
  fs.createReadStream(filePath) // Utiliser filePath au lieu de '../data.csv'
    .pipe(parse({ columns: true, trim: true }))
    .on('data', (row) => {
      csvData.push(row);
    })
    .on('end', async () => {
      for (const row of csvData) {
        await db.query(
          'INSERT INTO players (name, team, number, position, age, height, weight, college, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            row.Name,
            row.Team,
            row.Number,
            row.Position,
            row.Age,
            row.Height,
            row.Weight,
            row.College,
            row.Salary || null,
          ]
        );
      }
      console.log('Data imported successfully');
    })
    .on('error', (error) => {
      console.error('Erreur lors de la lecture du fichier CSV :', error);
    });
};

importData();