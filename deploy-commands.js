require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Afficher les variables d'environnement (masquées partiellement)
console.log('CLIENT_ID:', process.env.CLIENT_ID ? '...'+process.env.CLIENT_ID.slice(-5) : 'non défini');
console.log('GUILD_ID:', process.env.GUILD_ID ? '...'+process.env.GUILD_ID.slice(-5) : 'non défini');
console.log('TOKEN:', process.env.DISCORD_TOKEN ? '***' + process.env.DISCORD_TOKEN.slice(-5) : 'non défini');

const commands = [];
// Récupération des commandes depuis le dossier des commandes
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log(`Recherche de commandes dans ${commandsPath}`);
console.log(`Fichiers de commandes trouvés: ${commandFiles.join(', ')}`);

for (const file of commandFiles) {
    if (file === 'README.md') continue; // Ignore le fichier README.md
    
    const command = require(`./src/commands/${file}`);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`Commande ajoutée: ${command.data.name}`);
    } else {
        console.log(`[WARNING] La commande dans ${file} manque des propriétés "data" ou "execute" requises.`);
    }
}

// Initialisation du client REST
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Déploiement des commandes
(async () => {
    try {
        console.log(`Démarrage du déploiement de ${commands.length} commandes slash.`);

        let data;
        if (process.env.GUILD_ID) {
            // Déploiement sur un serveur spécifique (plus rapide pour le développement)
            const route = Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID);
            console.log(`Utilisation de la route: ${route}`);
            
            data = await rest.put(route, { body: commands });
            console.log(`Les commandes ont été déployées sur le serveur de développement.`);
        } else {
            // Déploiement global (peut prendre jusqu'à une heure pour être effectif)
            const route = Routes.applicationCommands(process.env.CLIENT_ID);
            console.log(`Utilisation de la route: ${route}`);
            
            data = await rest.put(route, { body: commands });
            console.log(`Les commandes ont été déployées globalement.`);
        }

        console.log(`✅ ${data.length} commandes slash ont été déployées avec succès!`);
    } catch (error) {
        console.error('Erreur lors du déploiement des commandes:');
        console.error(error);
    }
})();