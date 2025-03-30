// filepath: c:\Users\adrji\Desktop\PokeLoL\src\utils\database.js
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// S'assurer que le dossier data existe
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Chemin vers la base de données
const dbPath = path.join(dataDir, 'pokelol.db');

// Connexion à la base de données
let db = null;

// Fonction pour ouvrir une connexion à la base de données
function openConnection() {
    if (db) {
        try {
            // Fermer la connexion existante si elle est ouverte
            db.close();
        } catch (error) {
            console.warn("Avertissement lors de la fermeture de la connexion existante:", error.message);
        }
    }
    
    try {
        db = new Database(dbPath);
        // Activer les clés étrangères pour maintenir l'intégrité référentielle
        db.pragma('foreign_keys = ON');
        return true;
    } catch (error) {
        console.error("Erreur lors de l'ouverture de la connexion à la base de données:", error);
        return false;
    }
}

// Ouvrir la connexion initiale
openConnection();

// Fonction pour initialiser les tables de la base de données
function initializeDatabase() {
    console.log('Initialisation de la base de données...');
    
    // S'assurer que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            console.error("Impossible d'initialiser la base de données: la connexion a échoué");
            return false;
        }
    }
    
    try {
        // Créer la table des utilisateurs
        db.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                userId TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                createdAt TEXT NOT NULL,
                gold INTEGER DEFAULT 500,
                lastDaily TEXT DEFAULT NULL,
                lastLoldle TEXT DEFAULT NULL,
                lastQuiz TEXT DEFAULT NULL,
                raids_completed INTEGER DEFAULT 0,
                quests_completed INTEGER DEFAULT 0
            )
        `).run();
        
        // Créer la table des champions possédés par les utilisateurs
        db.prepare(`
            CREATE TABLE IF NOT EXISTS user_champions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                championId TEXT NOT NULL,
                level INTEGER DEFAULT 1,
                exp INTEGER DEFAULT 0,
                nextLevelExp INTEGER DEFAULT 100,
                isFavorite INTEGER DEFAULT 0,
                dateAcquired TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE,
                UNIQUE(userId, championId)
            )
        `).run();
        
        // Créer la table des mini-jeux quotidiens
        db.prepare(`
            CREATE TABLE IF NOT EXISTS daily_games (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gameType TEXT NOT NULL,
                championOfTheDay TEXT,
                date TEXT NOT NULL,
                UNIQUE(gameType, date)
            )
        `).run();
        
        console.log('Base de données initialisée avec succès !');
        return true;
    } catch (error) {
        console.error("Erreur lors de l'initialisation des tables:", error);
        return false;
    }
}

// Fonction pour réinitialiser complètement la base de données
function resetDatabase() {
    // Fermer la connexion existante
    if (db && db.open) {
        try {
            db.close();
        } catch (error) {
            console.warn("Avertissement lors de la fermeture de la connexion:", error.message);
        }
        db = null;
    }
    
    // Supprimer le fichier s'il existe
    if (fs.existsSync(dbPath)) {
        try {
            fs.unlinkSync(dbPath);
            console.log('Base de données supprimée avec succès.');
        } catch (error) {
            console.error("Erreur lors de la suppression de la base de données:", error);
            return false;
        }
    }
    
    // Réouvrir la connexion et initialiser les tables
    if (openConnection()) {
        return initializeDatabase();
    }
    
    return false;
}

// Fonctions pour gérer les utilisateurs

/**
 * Crée ou récupère un utilisateur
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} username - Nom d'utilisateur Discord
 * @returns {Object} - Les données de l'utilisateur
 */
function getOrCreateUser(userId, username) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    const user = db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
    
    if (!user) {
        // Créer un nouvel utilisateur
        const now = new Date().toISOString();
        db.prepare(`
            INSERT INTO users (userId, username, createdAt)
            VALUES (?, ?, ?)
        `).run(userId, username, now);
        
        return db.prepare('SELECT * FROM users WHERE userId = ?').get(userId);
    }
    
    return user;
}

/**
 * Vérifie si un utilisateur a déjà un champion starter
 * @param {String} userId - ID Discord de l'utilisateur
 * @returns {Boolean} - true si l'utilisateur a déjà un champion
 */
function hasUserChampion(userId) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    const count = db.prepare('SELECT COUNT(*) as count FROM user_champions WHERE userId = ?').get(userId);
    return count.count > 0;
}

/**
 * Ajoute un champion à la collection d'un utilisateur
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} championId - ID du champion à ajouter
 * @param {Boolean} isFavorite - Si le champion doit être marqué comme favori
 * @returns {Object} - Les données du champion ajouté
 */
function addChampionToUser(userId, championId, isFavorite = false) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    const now = new Date().toISOString();
    
    try {
        db.prepare(`
            INSERT INTO user_champions (userId, championId, isFavorite, dateAcquired)
            VALUES (?, ?, ?, ?)
        `).run(userId, championId, isFavorite ? 1 : 0, now);
        
        return db.prepare('SELECT * FROM user_champions WHERE userId = ? AND championId = ?').get(userId, championId);
    } catch (error) {
        console.error('Erreur lors de l\'ajout du champion:', error);
        return null;
    }
}

/**
 * Récupère tous les champions d'un utilisateur
 * @param {String} userId - ID Discord de l'utilisateur
 * @returns {Array} - Liste des champions de l'utilisateur
 */
function getUserChampions(userId) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    return db.prepare('SELECT * FROM user_champions WHERE userId = ? ORDER BY isFavorite DESC, level DESC').all(userId);
}

// Fonctions pour gérer les mini-jeux quotidiens

/**
 * Vérifie si un utilisateur a déjà joué à un mini-jeu aujourd'hui
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} gameType - Type de mini-jeu ('loldle' ou 'quiz')
 * @returns {Boolean} - true si l'utilisateur a déjà joué aujourd'hui
 */
function hasPlayedToday(userId, gameType) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    const today = new Date().toISOString().split('T')[0];
    const lastPlayField = gameType === 'loldle' ? 'lastLoldle' : 'lastQuiz';
    
    const user = db.prepare(`SELECT ${lastPlayField} FROM users WHERE userId = ?`).get(userId);
    return user && user[lastPlayField] === today;
}

/**
 * Marque un utilisateur comme ayant joué à un mini-jeu aujourd'hui
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} gameType - Type de mini-jeu ('loldle' ou 'quiz')
 */
function markUserPlayed(userId, gameType) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    const today = new Date().toISOString().split('T')[0];
    const lastPlayField = gameType === 'loldle' ? 'lastLoldle' : 'lastQuiz';
    
    db.prepare(`UPDATE users SET ${lastPlayField} = ? WHERE userId = ?`).run(today, userId);
}

/**
 * Obtient ou définit le champion du jour pour un mini-jeu
 * @param {String} gameType - Type de mini-jeu ('loldle')
 * @param {String} [championId] - ID du champion à définir (optionnel)
 * @returns {String|null} - ID du champion du jour ou null si non défini et non fourni
 */
function getDailyChampion(gameType, championId = null) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Vérifier si un champion existe déjà pour aujourd'hui
    const dailyGame = db.prepare('SELECT * FROM daily_games WHERE gameType = ? AND date = ?').get(gameType, today);
    
    if (dailyGame) {
        return dailyGame.championOfTheDay;
    } else if (championId) {
        // Définir un nouveau champion pour aujourd'hui
        db.prepare(`
            INSERT INTO daily_games (gameType, championOfTheDay, date)
            VALUES (?, ?, ?)
        `).run(gameType, championId, today);
        
        return championId;
    }
    
    return null;
}

/**
 * Ajoute des récompenses à un utilisateur
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {Object} rewards - Récompenses à ajouter (gold, exp)
 */
function addRewards(userId, rewards) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    if (rewards.gold) {
        db.prepare('UPDATE users SET gold = gold + ? WHERE userId = ?').run(rewards.gold, userId);
    }
    
    // Si vous ajoutez plus tard un système d'XP pour l'utilisateur (pas seulement pour les champions)
    // vous pourriez l'ajouter ici
}

// Exportation des fonctions
module.exports = {
    db,
    openConnection,
    initializeDatabase,
    resetDatabase,
    getOrCreateUser,
    hasUserChampion,
    addChampionToUser,
    getUserChampions,
    hasPlayedToday,
    markUserPlayed,
    getDailyChampion,
    addRewards
};