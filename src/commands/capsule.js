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
        
        // Créer un embed principal pour afficher les champions obtenus
        const embed = new EmbedBuilder()
            .setTitle(`🎁 Capsule d'Invocation Ouverte!`)
            .setDescription(`Vous avez obtenu 5 champions:`)
            .setColor('#C27C0E')
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

        // Compteurs pour le résumé
        let newCount = 0;
        let duplicateCount = 0;

        // Ajouter les champions obtenus directement dans le PC
        const championsField = selectedChampions.map(champion => {
            const existingChampion = getUserChampion(userId, champion.id);
            let description;

            if (existingChampion) {
                // Le champion est un doublon, ajouter un doublon
                duplicateCount++;
                const updatedChampion = addChampionDuplicate(userId, champion.id);

                if (updatedChampion) {
                    description = `🔄 **${champion.name}** - Doublon! (${updatedChampion.duplicates}/10) +${updatedChampion.duplicates * 10}% stats`;
                } else {
                    description = `🔄 **${champion.name}** - Doublon! (Max atteint)`;
                }
            } else {
                // Nouveau champion, l'ajouter au PC
                newCount++;
                addChampionToUser(userId, champion.id, false); // false pour indiquer qu'il n'est pas dans l'équipe principale
                description = `✨ **${champion.name}** - Nouveau champion!`;
            }

            return description;
        }).join('\n');

        embed.addFields({
            name: 'Champions obtenus',
            value: championsField,
            inline: false
        });

        // Résumé des gains
        embed.addFields({
            name: 'Résumé',
            value: `✨ Nouveaux champions: ${newCount}\n🔄 Doublons: ${duplicateCount}`,
            inline: false
        });

        // Informations supplémentaires
        embed.addFields({
            name: 'Informations',
            value: 'Tous les champions ont été ajoutés à votre PC. Utilisez `/team` pour les ajouter à votre équipe active.',
            inline: false
        });

        // Répondre avec l'embed principal
        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
};