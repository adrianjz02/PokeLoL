// filepath: c:\Users\adrji\Desktop\PokeLoL\src\commands\quiz.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getColorByElement } = require('../config/championsManager');

// Map pour stocker les joueurs qui ont déjà joué aujourd'hui
const dailyPlayers = new Map();
let lastResetDate = null;

// Définition des récompenses
const REWARDS = {
    ALL_CORRECT: { gold: 300, exp: 75 },
    MOST_CORRECT: { gold: 150, exp: 50 },
    SOME_CORRECT: { gold: 75, exp: 25 },
    FEW_CORRECT: { gold: 25, exp: 10 },
};

// Base de données de questions sur League of Legends
const quizQuestions = [
    {
        question: "Quel champion possède la capacité 'Chasse cosmique' ?",
        options: ["Aurelion Sol", "Bard", "Zoe", "Syndra"],
        correctAnswer: 0,
        difficulty: "moyen"
    },
    {
        question: "Quelle région est en guerre constante avec Noxus ?",
        options: ["Ionia", "Demacia", "Freljord", "Piltover"],
        correctAnswer: 0,
        difficulty: "facile"
    },
    {
        question: "Quelle est la ressource utilisée par Yasuo ?",
        options: ["Mana", "Énergie", "Aucune", "Rage"],
        correctAnswer: 0,
        difficulty: "facile"
    },
    {
        question: "Qui est le frère de Darius ?",
        options: ["Draven", "Swain", "Sion", "Vladimir"],
        correctAnswer: 0,
        difficulty: "facile"
    },
    {
        question: "Quelle arme est forgée à Targon ?",
        options: ["Lame solaire", "Lame lunaire", "Les deux", "Aucune des deux"],
        correctAnswer: 2,
        difficulty: "moyen"
    },
    {
        question: "Qui a fondé les 'Sentinelles de Lumière' ?",
        options: ["Senna", "Lucian", "Viego", "Thresh"],
        correctAnswer: 1,
        difficulty: "difficile"
    },
    {
        question: "Quel item mythique est destiné aux champions AP ?",
        options: ["Rocketbelt Hextech", "Égide Lunaire", "Fendeur Divin", "Ceinture Aérienne"],
        correctAnswer: 0,
        difficulty: "moyen"
    },
    {
        question: "Lequel de ces champions n'appartient PAS à Ionia ?",
        options: ["Xayah", "Rakan", "Karma", "Sett"],
        correctAnswer: 3,
        difficulty: "difficile"
    },
    {
        question: "Qui est l'ennemi juré de Rengar ?",
        options: ["Kha'Zix", "Nidalee", "Warwick", "Yuumi"],
        correctAnswer: 0,
        difficulty: "moyen"
    },
    {
        question: "Quelle ressource utilise Garen ?",
        options: ["Mana", "Énergie", "Aucune", "Furie"],
        correctAnswer: 2,
        difficulty: "facile"
    },
    {
        question: "Qui est le mari de Ashe ?",
        options: ["Braum", "Tryndamere", "Garen", "Jayce"],
        correctAnswer: 1,
        difficulty: "moyen"
    },
    {
        question: "Quel champion peut transformer ses alliés en copies de lui-même ?",
        options: ["Neeko", "Shaco", "LeBlanc", "Wukong"],
        correctAnswer: 0,
        difficulty: "difficile"
    },
    {
        question: "Quelle est la spécialité de Nami ?",
        options: ["Soins", "Tanks", "Dégâts", "Contrôle de foule"],
        correctAnswer: 3,
        difficulty: "moyen"
    },
    {
        question: "Quel champion ne vient PAS du Néant ?",
        options: ["Vel'Koz", "Kai'Sa", "Malzahar", "Kassadin"],
        correctAnswer: 2,
        difficulty: "difficile"
    },
    {
        question: "Qui est le mentor de Kayn ?",
        options: ["Zed", "Shen", "Akali", "Master Yi"],
        correctAnswer: 0,
        difficulty: "moyen"
    },
    {
        question: "Lequel de ces champions a eu le plus de refontes ?",
        options: ["Ryze", "Sion", "Warwick", "Fiddlesticks"],
        correctAnswer: 0,
        difficulty: "difficile"
    },
    {
        question: "Quel champion a été le premier à être créé ?",
        options: ["Annie", "Alistar", "Ryze", "Singed"],
        correctAnswer: 2,
        difficulty: "difficile"
    },
    {
        question: "Quelle est la relation entre Jinx et Vi ?",
        options: ["Ennemies", "Amies", "Sœurs", "Coéquipières"],
        correctAnswer: 2,
        difficulty: "moyen"
    },
    {
        question: "Quel champion peut absorber des âmes pour devenir plus fort ?",
        options: ["Thresh", "Nasus", "Veigar", "Senna"],
        correctAnswer: 0,
        difficulty: "moyen"
    },
    {
        question: "Quel champion peut se transformer en dragon ?",
        options: ["Shyvana", "Aurelion Sol", "Mordekaiser", "Brand"],
        correctAnswer: 0,
        difficulty: "facile"
    }
];

// Fonction pour sélectionner aléatoirement 5 questions pour le quiz du jour
function selectDailyQuestions() {
    const today = new Date().toDateString();
    
    // Si c'est un nouveau jour, réinitialiser les joueurs
    if (!lastResetDate || lastResetDate !== today) {
        dailyPlayers.clear();
        lastResetDate = today;
        console.log("Nouveau jour, réinitialisation des joueurs de quiz");
    }
    
    // Mélanger les questions et prendre les 5 premières
    return [...quizQuestions]
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
}

// Fonction pour déterminer les récompenses en fonction du score
function calculateRewards(score, totalQuestions) {
    if (score === totalQuestions) {
        return REWARDS.ALL_CORRECT;
    } else if (score >= Math.floor(totalQuestions * 0.7)) {
        return REWARDS.MOST_CORRECT;
    } else if (score >= Math.floor(totalQuestions * 0.4)) {
        return REWARDS.SOME_CORRECT;
    } else {
        return REWARDS.FEW_CORRECT;
    }
}

// Crée un embed pour afficher une question
function createQuestionEmbed(question, questionNumber, totalQuestions) {
    const embed = new EmbedBuilder()
        .setTitle(`Quiz LoL - Question ${questionNumber}/${totalQuestions}`)
        .setDescription(question.question)
        .setColor('#3498db')
        .setFooter({ text: `Difficulté: ${question.difficulty}` });
    
    // Ajouter les options comme champs
    question.options.forEach((option, index) => {
        embed.addFields({ name: `Option ${index + 1}`, value: option, inline: true });
    });
    
    return embed;
}

// Crée un embed pour le résultat final
function createResultEmbed(userId, score, totalQuestions) {
    const percentage = Math.floor((score / totalQuestions) * 100);
    const rewards = calculateRewards(score, totalQuestions);
    
    // Simulation d'ajout des récompenses (à remplacer par votre système de base de données)
    console.log(`Récompenses pour ${userId}: ${rewards.gold} or, ${rewards.exp} XP`);
    
    let color;
    let title;
    
    if (percentage === 100) {
        color = '#2ecc71'; // Vert
        title = '🏆 Quiz LoL - Score Parfait! 🏆';
    } else if (percentage >= 70) {
        color = '#f1c40f'; // Jaune/Or
        title = '🎓 Quiz LoL - Excellent Score!';
    } else if (percentage >= 40) {
        color = '#e67e22'; // Orange
        title = '📝 Quiz LoL - Bon Score';
    } else {
        color = '#e74c3c'; // Rouge
        title = '📚 Quiz LoL - Peut Mieux Faire';
    }
    
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(`Vous avez obtenu **${score}/${totalQuestions}** réponses correctes (${percentage}%)`)
        .setColor(color)
        .addFields(
            { name: 'Récompenses', value: `${rewards.gold} or\n${rewards.exp} XP`, inline: true },
            { name: 'Retour', value: 'Revenez demain pour un nouveau quiz!', inline: true }
        );
        
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('Répondez à un quiz quotidien sur League of Legends et gagnez des récompenses!'),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        
        // Vérifier si le joueur a déjà joué aujourd'hui
        if (dailyPlayers.has(userId)) {
            return interaction.reply({
                content: "⚠️ Vous avez déjà participé au quiz aujourd'hui. Revenez demain pour un nouveau quiz!",
                ephemeral: true
            });
        }
        
        // Sélectionner les questions du jour
        const dailyQuestions = selectDailyQuestions();
        
        // Variables pour suivre la progression et le score
        let currentQuestionIndex = 0;
        let score = 0;
        
        // Fonction pour afficher la question actuelle
        async function displayCurrentQuestion() {
            const question = dailyQuestions[currentQuestionIndex];
            const questionEmbed = createQuestionEmbed(question, currentQuestionIndex + 1, dailyQuestions.length);
            
            // Créer les boutons pour chaque option
            const buttons = new ActionRowBuilder()
                .addComponents(
                    ...question.options.map((_, index) => 
                        new ButtonBuilder()
                            .setCustomId(`answer_${index}`)
                            .setLabel(`Option ${index + 1}`)
                            .setStyle(ButtonStyle.Primary)
                    )
                );
                
            return { embed: questionEmbed, components: [buttons] };
        }
        
        // Afficher la première question
        const initialQuestion = await displayCurrentQuestion();
        
        const response = await interaction.reply({
            content: "🧠 **Quiz League of Legends** 🧠\nRépondez aux questions suivantes pour tester vos connaissances sur LoL!",
            embeds: [initialQuestion.embed],
            components: initialQuestion.components,
            fetchReply: true
        });
        
        // Créer un collecteur pour les réponses
        const filter = i => i.customId.startsWith('answer_') && i.user.id === interaction.user.id;
        const collector = response.createMessageComponentCollector({ 
            filter, 
            time: 300000 // 5 minutes
        });
        
        collector.on('collect', async i => {
            const question = dailyQuestions[currentQuestionIndex];
            const answerIndex = parseInt(i.customId.split('_')[1]);
            
            // Vérifier si la réponse est correcte
            const isCorrect = answerIndex === question.correctAnswer;
            
            if (isCorrect) {
                score++;
            }
            
            // Message de feedback
            const feedbackEmbed = new EmbedBuilder()
                .setTitle(isCorrect ? '✅ Correct!' : '❌ Incorrect!')
                .setDescription(isCorrect ? 
                    `Bravo! "${question.options[question.correctAnswer]}" est la bonne réponse.` : 
                    `Dommage! La bonne réponse était: "${question.options[question.correctAnswer]}"`)
                .setColor(isCorrect ? '#2ecc71' : '#e74c3c');
                
            // Passer à la question suivante ou afficher le résultat final
            currentQuestionIndex++;
            
            if (currentQuestionIndex < dailyQuestions.length) {
                // Afficher le feedback puis la prochaine question
                await i.update({
                    embeds: [feedbackEmbed],
                    components: []
                });
                
                // Attendre 2 secondes avant d'afficher la prochaine question
                setTimeout(async () => {
                    const nextQuestion = await displayCurrentQuestion();
                    try {
                        await interaction.editReply({
                            embeds: [nextQuestion.embed],
                            components: nextQuestion.components
                        });
                    } catch (error) {
                        console.error("Erreur lors de l'affichage de la question suivante:", error);
                    }
                }, 2000);
            } else {
                // C'était la dernière question, afficher le résultat final
                dailyPlayers.set(userId, true); // Marquer le joueur comme ayant joué aujourd'hui
                
                // Créer l'embed de résultat
                const resultEmbed = createResultEmbed(userId, score, dailyQuestions.length);
                
                // Afficher d'abord le feedback de la dernière question
                await i.update({
                    embeds: [feedbackEmbed],
                    components: []
                });
                
                // Puis afficher le résultat final après un court délai
                setTimeout(async () => {
                    try {
                        await interaction.editReply({
                            content: "🎯 **Quiz terminé!** 🎯",
                            embeds: [resultEmbed],
                            components: []
                        });
                    } catch (error) {
                        console.error("Erreur lors de l'affichage du résultat final:", error);
                    }
                }, 2000);
                
                // Arrêter le collecteur
                collector.stop();
            }
        });
        
        collector.on('end', async (collected, reason) => {
            if (reason === 'time' && currentQuestionIndex < dailyQuestions.length) {
                // Le temps est écoulé avant que toutes les questions n'aient été répondues
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle('⏱️ Temps écoulé')
                    .setDescription("Vous avez mis trop de temps à répondre. Le quiz s'est terminé.")
                    .setColor('#95a5a6');
                    
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