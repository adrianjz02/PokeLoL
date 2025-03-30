// filepath: c:\Users\adrji\Desktop\PokeLoL\src\commands\inventory.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { allChampions } = require('../config/championsManager');
const { getOrCreateUser, getUserInventory, useInventoryItem, addChampionToUser, getUserChampion, addChampionDuplicate } = require('../utils/database');

// Noms lisibles pour les types d'objets
const ITEM_TYPES = {
    'capsule': 'Capsules',
    'bonbon': 'Bonbons XP',
    'ressource': 'Ressources'
};

// Descriptions des objets
const ITEM_DESCRIPTIONS = {
    'capsule_invocation': 'Contient 5 champions aléatoires',
    'hextech_craft': 'Contient 10 champions aléatoires',
    'forge_legendaire': 'Contient 15 champions aléatoires',
    'bonbon_xp': 'Augmente le niveau d\'un champion de 1'
};

// Couleurs des types d'objets
const TYPE_COLORS = {
    'capsule': '#C27C0E',
    'bonbon': '#E91E63',
    'ressource': '#4CAF50'
};

// Fonction pour créer un embed d'inventaire
function createInventoryEmbed(userId, username, inventory, userAvatar) {
    const embed = new EmbedBuilder()
        .setTitle(`🎒 Inventaire de ${username}`)
        .setDescription('Voici les objets que vous avez collectés')
        .setColor('#3498db')
        .setThumbnail(userAvatar); // Utiliser l'avatar de l'utilisateur
    
    // Regrouper l'inventaire par type
    const groupedInventory = {};
    inventory.forEach(item => {
        if (!groupedInventory[item.itemType]) {
            groupedInventory[item.itemType] = [];
        }
        groupedInventory[item.itemType].push(item);
    });
    
    // Ajouter chaque type d'objet comme un champ
    Object.keys(groupedInventory).forEach(type => {
        const items = groupedInventory[type];
        let fieldValue = '';
        
        items.forEach(item => {
            const description = ITEM_DESCRIPTIONS[item.itemId] || 'Aucune description disponible';
            fieldValue += `**${formatItemName(item.itemId)}** (x${item.quantity}) - ${description}\n`;
        });
        
        embed.addFields({
            name: `${ITEM_TYPES[type] || type.charAt(0).toUpperCase() + type.slice(1)}`,
            value: fieldValue || 'Aucun objet de ce type',
            inline: false
        });
    });
    
    if (inventory.length === 0) {
        embed.setDescription('Votre inventaire est vide. Utilisez `/daily` et `/weekly` pour obtenir des objets!');
    }
    
    return embed;
}

// Fonction pour formater le nom d'un objet
function formatItemName(itemId) {
    return itemId
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Fonction pour obtenir un nombre aléatoire de champions selon le type de capsule
function getChampionCountForCapsule(capsuleType) {
    switch (capsuleType) {
        case 'capsule_invocation':
            return 5; // Exactement 5 champions
        case 'hextech_craft':
            return 10; // Exactement 10 champions
        case 'forge_legendaire':
            return 15; // Exactement 15 champions
        default:
            return 1;
    }
}

// Fonction pour sélectionner des champions aléatoires
function getRandomChampions(count) {
    const champions = [];
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * allChampions.length);
        champions.push(allChampions[randomIndex]);
    }
    return champions;
}

// Fonction pour utiliser une capsule et ajouter des champions
async function useCapsule(interaction, userId, capsuleType) {
    // Utiliser la capsule de l'inventaire
    const success = useInventoryItem(userId, 'capsule', capsuleType, 1);
    
    if (!success) {
        await interaction.editReply({
            content: '⚠️ Vous n\'avez pas cet objet dans votre inventaire ou une erreur est survenue.',
            components: []
        });
        return;
    }
    
    // Déterminer le nombre de champions à donner
    const championCount = getChampionCountForCapsule(capsuleType);
    
    // Sélectionner des champions aléatoires
    const selectedChampions = getRandomChampions(championCount);
    
    // Créer un embed pour afficher les champions obtenus
    const embed = new EmbedBuilder()
        .setTitle(`🎁 ${formatItemName(capsuleType)} Ouverte!`)
        .setDescription(`Vous avez obtenu ${championCount} champions:`)
        .setColor(TYPE_COLORS['capsule']);
    
    // Ajouter les champions à l'utilisateur et à l'embed
    let championsField = '';
    
    for (const champion of selectedChampions) {
        // Vérifier si l'utilisateur possède déjà ce champion
        const existingChampion = getUserChampion(userId, champion.id);
        
        if (existingChampion) {
            // Le champion est un doublon, ajouter un doublon
            const updatedChampion = addChampionDuplicate(userId, champion.id);
            
            if (updatedChampion) {
                championsField += `**${champion.name}** - Doublon! (${updatedChampion.duplicates}/10) +10% stats\n`;
            } else {
                championsField += `**${champion.name}** - Doublon! (Max atteint)\n`;
            }
        } else {
            // Nouveau champion, l'ajouter à la collection
            addChampionToUser(userId, champion.id, false);
            championsField += `**${champion.name}** - Nouveau champion!\n`;
        }
    }
    
    embed.addFields({
        name: 'Champions obtenus',
        value: championsField,
        inline: false
    });
    
    // Répondre avec l'embed
    await interaction.editReply({
        embeds: [embed],
        components: []
    });
}

// TODO: Ajouter la fonction pour utiliser un bonbon XP (dans une prochaine mise à jour)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('Consultez et utilisez les objets de votre inventaire'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Créer ou récupérer l'utilisateur
        getOrCreateUser(userId, username);
        
        // Récupérer l'inventaire de l'utilisateur
        const inventory = getUserInventory(userId);
        
        // Créer l'embed pour afficher l'inventaire
        const inventoryEmbed = createInventoryEmbed(userId, username, inventory, interaction.user.avatarURL());
        
        // Créer des boutons pour utiliser différents types d'objets
        const actionRow = new ActionRowBuilder();
        
        // Vérifier si l'utilisateur a des capsules
        const hasCapsules = inventory.some(item => item.itemType === 'capsule');
        if (hasCapsules) {
            actionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId('use_capsule')
                    .setLabel('Utiliser une capsule')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📦')
            );
        }
        
        // Vérifier si l'utilisateur a des bonbons XP
        const hasCandy = inventory.some(item => item.itemType === 'bonbon');
        if (hasCandy) {
            actionRow.addComponents(
                new ButtonBuilder()
                    .setCustomId('use_candy')
                    .setLabel('Utiliser un bonbon XP')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🍬')
            );
        }
        
        // Si l'inventaire est vide, n'afficher aucun bouton
        const components = inventory.length > 0 ? [actionRow] : [];
        
        // Envoyer l'embed avec les boutons
        const response = await interaction.reply({
            embeds: [inventoryEmbed],
            components,
            ephemeral: false,
            fetchReply: true
        });
        
        // Gérer les interactions avec les boutons
        if (components.length > 0) {
            const collector = response.createMessageComponentCollector({ 
                componentType: ComponentType.Button,
                time: 120000 // 2 minutes
            });
            
            collector.on('collect', async i => {
                // Vérifier que c'est bien le propriétaire de l'inventaire qui interagit
                if (i.user.id !== userId) {
                    await i.reply({
                        content: 'Vous ne pouvez pas utiliser les objets d\'un autre joueur.',
                        ephemeral: true
                    });
                    return;
                }
                
                // Traiter l'action selon le bouton
                if (i.customId === 'use_capsule') {
                    // Récupérer les capsules de l'utilisateur
                    const capsules = inventory.filter(item => item.itemType === 'capsule');
                    
                    if (capsules.length === 0) {
                        await i.reply({
                            content: 'Vous n\'avez plus de capsules dans votre inventaire.',
                            ephemeral: true
                        });
                        return;
                    }
                    
                    // S'il n'y a qu'une seule capsule, l'utiliser directement
                    if (capsules.length === 1) {
                        await i.deferUpdate();
                        await useCapsule(i, userId, capsules[0].itemId);
                    } else {
                        // Créer des boutons pour chaque type de capsule
                        const capsuleButtons = new ActionRowBuilder();
                        
                        capsules.forEach(capsule => {
                            capsuleButtons.addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`capsule_${capsule.itemId}`)
                                    .setLabel(`${formatItemName(capsule.itemId)} (x${capsule.quantity})`)
                                    .setStyle(ButtonStyle.Secondary)
                            );
                        });
                        
                        await i.update({
                            content: 'Choisissez une capsule à utiliser:',
                            components: [capsuleButtons]
                        });
                    }
                } else if (i.customId === 'use_candy') {
                    // TODO: Ajouter la logique pour utiliser un bonbon XP
                    await i.reply({
                        content: 'La fonctionnalité pour utiliser les bonbons XP sera bientôt disponible!',
                        ephemeral: true
                    });
                } else if (i.customId.startsWith('capsule_')) {
                    // Extraire le type de capsule
                    const capsuleType = i.customId.replace('capsule_', '');
                    await i.deferUpdate();
                    await useCapsule(i, userId, capsuleType);
                }
            });
            
            collector.on('end', async collected => {
                // Mettre à jour le message pour supprimer les boutons après expiration
                if (collected.size === 0) {
                    try {
                        await interaction.editReply({
                            components: []
                        });
                    } catch (error) {
                        console.error('Erreur lors de la suppression des boutons:', error);
                    }
                }
            });
        }
    }
};