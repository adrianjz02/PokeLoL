// filepath: c:\Users\adrji\Desktop\PokeLoL\src\commands\reset.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { resetDatabase } = require('../utils/database');
const fs = require('fs');
const path = require('path');

// Utiliser l'ID administrateur depuis les variables d'environnement
const ADMIN_ID = process.env.ADMIN_USER_ID;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Réinitialise complètement la base de données (Admin uniquement)')
        .addStringOption(option => 
            option.setName('confirmation')
                .setDescription('Tapez "confirm" pour confirmer la réinitialisation')
                .setRequired(false)),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        
        // Vérifier si l'utilisateur est l'administrateur
        if (userId !== ADMIN_ID) {
            return interaction.reply({
                content: "⛔ Vous n'avez pas l'autorisation d'utiliser cette commande. Elle est réservée à l'administrateur.",
                ephemeral: true
            });
        }
        
        const confirmation = interaction.options.getString('confirmation');
        
        // Si aucune confirmation n'est fournie, demander une confirmation
        if (!confirmation || confirmation.toLowerCase() !== 'confirm') {
            const warningEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⚠️ Avertissement: Réinitialisation de la base de données')
                .setDescription('Cette action va **EFFACER DÉFINITIVEMENT** toutes les données de la base de données, y compris :\n\n' +
                '- Tous les utilisateurs et leurs progressions\n' +
                '- Tous les champions assignés\n' +
                '- Toutes les statistiques de jeu\n' +
                '- Tous les historiques\n\n' +
                'Cette action est **IRRÉVERSIBLE**!')
                .addFields(
                    { name: 'Confirmation', value: 'Pour confirmer la réinitialisation, utilisez `/reset confirmation:confirm`', inline: false }
                )
                .setFooter({ text: 'PokeLoL Admin Controls' });
                
            return interaction.reply({ 
                embeds: [warningEmbed],
                ephemeral: true 
            });
        }
        
        // Différer la réponse car l'opération peut prendre un moment
        await interaction.deferReply({ ephemeral: true });
        
        try {
            // Utiliser la fonction de réinitialisation de la base de données
            const success = resetDatabase();
            
            if (success) {
                // Envoyer un message de confirmation
                const successEmbed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('✅ Base de données réinitialisée')
                    .setDescription('La base de données a été complètement effacée et réinitialisée avec succès.')
                    .setTimestamp()
                    .setFooter({ text: 'PokeLoL Admin Controls' });
                    
                await interaction.editReply({ 
                    embeds: [successEmbed],
                    ephemeral: true
                });
            } else {
                // Une erreur s'est produite lors de la réinitialisation
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Erreur lors de la réinitialisation')
                    .setDescription('Une erreur est survenue lors de la réinitialisation de la base de données. Consultez les logs pour plus de détails.')
                    .setTimestamp()
                    .setFooter({ text: 'PokeLoL Admin Controls' });
                    
                await interaction.editReply({ 
                    embeds: [errorEmbed],
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Erreur lors de la réinitialisation de la base de données:', error);
            
            // Envoyer un message d'erreur
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erreur lors de la réinitialisation')
                .setDescription(`Une erreur est survenue lors de la réinitialisation de la base de données:\n\`\`\`${error.message}\`\`\``)
                .setTimestamp()
                .setFooter({ text: 'PokeLoL Admin Controls' });
                
            await interaction.editReply({ 
                embeds: [errorEmbed],
                ephemeral: true
            });
        }
    }
};