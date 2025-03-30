const axios = require('axios');

async function getLatestVersion() {
    try {
        const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        const latestVersion = response.data[0]; // La première version est la plus récente
        console.log(`La dernière version de Data Dragon disponible est : ${latestVersion}`);
        return latestVersion;
    } catch (error) {
        console.error('Erreur lors de la récupération de la dernière version:', error);
        throw error;
    }
}

// Exécuter la fonction
getLatestVersion();