import fs from 'fs';
import { parse } from 'csv-parse';
import db from './db';
import path from 'path';

const filePath = path.join(__dirname, '..', 'data.csv');

console.log('Chemin du fichier :', filePath);
if (!fs.existsSync(filePath)) {
  throw new Error(`Le fichier ${filePath} n'existe pas`);
}

const data = fs.readFileSync(filePath, 'utf-8');
console.log(data);

const importData = async () => {
  const csvData: any[] = [];
  fs.createReadStream(filePath)
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