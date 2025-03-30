// filepath: c:\Users\adrji\Desktop\PokeLoL\src\commands\capsule.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { allChampions } = require('../config/championsManager');
const { getOrCreateUser, addChampionToUser, getUserChampion, addChampionDuplicate, getUserInventory, useInventoryItem } = require('../utils/database');

// Fonction pour sélectionner des champions aléatoires
function getRandomChampions(count) {
    const champions = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * allChampions.length);
        champions.push(allChampions[randomIndex]);
    }
    return champions;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('capsule')
        .setDescription('Ouvrir une Capsule d\'Invocation pour obtenir 5 champions aléatoires'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Créer ou récupérer l'utilisateur
        getOrCreateUser(userId, username);
        
        // Vérifier si l'utilisateur a une Capsule d'Invocation dans son inventaire
        const inventory = getUserInventory(userId);
        const capsuleItem = inventory.find(item => item.itemType === 'capsule' && item.itemId === 'capsule_invocation');
        
        if (!capsuleItem || capsuleItem.quantity < 1) {
            return await interaction.reply({
                content: "⚠️ Vous n'avez pas de Capsule d'Invocation dans votre inventaire ! Utilisez `/daily` pour en obtenir.",
                ephemeral: true
            });
        }
        
        // Utiliser une Capsule d'Invocation de l'inventaire
        useInventoryItem(userId, 'capsule', 'capsule_invocation', 1);
        
        // Sélectionner 5 champions aléatoires
        const selectedChampions = getRandomChampions(5);
        
        // Créer un embed pour afficher les champions obtenus
        const embed = new EmbedBuilder()
            .setTitle(`🎁 Capsule d'Invocation Ouverte!`)
            .setDescription(`Vous avez obtenu 5 champions:`)
            .setColor('#C27C0E')
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        // Créer des embeds individuels pour chaque champion
        const championEmbeds = selectedChampions.map(champion => {
            const existingChampion = getUserChampion(userId, champion.id);
            let description;
            
            if (existingChampion) {
                // Le champion est un doublon, ajouter un doublon
                const updatedChampion = addChampionDuplicate(userId, champion.id);
                
                if (updatedChampion) {
                    description = `🔄 **Doublon !** (${updatedChampion.duplicates}/10)\n+${updatedChampion.duplicates * 10}% stats`;
                } else {
                    description = `🔄 **Doublon !** (Max atteint)`;
                }
            } else {
                // Nouveau champion, l'ajouter à la collection
                addChampionToUser(userId, champion.id, false);
                description = `✨ **Nouveau champion !**`;
            }
            
            return new EmbedBuilder()
                .setColor(existingChampion ? '#7289DA' : '#43B581')
                .setTitle(champion.name)
                .setDescription(description)
                .setThumbnail(champion.iconUrl);
        });
        
        // Informations supplémentaires
        embed.addFields({
            name: 'Informations',
            value: 'Tous les champions ont été ajoutés à votre PC. Utilisez `/team` pour les ajouter à votre équipe active.',
            inline: false
        });
        
        // Répondre avec l'embed principal et les embeds des champions
        await interaction.reply({
            embeds: [embed, ...championEmbeds],
            ephemeral: false
        });
    }
};