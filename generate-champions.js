require('dotenv').config();
const { fetchAndExportAllChampions } = require('./src/utils/dataLoader');

// Exécution de la fonction pour récupérer tous les champions
console.log('Démarrage de la récupération des champions de LoL...');
console.log('Cela peut prendre quelques minutes, veuillez patienter...');

fetchAndExportAllChampions()
    .then(champions => {
        console.log(`Récupération des champions terminée! ${champions.length} champions ont été exportés.`);
    })
    .catch(error => {
        console.error('Erreur lors de la récupération des champions:', error);
    });