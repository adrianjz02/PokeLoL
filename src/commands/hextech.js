// filepath: c:\Users\adrji\Desktop\PokeLoL\src\commands\hextech.js
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
        .setName('hextech')
        .setDescription('Ouvrir un Hextech Craft pour obtenir 10 champions aléatoires'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Créer ou récupérer l'utilisateur
        getOrCreateUser(userId, username);
        
        // Vérifier si l'utilisateur a un Hextech Craft dans son inventaire
        const inventory = getUserInventory(userId);
        const hextechItem = inventory.find(item => item.itemType === 'capsule' && item.itemId === 'hextech_craft');
        
        if (!hextechItem || hextechItem.quantity < 1) {
            return await interaction.reply({
                content: "⚠️ Vous n'avez pas de Hextech Craft dans votre inventaire ! Utilisez `/weekly` pour en obtenir.",
                ephemeral: true
            });
        }
        
        // Utiliser un Hextech Craft de l'inventaire
        useInventoryItem(userId, 'capsule', 'hextech_craft', 1);
        
        // Sélectionner 10 champions aléatoires
        const selectedChampions = getRandomChampions(10);
        
        // Créer un embed pour afficher les champions obtenus
        const embed = new EmbedBuilder()
            .setTitle(`🎁 Hextech Craft Ouvert!`)
            .setDescription(`Vous avez obtenu 10 champions:`)
            .setColor('#7B16FF') // Couleur violette pour Hextech
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));
        
        // Compteurs pour le résumé
        let newCount = 0;
        let duplicateCount = 0;
        
        // Créer le champ pour afficher les champions obtenus
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