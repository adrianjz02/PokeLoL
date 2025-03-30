// filepath: c:\Users\adrji\Desktop\PokeLoL\src\commands\loldle.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { allChampions, getColorByElement, capitalizeFirstLetter, getRoleName } = require('../config/championsManager');
const { getOrCreateUser, hasPlayedToday, markUserPlayed, getDailyChampion, addRewards } = require('../utils/database');

// Définition des récompenses
const REWARDS = {
    WITHIN_3_ATTEMPTS: { gold: 200, exp: 50 },
    WITHIN_5_ATTEMPTS: { gold: 100, exp: 30 },
    WITHIN_8_ATTEMPTS: { gold: 50, exp: 20 },
    MORE_ATTEMPTS: { gold: 20, exp: 10 },
};

// Map temporaire pour stocker les jeux Loldle actifs (pendant la session uniquement)
const activeGames = new Map();

// Fonction pour sélectionner un nouveau champion du jour
function selectChampionOfTheDay() {
    // Vérifier si un champion du jour existe déjà en base de données
    let championId = getDailyChampion('loldle');
    
    // Si aucun champion n'est défini pour aujourd'hui, en sélectionner un
    if (!championId) {
        // Sélectionner un champion aléatoire
        const randomIndex = Math.floor(Math.random() * allChampions.length);
        const randomChampion = allChampions[randomIndex];
        
        // Enregistrer en base de données
        championId = getDailyChampion('loldle', randomChampion.id);
        
        console.log(`Nouveau champion du jour: ${randomChampion.name}`);
    }
    
    // Trouver et renvoyer le champion complet
    return allChampions.find(champion => champion.id === championId);
}

// Fonction pour trouver un champion par son nom (insensible à la casse)
function findChampionByName(name) {
    if (!name) return null;
    const normalizedName = name.trim().toLowerCase();
    return allChampions.find(champion => champion.name.toLowerCase() === normalizedName);
}

// Fonction pour créer un indice visuel (correct, partiellement correct, incorrect)
function createClueEmbed(guess, attempts, champion) {
    const embed = new EmbedBuilder()
        .setTitle(`Loldle - Tentative ${attempts}`)
        .setDescription('Devinez le champion LoL du jour!')
        .setColor('#3498db');
    
    // Préparer les indices
    // Genre
    const genderMatch = guess.gender === champion.gender ? '✅' : '❌';
    
    // Rôle
    const roleMatch = guess.role === champion.role ? '✅' : '❌';
    
    // Espèce
    const speciesMatch = guess.species === champion.species ? '✅' : '❌';
    
    // Ressource
    const resourceMatch = guess.resource === champion.resource ? '✅' : '❌';
    
    // Type de portée
    const attackRangeMatch = guess.attackRange === champion.attackRange ? '✅' : '❌';
    
    // Région(s)
    const regionMatch = guess.region === champion.region ? '✅' : '❌';
    
    // Année de sortie
    let yearClue = '❌';
    if (guess.releaseYear && champion.releaseYear) {
        if (guess.releaseYear === champion.releaseYear) {
            yearClue = '✅';
        } else if (guess.releaseYear < champion.releaseYear) {
            yearClue = '⬆️'; // Le champion du jour est plus récent
        } else {
            yearClue = '⬇️'; // Le champion du jour est plus ancien
        }
    }
    
    // Pour les positions, vérifier les correspondances partielles
    let positionsMatch = '❌';
    if (Array.isArray(guess.positions) && Array.isArray(champion.positions)) {
        const commonPositions = guess.positions.filter(p => champion.positions.includes(p));
        if (commonPositions.length > 0) {
            if (commonPositions.length === champion.positions.length && 
                commonPositions.length === guess.positions.length) {
                positionsMatch = '✅';
            } else {
                positionsMatch = '🟨'; // Partiellement correct
            }
        }
    }
    
    // Ajouter les champs d'indices
    embed.addFields(
        { name: 'Champion', value: guess.name, inline: true },
        { name: 'Genre', value: `${capitalizeFirstLetter(guess.gender || 'unknown')} ${genderMatch}`, inline: true },
        { name: 'Rôle', value: `${getRoleName(guess.role)} ${roleMatch}`, inline: true },
        { name: 'Espèce', value: `${capitalizeFirstLetter(guess.species || 'unknown')} ${speciesMatch}`, inline: true },
        { name: 'Ressource', value: `${guess.resource || 'None'} ${resourceMatch}`, inline: true },
        { name: 'Type de portée', value: `${guess.attackRange === 'ranged' ? 'Distance' : 'Mêlée'} ${attackRangeMatch}`, inline: true },
        { name: 'Région', value: `${guess.region} ${regionMatch}`, inline: true },
        { name: 'Année de sortie', value: `${guess.releaseYear || 'N/A'} ${yearClue}`, inline: true },
        { name: 'Positions', value: `${Array.isArray(guess.positions) ? guess.positions.join(', ') : 'N/A'} ${positionsMatch}`, inline: true }
    );
    
    return embed;
}

// Fonction pour créer l'embed de victoire
function createVictoryEmbed(userId, attempts, champion) {
    // Déterminer les récompenses en fonction du nombre d'essais
    let rewards;
    if (attempts <= 3) {
        rewards = REWARDS.WITHIN_3_ATTEMPTS;
    } else if (attempts <= 5) {
        rewards = REWARDS.WITHIN_5_ATTEMPTS;
    } else if (attempts <= 8) {
        rewards = REWARDS.WITHIN_8_ATTEMPTS;
    } else {
        rewards = REWARDS.MORE_ATTEMPTS;
    }
    
    // Ajouter les récompenses à l'utilisateur
    addRewards(userId, rewards);
    
    // Créer l'embed de victoire
    const embed = new EmbedBuilder()
        .setTitle('🎉 Félicitations! 🎉')
        .setDescription(`Vous avez deviné correctement: **${champion.name}**!`)
        .setColor('#2ecc71')
        .setThumbnail(champion.iconUrl)
        .setImage(champion.imageUrl)
        .addFields(
            { name: 'Tentatives', value: `${attempts}`, inline: true },
            { name: 'Récompenses', value: `${rewards.gold} or\n${rewards.exp} XP`, inline: true },
            { name: 'Caractéristiques', value: 
              `**Genre:** ${capitalizeFirstLetter(champion.gender || 'unknown')}\n` +
              `**Rôle:** ${getRoleName(champion.role)}\n` +
              `**Espèce:** ${capitalizeFirstLetter(champion.species || 'unknown')}\n` +
              `**Ressource:** ${champion.resource || 'None'}\n` + 
              `**Type de portée:** ${champion.attackRange === 'ranged' ? 'Distance' : 'Mêlée'}\n` +
              `**Région:** ${champion.region}\n` +
              `**Année de sortie:** ${champion.releaseYear || 'N/A'}\n` +
              `**Positions:** ${Array.isArray(champion.positions) ? champion.positions.join(', ') : 'N/A'}`, 
              inline: false },
            { name: 'Retour', value: 'Revenez demain pour deviner un nouveau champion!' }
        );
    
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loldle')
        .setDescription('Devinez le champion LoL du jour et gagnez des récompenses!'),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;
        
        // Créer ou récupérer l'utilisateur
        getOrCreateUser(userId, username);
        
        // Vérifier si l'utilisateur a déjà joué aujourd'hui
        if (hasPlayedToday(userId, 'loldle')) {
            return interaction.reply({
                content: "⚠️ Vous avez déjà joué au Loldle aujourd'hui. Revenez demain pour un nouveau champion!",
                ephemeral: true
            });
        }
        
        // S'assurer qu'un champion du jour est sélectionné
        const champion = selectChampionOfTheDay();
        
        // Créer un nouveau jeu pour l'utilisateur s'il n'en a pas déjà un
        if (!activeGames.has(userId)) {
            activeGames.set(userId, {
                attempts: 0,
                guesses: [],
                maxAttempts: 10,
                gameOver: false
            });
        }
        
        const gameState = activeGames.get(userId);
        
        // Créer le bouton pour ouvrir le modal de devinette
        const guessButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('guess_champion')
                    .setLabel('Deviner un champion')
                    .setStyle(ButtonStyle.Primary)
            );
        
        // Créer l'embed initial
        const initialEmbed = new EmbedBuilder()
            .setTitle('Loldle - PokeLoL')
            .setDescription('Devinez le champion LoL du jour! Vous avez 10 tentatives.\n\nLes indices suivront ce format:\n✅ = Correct\n🟨 = Partiellement correct\n❌ = Incorrect\n⬆️/⬇️ = Plus récent/Plus ancien')
            .setColor('#3498db')
            .setFooter({ text: `Tentative ${gameState.attempts + 1}/10` });
            
        const response = await interaction.reply({
            embeds: [initialEmbed],
            components: [guessButton],
            fetchReply: true
        });
        
        // Créer un collecteur pour les réponses
        const filter = i => i.user.id === interaction.user.id && i.customId === 'guess_champion';
                             
        const collector = response.createMessageComponentCollector({ 
            filter, 
            time: 300000 // 5 minutes
        });
        
        collector.on('collect', async i => {
            // Créer un modal pour saisir le nom du champion
            const modal = new ModalBuilder()
                .setCustomId('champion_guess_modal')
                .setTitle('Deviner un champion');
            
            // Ajouter un champ de texte pour le nom du champion
            const championNameInput = new TextInputBuilder()
                .setCustomId('champion_name')
                .setLabel('Nom du champion')
                .setPlaceholder('Ex: Yasuo, Lux, Ahri...')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            
            // Ajouter le champ au modal
            const firstActionRow = new ActionRowBuilder().addComponents(championNameInput);
            modal.addComponents(firstActionRow);
            
            // Afficher le modal
            await i.showModal(modal);
            
            try {
                // Attendre la soumission du modal
                const modalSubmit = await i.awaitModalSubmit({
                    filter: i => i.customId === 'champion_guess_modal' && i.user.id === interaction.user.id,
                    time: 60000 // 1 minute pour soumettre
                });
                
                // Récupérer le nom du champion saisi
                const championName = modalSubmit.fields.getTextInputValue('champion_name');
                
                // Trouver le champion correspondant
                const guessedChampion = findChampionByName(championName);
                
                if (!guessedChampion) {
                    // Champion non trouvé, envoyer un message d'erreur
                    await modalSubmit.reply({
                        content: `⚠️ Champion non trouvé: "${championName}". Vérifiez l'orthographe et réessayez.`,
                        ephemeral: true
                    });
                    return;
                }
                
                // Incrémenter le nombre de tentatives
                gameState.attempts++;
                
                // Ajouter le champion deviné à la liste des devinettes
                gameState.guesses.push(guessedChampion);
                
                // Vérifier si le joueur a deviné correctement
                if (guessedChampion.id === champion.id) {
                    // Marquer le jeu comme terminé
                    gameState.gameOver = true;
                    
                    // Marquer le joueur comme ayant joué aujourd'hui
                    markUserPlayed(userId, 'loldle');
                    
                    // Supprimer l'état du jeu
                    activeGames.delete(userId);
                    
                    // Créer l'embed de victoire
                    const victoryEmbed = createVictoryEmbed(userId, gameState.attempts, champion);
                    
                    // Répondre avec l'embed de victoire
                    await modalSubmit.update({
                        embeds: [victoryEmbed],
                        components: []
                    });
                    
                    return;
                }
                
                // Vérifier si le joueur a épuisé toutes ses tentatives
                if (gameState.attempts >= gameState.maxAttempts) {
                    // Marquer le jeu comme terminé
                    gameState.gameOver = true;
                    
                    // Marquer le joueur comme ayant joué aujourd'hui
                    markUserPlayed(userId, 'loldle');
                    
                    // Supprimer l'état du jeu
                    activeGames.delete(userId);
                    
                    // Créer l'embed de défaite
                    const defeatEmbed = new EmbedBuilder()
                        .setTitle('Game Over')
                        .setDescription(`Vous avez épuisé vos 10 tentatives. Le champion était **${champion.name}**!`)
                        .setColor('#e74c3c')
                        .setThumbnail(champion.iconUrl)
                        .setImage(champion.imageUrl)
                        .addFields(
                            { name: 'Caractéristiques', value: 
                              `**Genre:** ${capitalizeFirstLetter(champion.gender || 'unknown')}\n` +
                              `**Rôle:** ${getRoleName(champion.role)}\n` +
                              `**Espèce:** ${capitalizeFirstLetter(champion.species || 'unknown')}\n` +
                              `**Ressource:** ${champion.resource || 'None'}\n` + 
                              `**Type de portée:** ${champion.attackRange === 'ranged' ? 'Distance' : 'Mêlée'}\n` +
                              `**Région:** ${champion.region}\n` +
                              `**Année de sortie:** ${champion.releaseYear || 'N/A'}\n` +
                              `**Positions:** ${Array.isArray(champion.positions) ? champion.positions.join(', ') : 'N/A'}`, 
                              inline: false },
                            { name: 'Retour', value: 'Revenez demain pour deviner un nouveau champion!' }
                        );
                        
                    // Répondre avec l'embed de défaite
                    await modalSubmit.update({
                        embeds: [defeatEmbed],
                        components: []
                    });
                    
                    return;
                }
                
                // Créer un indice visuel pour cette tentative
                const clueEmbed = createClueEmbed(guessedChampion, gameState.attempts, champion);
                
                // Ajouter l'historique des tentatives précédentes
                if (gameState.guesses.length > 1) {
                    const historyField = {
                        name: 'Tentatives précédentes',
                        value: gameState.guesses.slice(0, -1).map(g => g.name).join(', '),
                        inline: false
                    };
                    clueEmbed.addFields(historyField);
                }
                
                // Mettre à jour le message avec le nouvel embed et les composants
                await modalSubmit.update({
                    embeds: [clueEmbed],
                    components: [guessButton]
                });
            } catch (error) {
                if (error.code === 'InteractionCollectorError') {
                    console.log('Temps écoulé pour la soumission du modal');
                } else {
                    console.error('Erreur lors du traitement du modal:', error);
                }
            }
        });
        
        collector.on('end', async (collected, reason) => {
            if (reason === 'time' && !gameState.gameOver) {
                // Supprimer l'état du jeu
                activeGames.delete(userId);
                
                // Créer l'embed de fin de temps
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle('Temps écoulé')
                    .setDescription("Vous avez mis trop de temps à répondre. La session Loldle s'est terminée.")
                    .setColor('#95a5a6');
                    
                // Essayer de mettre à jour le message
                try {
                    await interaction.editReply({
                        embeds: [timeoutEmbed],
                        components: []
                    });
                } catch (error) {
                    console.error("Erreur lors de la mise à jour du message après expiration:", error);
                }
            }
        });
    }
};