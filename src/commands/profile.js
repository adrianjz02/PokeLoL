const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getOrCreateUser, getUserChampions, hasPlayedToday, hasClaimedRewards } = require('../utils/database');
const { allChampions, getColorByElement } = require('../config/championsManager');

// Version simplifiée - l'utilisateur commence au niveau 1
function getUserLevel() {
    return 1; // Niveau fixe en attendant l'implémentation du système d'XP
}

// Fonction pour créer une représentation visuelle de la barre d'XP vide
function createXPBar(length = 10) {
    const emptyBar = '░'.repeat(length);
    return `${emptyBar} 0/100 XP`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Affiche votre profil de dresseur PokeLoL'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Créer ou récupérer l'utilisateur
        const user = getOrCreateUser(userId, username);
        
        // Récupérer les champions de l'utilisateur
        const userChampions = getUserChampions(userId);
        
        // Niveau fixe en attendant l'implémentation du système d'XP
        const userLevel = getUserLevel();
        
        // Barre d'XP vide en attendant l'implémentation du système d'XP
        const xpBar = createXPBar();
        
        // Vérifier les activités disponibles
        const loldleAvailable = !hasPlayedToday(userId, 'loldle');
        const quizAvailable = !hasPlayedToday(userId, 'quiz');
        const dailyAvailable = !hasClaimedRewards(userId, 'daily');
        const weeklyAvailable = !hasClaimedRewards(userId, 'weekly');
        
        // Déterminer l'équipe principale (les champions favoris, max 6)
        const mainTeam = userChampions
            .filter(champ => champ.isFavorite === 1)
            .slice(0, 6);
        
        // Compléter l'équipe avec les champions de plus haut niveau si moins de 6 favoris
        if (mainTeam.length < 6) {
            const remainingSlots = 6 - mainTeam.length;
            const otherChampions = userChampions
                .filter(champ => champ.isFavorite === 0)
                .sort((a, b) => b.level - a.level)
                .slice(0, remainingSlots);
            
            mainTeam.push(...otherChampions);
        }
        
        // Créer la liste des champions de l'équipe principale avec leur niveau
        let teamList = '';
        
        for (let i = 0; i < 6; i++) {
            const teamMember = mainTeam[i];
            if (teamMember) {
                // Trouver les détails complets du champion
                const championDetails = allChampions.find(c => c.id === teamMember.championId);
                if (championDetails) {
                    teamList += `${i+1}. **${championDetails.name}** - Niveau ${teamMember.level} (${teamMember.exp}/${teamMember.nextLevelExp} XP)\n`;
                } else {
                    teamList += `${i+1}. **Champion inconnu** - Niveau ${teamMember.level}\n`;
                }
            } else {
                teamList += `${i+1}. *Emplacement vide*\n`;
            }
        }
        
        // Créer l'embed du profil
        const profileEmbed = new EmbedBuilder()
            .setTitle(`Profil de ${username}`)
            .setDescription(`**Niveau de dresseur:** ${userLevel}\n**XP:** ${xpBar}`)
            .setColor('#3498db')
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { 
                    name: '💙 Essence Bleue',
                    value: `0`,
                    inline: true 
                },
                { 
                    name: '🔶 Riot Points',
                    value: `0 RP`,
                    inline: true 
                },
                { 
                    name: '📚 Collection',
                    value: `${userChampions.length} champion${userChampions.length > 1 ? 's' : ''}`,
                    inline: true 
                },
                { 
                    name: '📊 Statistiques',
                    value: `Raids complétés: ${user.raids_completed || 0}\nQuêtes complétées: ${user.quests_completed || 0}`,
                    inline: true 
                },
                { 
                    name: '⭐ Équipe principale',
                    value: teamList || '*Aucun champion dans l\'équipe*'
                },
                { 
                    name: '🎮 Activités disponibles',
                    value: `${loldleAvailable ? '✅' : '❌'} Loldle quotidien\n${quizAvailable ? '✅' : '❌'} Quiz quotidien\n${dailyAvailable ? '✅' : '❌'} Récompense quotidienne\n${weeklyAvailable ? '✅' : '❌'} Récompense hebdomadaire`
                }
            )
            .setFooter({ text: `PokeLoL - Date d'inscription: ${new Date(user.createdAt).toLocaleDateString()}` });
        
        // Ajouter un thumbnail si l'utilisateur a au moins un champion
        /* Commenté car nous utilisons déjà l'avatar de l'utilisateur comme thumbnail
        if (userChampions.length > 0) {
            const firstChampion = allChampions.find(c => c.id === userChampions[0].championId);
            if (firstChampion) {
                profileEmbed.setThumbnail(firstChampion.iconUrl);
            }
        }
        */
        
        // Créer des boutons pour les actions rapides
        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('view_champions')
                    .setLabel('Voir tous mes champions')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('manage_team')
                    .setLabel('Gérer mon équipe')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        // Répondre à l'interaction
        const response = await interaction.reply({
            embeds: [profileEmbed],
            components: [actionRow],
            ephemeral: false,
            fetchReply: true
        });
        
        // Créer un collecteur pour les réponses aux boutons
        const filter = i => i.user.id === interaction.user.id;
        const collector = response.createMessageComponentCollector({ 
            filter, 
            time: 60000 // 1 minute
        });
        
        collector.on('collect', async i => {
            if (i.customId === 'view_champions') {
                // Cette fonctionnalité sera implémentée plus tard
                await i.reply({
                    content: 'La fonctionnalité "Voir tous mes champions" sera disponible prochainement!',
                    ephemeral: true
                });
            } else if (i.customId === 'manage_team') {
                // Cette fonctionnalité sera implémentée plus tard
                await i.reply({
                    content: 'La fonctionnalité "Gérer mon équipe" sera disponible prochainement!',
                    ephemeral: true
                });
            }
        });
        
        collector.on('end', collected => {
            if (collected.size === 0) {
                // Supprimer les boutons une fois le temps écoulé
                interaction.editReply({
                    components: []
                }).catch(console.error);
            }
        });
    }
};