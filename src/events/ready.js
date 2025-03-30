const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Connecté en tant que ${client.user.tag}!`);
        console.log(`🎮 PokeLoL est prêt à servir ${client.guilds.cache.size} serveurs!`);
        
        // Définir une activité pour le bot
        client.user.setActivity('League of Pokémon', { type: 'PLAYING' });
    },
};