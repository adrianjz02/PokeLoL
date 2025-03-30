// filepath: c:\Users\adrji\Desktop\PokeLoL\src\commands\weekly.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { allChampions } = require('../config/championsManager');
const { getOrCreateUser, hasClaimedRewards, markRewardsClaimed, addItemToInventory } = require('../utils/database');

// Nombre de champions à donner (entre 8 et 10)
function getRandomChampionAmount() {
    return Math.floor(Math.random() * 3) + 8; // 8, 9 ou 10
}

// Nombre de bonbons à donner (entre 8 et 10)
function getRandomCandyAmount() {
    return Math.floor(Math.random() * 3) + 8; // 8, 9 ou 10
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weekly')
        .setDescription('Récupérez vos récompenses hebdomadaires'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Créer ou récupérer l'utilisateur
        const user = getOrCreateUser(userId, username);
        
        // Vérifier si l'utilisateur a déjà récupéré ses récompenses cette semaine
        if (hasClaimedRewards(userId, 'weekly')) {
            return interaction.reply({
                content: "⚠️ Vous avez déjà récupéré vos récompenses hebdomadaires cette semaine. Revenez la semaine prochaine!",
                ephemeral: true
            });
        }
        
        // Déterminer les récompenses
        const championsAmount = getRandomChampionAmount();
        const candyAmount = getRandomCandyAmount();
        
        // Ajouter les récompenses à l'inventaire de l'utilisateur
        addItemToInventory(userId, 'capsule', 'hextech_craft', 1);
        addItemToInventory(userId, 'bonbon', 'bonbon_xp', candyAmount);
        
        // Marquer les récompenses comme récupérées
        markRewardsClaimed(userId, 'weekly');
        
        // Créer un embed pour afficher les récompenses
        const embed = new EmbedBuilder()
            .setTitle('🎁 Récompenses Hebdomadaires 🎁')
            .setDescription(`Félicitations ${username}! Voici vos récompenses hebdomadaires:`)
            .setColor('#C0C0C0') // Argent
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { 
                    name: '📦 Hextech Craft',
                    value: `Obtenez 10 champions aléatoires`,
                    inline: true 
                },
                { 
                    name: '🍬 Bonbons XP',
                    value: `${candyAmount} bonbons pour améliorer vos champions`,
                    inline: true 
                }
            )
            .setFooter({ text: 'Utilisez /inventory pour voir votre inventaire et utiliser vos objets' });
        
        // Répondre avec l'embed
        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
};