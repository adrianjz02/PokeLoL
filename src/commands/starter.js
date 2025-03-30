const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { allChampions, getColorByElement, capitalizeFirstLetter, getRoleName, getStatsString, getRandomChampion } = require('../config/championsManager');

// Pour simuler une base de données simple pendant le développement initial
// Plus tard, vous voudrez utiliser une vraie base de données (MongoDB, etc.)
const userDatabase = new Map();

// Stockage temporaire des propositions de champions starter pour chaque utilisateur
const starterPropositions = new Map();

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
        
        // Vérifier si l'utilisateur a déjà un champion starter
        if (userDatabase.has(userId)) {
            return interaction.reply({
                content: "⚠️ Vous avez déjà choisi votre premier champion! Utilisez `/profile` pour voir votre champion actuel.",
                ephemeral: true
            });
        }
        
        // Vérifier si l'utilisateur a déjà des propositions de starters
        let userStarters;
        if (starterPropositions.has(userId)) {
            // Utiliser les propositions déjà générées
            userStarters = starterPropositions.get(userId);
        } else {
            // Générer de nouvelles propositions
            userStarters = generateStarterChampions();
            // Stocker les propositions pour cet utilisateur
            starterPropositions.set(userId, userStarters);
        }
        
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
        
        // Répondre avec le premier embed et les boutons
        const response = await interaction.reply({
            content: "🌟 **Bienvenue dans le monde de PokeLoL!** 🌟\nChoisissez votre premier champion pour commencer votre aventure:",
            embeds: [starterEmbeds[0]],
            components: [viewButtons, confirmButtons],
            fetchReply: true
        });
        
        // Créer un collecteur pour gérer les réponses aux boutons
        const filter = i => 
            (i.customId.startsWith('starter_view_') || i.customId.startsWith('starter_choose_')) 
            && i.user.id === interaction.user.id;
            
        const collector = response.createMessageComponentCollector({ filter, time: 120000 }); // 2 minutes
        
        collector.on('collect', async i => {
            const customId = i.customId;
            
            // Si l'utilisateur clique sur un bouton pour voir un champion
            if (customId.startsWith('starter_view_')) {
                const selectedId = customId.split('_')[2];
                const championIndex = userStarters.findIndex(c => c.id === selectedId);
                
                if (championIndex !== -1) {
                    await i.update({
                        embeds: [starterEmbeds[championIndex]],
                        components: [viewButtons, confirmButtons]
                    });
                }
            }
            
            // Si l'utilisateur confirme son choix
            else if (customId.startsWith('starter_choose_')) {
                const selectedId = customId.split('_')[2];
                const selectedChampion = userStarters.find(c => c.id === selectedId);
                
                // Enregistrer le choix dans notre "base de données" temporaire
                userDatabase.set(userId, {
                    userId: userId,
                    username: interaction.user.username,
                    champions: [
                        {
                            ...selectedChampion,
                            level: 1,
                            exp: 0,
                            nextLevelExp: 100,
                            isFavorite: true
                        }
                    ],
                    inventory: {
                        gold: 500,
                        items: []
                    },
                    stats: {
                        championsCollected: 1,
                        raidProgress: 0,
                        questsCompleted: 0
                    },
                    createdAt: new Date()
                });
                
                // Supprimer les propositions de starters pour cet utilisateur
                starterPropositions.delete(userId);
                
                const confirmEmbed = new EmbedBuilder()
                    .setColor(getColorByElement(selectedChampion.element))
                    .setTitle(`🎉 Félicitations! 🎉`)
                    .setDescription(`Vous avez choisi **${selectedChampion.name}** comme votre premier champion PokéLoL!`)
                    .setThumbnail(selectedChampion.iconUrl)
                    .addFields(
                        { name: 'Prochaines étapes', value: 'Utilisez `/profile` pour voir votre profil.\nPartez à l\'aventure avec `/jungle` pour attraper plus de champions!\nRevenez tous les jours pour les récompenses quotidiennes avec `/daily`.' }
                    );
                
                await i.update({
                    content: `✅ **${interaction.user.username}**, votre aventure dans PokeLoL commence maintenant!`,
                    embeds: [confirmEmbed],
                    components: []
                });
                
                // Arrêter le collecteur car l'utilisateur a fait son choix
                collector.stop();
            }
        });
        
        collector.on('end', async (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                await interaction.editReply({
                    content: "⏱️ Le temps imparti pour choisir votre champion de départ est écoulé. Utilisez à nouveau `/starter` quand vous serez prêt à faire votre choix.",
                    embeds: [],
                    components: []
                });
            }
        });
    }
};