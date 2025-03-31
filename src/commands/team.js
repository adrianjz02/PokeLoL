const { SlashCommandBuilder, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { allChampions, getColorByElement, capitalizeFirstLetter, getRoleName } = require('../config/championsManager');
const { getOrCreateUser, getUserChampions, updateChampionFavoriteStatus } = require('../utils/database');

// Constante pour le nombre maximum de champions dans l'équipe
const MAX_TEAM_SIZE = 6;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Gérez votre équipe de champions')
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('Affiche votre équipe actuelle'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajoute un champion à votre équipe'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Retire un champion de votre équipe')),
                
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Créer ou récupérer l'utilisateur
        getOrCreateUser(userId, username);
        
        // Récupérer les champions de l'utilisateur
        const userChampions = getUserChampions(userId);
        
        if (userChampions.length === 0) {
            return interaction.reply({
                content: "⚠️ Vous n'avez pas encore de champions! Utilisez `/starter` pour obtenir votre premier champion.",
                ephemeral: true
            });
        }
        
        // Traiter la sous-commande
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'show') {
            // Afficher l'équipe actuelle
            await this.showTeam(interaction, userChampions);
        } else if (subcommand === 'add') {
            // Ajouter un champion à l'équipe
            await this.addToTeam(interaction, userChampions);
        } else if (subcommand === 'remove') {
            // Retirer un champion de l'équipe
            await this.removeFromTeam(interaction, userChampions);
        }
    },
    
    async showTeam(interaction, userChampions) {
        // Filtrer les champions qui sont dans l'équipe (favoris)
        const teamChampions = userChampions.filter(champion => champion.isFavorite === 1);
        
        // Créer un embed pour afficher l'équipe
        const embed = new EmbedBuilder()
            .setTitle(`🏆 Équipe de ${interaction.user.username}`)
            .setColor('#3498db')
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));
        
        if (teamChampions.length === 0) {
            embed.setDescription("Vous n'avez pas encore ajouté de champions à votre équipe.\nUtilisez `/team add` pour ajouter des champions à votre équipe!");
        } else {
            // Construire la liste des champions de l'équipe
            let teamList = '';
            for (let i = 0; i < teamChampions.length; i++) {
                const teamMember = teamChampions[i];
                // Trouver les détails complets du champion
                const championDetails = allChampions.find(c => c.id === teamMember.championId);
                
                if (championDetails) {
                    // Calculer les bonus de duplicata
                    const duplicateBonus = teamMember.duplicates * 10;
                    teamList += `${i+1}. **${championDetails.name}** - Niveau ${teamMember.level} - Doublon: +${duplicateBonus}%\n`;
                    teamList += `   *${getRoleName(championDetails.role)} - ${capitalizeFirstLetter(championDetails.element)}*\n\n`;
                } else {
                    teamList += `${i+1}. **Champion inconnu** - Niveau ${teamMember.level}\n\n`;
                }
            }
            
            // Ajouter des emplacements vides pour compléter l'équipe
            for (let i = teamChampions.length; i < MAX_TEAM_SIZE; i++) {
                teamList += `${i+1}. *Emplacement vide*\n\n`;
            }
            
            embed.setDescription("Voici votre équipe actuelle:");
            embed.addFields({ name: 'Champions dans l\'équipe', value: teamList });
        }
        
        // Créer un bouton pour ajouter/retirer des champions
        const addButton = new ButtonBuilder()
            .setCustomId('team_add')
            .setLabel('Ajouter un champion')
            .setStyle(ButtonStyle.Primary);
            
        const removeButton = new ButtonBuilder()
            .setCustomId('team_remove')
            .setLabel('Retirer un champion')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(teamChampions.length === 0);
        
        const row = new ActionRowBuilder().addComponents(addButton, removeButton);
        
        // Envoyer le message
        const response = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });
        
        // Collecter les interactions avec les boutons
        const collector = response.createMessageComponentCollector({ time: 60000 });
        
        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: 'Vous ne pouvez pas interagir avec ces boutons car vous n\'êtes pas l\'auteur de la commande.',
                    ephemeral: true
                });
            }
            
            // Mettre à jour les champions de l'utilisateur (au cas où ils auraient changé)
            const updatedUserChampions = getUserChampions(userId);
            
            if (i.customId === 'team_add') {
                await this.addToTeam(i, updatedUserChampions);
            } else if (i.customId === 'team_remove') {
                await this.removeFromTeam(i, updatedUserChampions);
            }
        });
        
        collector.on('end', () => {
            // Si possible, supprimer les boutons une fois le temps écoulé
            try {
                interaction.editReply({ components: [] }).catch(console.error);
            } catch (error) {
                console.error('Erreur lors de la mise à jour des boutons:', error);
            }
        });
    },
    
    async addToTeam(interaction, userChampions) {
        // Filtrer les champions qui ne sont pas dans l'équipe (non favoris)
        const availableChampions = userChampions.filter(champion => champion.isFavorite === 0);
        
        if (availableChampions.length === 0) {
            return interaction.reply({
                content: "⚠️ Vous n'avez pas d'autres champions à ajouter à votre équipe. Obtenez plus de champions avec `/capsule` ou `/hextech`!",
                ephemeral: true
            });
        }
        
        // Vérifier si l'équipe est déjà complète
        const teamChampions = userChampions.filter(champion => champion.isFavorite === 1);
        if (teamChampions.length >= MAX_TEAM_SIZE) {
            return interaction.reply({
                content: `⚠️ Votre équipe est déjà complète (${MAX_TEAM_SIZE} champions). Retirez un champion avec \`/team remove\` avant d'en ajouter un nouveau.`,
                ephemeral: true
            });
        }
        
        // Préparer les options du menu déroulant
        const options = await Promise.all(availableChampions.slice(0, 25).map(async champion => {
            const championDetails = allChampions.find(c => c.id === champion.championId);
            if (!championDetails) return null;
            
            return new StringSelectMenuOptionBuilder()
                .setLabel(championDetails.name)
                .setDescription(`${getRoleName(championDetails.role)} - Niveau ${champion.level}`)
                .setValue(champion.championId);
        }));
        
        // Filtrer les options nulles
        const validOptions = options.filter(option => option !== null);
        
        // Créer le menu déroulant
        const select = new StringSelectMenuBuilder()
            .setCustomId('select_champion_to_add')
            .setPlaceholder('Sélectionnez un champion à ajouter à votre équipe')
            .addOptions(validOptions);
            
        const row = new ActionRowBuilder().addComponents(select);
        
        // Déterminer si c'est une interaction initiale ou une interaction de bouton
        if (interaction.replied || interaction.deferred) {
            // C'est une interaction de bouton
            await interaction.update({
                content: "Choisissez un champion à ajouter à votre équipe:",
                embeds: [],
                components: [row]
            });
        } else {
            // C'est une interaction initiale
            await interaction.reply({
                content: "Choisissez un champion à ajouter à votre équipe:",
                components: [row],
                ephemeral: true
            });
        }
        
        // Collecter la réponse
        const filter = i => i.customId === 'select_champion_to_add' && i.user.id === interaction.user.id;
        try {
            const response = await interaction.channel.awaitMessageComponent({ filter, time: 60000 });
            
            // Récupérer l'ID du champion sélectionné
            const championId = response.values[0];
            
            // Mettre à jour le statut favori du champion
            const updatedChampion = updateChampionFavoriteStatus(interaction.user.id, championId, true);
            
            if (updatedChampion) {
                // Trouver les détails du champion
                const championDetails = allChampions.find(c => c.id === championId);
                
                // Envoyer un message de confirmation
                await response.update({
                    content: `✅ **${championDetails.name}** a été ajouté à votre équipe!`,
                    components: [],
                    embeds: []
                });
                
                // Réafficher l'équipe après un court délai
                setTimeout(async () => {
                    const refreshedChampions = getUserChampions(interaction.user.id);
                    await this.showTeam(interaction, refreshedChampions);
                }, 1500);
            } else {
                await response.update({
                    content: "❌ Une erreur est survenue lors de l'ajout du champion à votre équipe. Veuillez réessayer.",
                    components: [],
                    embeds: []
                });
            }
        } catch (error) {
            console.error('Erreur lors de la sélection du champion:', error);
            if (interaction.channel) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({
                        content: "⏱️ Vous n'avez pas sélectionné de champion à temps ou une erreur est survenue.",
                        components: [],
                        embeds: []
                    }).catch(console.error);
                }
            }
        }
    },
    
    async removeFromTeam(interaction, userChampions) {
        // Filtrer les champions qui sont dans l'équipe (favoris)
        const teamChampions = userChampions.filter(champion => champion.isFavorite === 1);
        
        if (teamChampions.length === 0) {
            return interaction.reply({
                content: "⚠️ Vous n'avez pas de champions dans votre équipe à retirer.",
                ephemeral: true
            });
        }
        
        // Préparer les options du menu déroulant
        const options = await Promise.all(teamChampions.map(async champion => {
            const championDetails = allChampions.find(c => c.id === champion.championId);
            if (!championDetails) return null;
            
            return new StringSelectMenuOptionBuilder()
                .setLabel(championDetails.name)
                .setDescription(`${getRoleName(championDetails.role)} - Niveau ${champion.level}`)
                .setValue(champion.championId);
        }));
        
        // Filtrer les options nulles
        const validOptions = options.filter(option => option !== null);
        
        // Créer le menu déroulant
        const select = new StringSelectMenuBuilder()
            .setCustomId('select_champion_to_remove')
            .setPlaceholder('Sélectionnez un champion à retirer de votre équipe')
            .addOptions(validOptions);
            
        const row = new ActionRowBuilder().addComponents(select);
        
        // Déterminer si c'est une interaction initiale ou une interaction de bouton
        if (interaction.replied || interaction.deferred) {
            // C'est une interaction de bouton
            await interaction.update({
                content: "Choisissez un champion à retirer de votre équipe:",
                embeds: [],
                components: [row]
            });
        } else {
            // C'est une interaction initiale
            await interaction.reply({
                content: "Choisissez un champion à retirer de votre équipe:",
                components: [row],
                ephemeral: true
            });
        }
        
        // Collecter la réponse
        const filter = i => i.customId === 'select_champion_to_remove' && i.user.id === interaction.user.id;
        try {
            const response = await interaction.channel.awaitMessageComponent({ filter, time: 60000 });
            
            // Récupérer l'ID du champion sélectionné
            const championId = response.values[0];
            
            // Mettre à jour le statut favori du champion
            const updatedChampion = updateChampionFavoriteStatus(interaction.user.id, championId, false);
            
            if (updatedChampion) {
                // Trouver les détails du champion
                const championDetails = allChampions.find(c => c.id === championId);
                
                // Envoyer un message de confirmation
                await response.update({
                    content: `✅ **${championDetails.name}** a été retiré de votre équipe!`,
                    components: [],
                    embeds: []
                });
                
                // Réafficher l'équipe après un court délai
                setTimeout(async () => {
                    const refreshedChampions = getUserChampions(interaction.user.id);
                    await this.showTeam(interaction, refreshedChampions);
                }, 1500);
            } else {
                await response.update({
                    content: "❌ Une erreur est survenue lors du retrait du champion de votre équipe. Veuillez réessayer.",
                    components: [],
                    embeds: []
                });
            }
        } catch (error) {
            console.error('Erreur lors de la sélection du champion:', error);
            if (interaction.channel) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({
                        content: "⏱️ Vous n'avez pas sélectionné de champion à temps ou une erreur est survenue.",
                        components: [],
                        embeds: []
                    }).catch(console.error);
                }
            }
        }
    }
};