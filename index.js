require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Création du client Discord avec uniquement les intents nécessaires et autorisés par défaut
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,          // Autorisé par défaut
        GatewayIntentBits.GuildMessages    // Autorisé par défaut
        // Les intents suivants nécessitent une activation dans le portail développeur Discord
        // GatewayIntentBits.MessageContent,  // Privilégié - nécessite activation
        // GatewayIntentBits.GuildMembers     // Privilégié - nécessite activation
    ] 
});

// Stockage des commandes et des événements
client.commands = new Collection();

// Chargement des commandes
const commandsPath = path.join(__dirname, 'src', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    if (file === 'README.md') continue; // Ignore le fichier README.md
    
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    // Définir une nouvelle commande dans la collection
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`Commande chargée: ${command.data.name}`);
    } else {
        console.log(`[WARNING] La commande dans ${filePath} manque des propriétés "data" ou "execute" requises.`);
    }
}

// Chargement des événements
const eventsPath = path.join(__dirname, 'src', 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    if (file === 'README.md') continue; // Ignore le fichier README.md
    
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Connexion à Discord avec le token
client.login(process.env.DISCORD_TOKEN).then(() => {
    console.log('Bot en cours de connexion à Discord...');
}).catch(error => {
    console.error('Erreur lors de la connexion à Discord:', error);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', error => {
    console.error('Erreur non gérée:', error);
});