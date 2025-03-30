const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { allChampions, getColorByElement, capitalizeFirstLetter, getRoleName, getStatsString, getRandomChampion } = require('../config/championsManager');
const { getOrCreateUser, hasUserChampion, addChampionToUser } = require('../utils/database');

// Fonction pour générer 3 champions starters aléatoires et uniques
function generateStarterChampions() {
    const starters = [];
    const roles = ['marksman', 'fighter', 'mage']; // Nous voulons un de chaque rôle
    
    // Pour chaque rôle, sélectionner un champion aléatoire
    for (const role of roles) {
        let champion = getRandomChampion({ role });
        
        // S'assurer qu'on n'a pas déjà choisi ce champion
        while (starters.find(c => c.id === champion.id)) {
            champion = getRandomChampion({ role });
        }
        
        starters.push(champion);
    }
    
    return starters;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('starter')
        .setDescription('Choisissez votre premier champion PokéLoL pour commencer votre aventure!'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Créer ou récupérer l'utilisateur dans la base de données
        const user = getOrCreateUser(userId, username);
        
        // Vérifier si l'utilisateur a déjà un champion starter
        if (hasUserChampion(userId)) {
            return interaction.reply({
                content: "⚠️ Vous avez déjà choisi votre premier champion! Utilisez `/profile` pour voir votre champion actuel.",
                ephemeral: true
            });
        }
        
        // Générer 3 champions starters aléatoires
        const userStarters = generateStarterChampions();
        
        // Créer les embeds pour chaque champion starter
        const starterEmbeds = userStarters.map(champion => {
            // Formatter les capacités pour afficher uniquement leur nom (sans coût)
            const formattedAbilities = champion.abilities.map(ability => {
                if (typeof ability === 'object') {
                    // Si c'est un objet (nouveau format), afficher seulement le nom
                    return ability.name;
                } else {
                    // Si c'est une chaîne (ancien format), l'utiliser directement
                    return ability;
                }
            });
            
            return new EmbedBuilder()
                .setColor(getColorByElement(champion.element))
                .setTitle(`${champion.name} - ${champion.title}`)
                .setDescription(champion.description)
                .setThumbnail(champion.iconUrl)
                .setImage(champion.imageUrl)
                .addFields(
                    { name: 'Région', value: champion.region, inline: true },
                    { name: 'Élément', value: capitalizeFirstLetter(champion.element), inline: true },
                    { name: 'Rôle', value: getRoleName(champion.role), inline: true },
                    { name: 'Statistiques', value: getStatsString(champion.stats), inline: false },
                    { name: 'Capacités', value: formattedAbilities.join('\n'), inline: false }
                )
                .setFooter({ text: 'Choisissez votre champion de départ en cliquant sur un bouton ci-dessous!' });
        });
        
        // Créer les boutons pour chaque champion (pour visualiser) et des boutons de confirmation
        const viewButtons = new ActionRowBuilder()
            .addComponents(
                ...userStarters.map(champion => 
                    new ButtonBuilder()
                        .setCustomId(`starter_view_${champion.id}`)
                        .setLabel(champion.name)
                        .setStyle(ButtonStyle.Secondary)
                )
            );
            
        // Créer les boutons de confirmation pour chaque champion
        const confirmButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`starter_choose_${userStarters[0].id}`)
                    .setLabel(`Choisir ${userStarters[0].name}`)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`starter_choose_${userStarters[1].id}`)
                    .setLabel(`Choisir ${userStarters[1].name}`)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`starter_choose_${userStarters[2].id}`)
                    .setLabel(`Choisir ${userStarters[2].name}`)
                    .setStyle(ButtonStyle.Success)
            );
            
        // Envoyer le message avec le premier champion et les boutons
        const response = await interaction.reply({
            embeds: [starterEmbeds[0]],
            components: [viewButtons, confirmButtons],
            fetchReply: true
        });
        
        // Créer un collecteur pour gérer les interactions avec les boutons
        const filter = i => i.user.id === interaction.user.id && (
            i.customId.startsWith('starter_view_') || i.customId.startsWith('starter_choose_')
        );
        
        const collector = response.createMessageComponentCollector({ filter, time: 300000 }); // 5 minutes
        
        collector.on('collect', async i => {
            const customId = i.customId;
            
            if (customId.startsWith('starter_view_')) {
                // L'utilisateur veut voir un champion
                const championId = customId.replace('starter_view_', '');
                const championIndex = userStarters.findIndex(c => c.id === championId);
                
                if (championIndex !== -1) {
                    // Mettre à jour le message avec le champion sélectionné
                    await i.update({
                        embeds: [starterEmbeds[championIndex]],
                        components: [viewButtons, confirmButtons]
                    });
                }
            } else if (customId.startsWith('starter_choose_')) {
                // L'utilisateur a choisi un champion
                const championId = customId.replace('starter_choose_', '');
                const champion = userStarters.find(c => c.id === championId);
                
                if (champion) {
                    // Ajouter le champion à l'utilisateur dans la base de données
                    const userChampion = addChampionToUser(userId, championId, true); // true pour le marquer comme favori
                    
                    if (userChampion) {
                        // Créer un embed de confirmation
                        const confirmEmbed = new EmbedBuilder()
                            .setColor(getColorByElement(champion.element))
                            .setTitle(`🎉 Félicitations! 🎉`)
                            .setDescription(`Vous avez choisi **${champion.name}** comme votre premier champion PokéLoL!`)
                            .setThumbnail(champion.iconUrl)
                            .setImage(champion.imageUrl)
                            .addFields(
                                { name: 'Niveau', value: '1', inline: true },
                                { name: 'XP', value: '0/100', inline: true },
                                { name: 'Prochain pas', value: 'Utilisez `/profile` pour voir votre champion et `/loldle` ou `/quiz` pour gagner des récompenses quotidiennes!', inline: false }
                            );
                        
                        // Mettre à jour le message avec la confirmation
                        await i.update({
                            embeds: [confirmEmbed],
                            components: [] // Supprimer les boutons
                        });
                        
                        // Arrêter le collecteur
                        collector.stop();
                    } else {
                        // Erreur lors de l'ajout du champion
                        await i.reply({
                            content: '❌ Une erreur est survenue lors du choix de votre champion. Veuillez réessayer.',
                            ephemeral: true
                        });
                    }
                }
            }
        });
        
        collector.on('end', async (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                // Le temps est écoulé et aucune interaction n'a eu lieu
                await interaction.editReply({
                    content: '⏱️ Le temps pour choisir un champion est écoulé. Utilisez à nouveau la commande `/starter` pour recommencer.',
                    embeds: [],
                    components: []
                });
            }
        });
    }
};