"use strict";
exports.__esModule = true;
var promise_1 = require("mysql2/promise");
var dotenv_1 = require("dotenv");
// Charger les variables d'environnement depuis le fichier .env
dotenv_1["default"].config();
// Configurer la connexion à la base de données
var db = (0, promise_1.createPool)({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'toavina-jr',
    password: process.env.DB_PASSWORD || 'azertyuiop',
    database: process.env.DB_NAME || 'nba_stats',
    port: parseInt(process.env.DB_PORT || '3306', 10)
});
// Tester la connexion (optionnel, pour déboguer)
db.getConnection()
    .then(function () { return console.log('Connexion à la base de données réussie'); })["catch"](function (err) { return console.error('Erreur de connexion à la base de données :', err); });
exports["default"] = db;
