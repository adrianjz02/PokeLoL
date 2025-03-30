// filepath: c:\Users\adrji\Desktop\PokeLoL\src\commands\daily.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { allChampions } = require('../config/championsManager');
const { getOrCreateUser, hasClaimedRewards, markRewardsClaimed, addItemToInventory } = require('../utils/database');

// Nombre de bonbons à donner (entre 1 et 5)
function getRandomCandyAmount() {
    return Math.floor(Math.random() * 5) + 1;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Récupérez vos récompenses quotidiennes'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Créer ou récupérer l'utilisateur
        const user = getOrCreateUser(userId, username);
        
        // Vérifier si l'utilisateur a déjà récupéré ses récompenses aujourd'hui
        if (hasClaimedRewards(userId, 'daily')) {
            return interaction.reply({
                content: "⚠️ Vous avez déjà récupéré vos récompenses quotidiennes aujourd'hui. Revenez demain!",
                ephemeral: true
            });
        }
        
        // Déterminer les récompenses
        const candyAmount = getRandomCandyAmount();
        
        // Ajouter les récompenses à l'inventaire de l'utilisateur
        addItemToInventory(userId, 'capsule', 'capsule_invocation', 1);
        addItemToInventory(userId, 'bonbon', 'bonbon_xp', candyAmount);
        
        // Marquer les récompenses comme récupérées
        markRewardsClaimed(userId, 'daily');
        
        // Créer un embed pour afficher les récompenses
        const embed = new EmbedBuilder()
            .setTitle('🎁 Récompenses Quotidiennes 🎁')
            .setDescription(`Félicitations ${username}! Voici vos récompenses quotidiennes:`)
            .setColor('#FFD700') // Or
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { 
                    name: '📦 Capsule d\'Invocation',
                    value: 'Obtenez 5 champions aléatoires',
                    inline: true 
                },
                { 
                    name: '🍬 Bonbons XP',
                    value: `${candyAmount} ${candyAmount > 1 ? 'bonbons' : 'bonbon'} pour améliorer vos champions`,
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