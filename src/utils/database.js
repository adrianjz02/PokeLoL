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
                lastWeekly TEXT DEFAULT NULL,
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
                duplicates INTEGER DEFAULT 0,
                FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE,
                UNIQUE(userId, championId)
            )
        `).run();
        
        // Créer la table d'inventaire
        db.prepare(`
            CREATE TABLE IF NOT EXISTS inventory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                itemType TEXT NOT NULL,
                itemId TEXT NOT NULL,
                quantity INTEGER DEFAULT 1,
                dateAcquired TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE,
                UNIQUE(userId, itemType, itemId)
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

/**
 * Vérifie si un utilisateur a déjà récupéré ses récompenses aujourd'hui
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} rewardType - Type de récompense ('daily' ou 'weekly')
 * @returns {Boolean} - true si l'utilisateur a déjà récupéré ses récompenses dans la période
 */
function hasClaimedRewards(userId, rewardType) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    const today = new Date().toISOString().split('T')[0];
    const field = rewardType === 'daily' ? 'lastDaily' : 'lastWeekly';
    
    // Vérifier d'abord si la colonne lastWeekly existe
    if (rewardType === 'weekly') {
        try {
            // Vérifier si la colonne existe dans la table users
            const columns = db.prepare("PRAGMA table_info(users)").all();
            const columnExists = columns.some(column => column.name === 'lastWeekly');
            
            if (!columnExists) {
                // Ajouter la colonne si elle n'existe pas
                db.prepare("ALTER TABLE users ADD COLUMN lastWeekly TEXT DEFAULT NULL").run();
                console.log("Colonne lastWeekly ajoutée à la table users");
                return false; // L'utilisateur n'a pas encore récupéré les récompenses
            }
        } catch (error) {
            console.error("Erreur lors de la vérification/ajout de la colonne lastWeekly:", error);
            return false;
        }
    }
    
    const user = db.prepare(`SELECT ${field} FROM users WHERE userId = ?`).get(userId);
    
    if (!user || !user[field]) {
        return false;
    }
    
    // Pour les récompenses quotidiennes: vérifier si la dernière récupération était aujourd'hui
    if (rewardType === 'daily') {
        return user[field] === today;
    }
    
    // Pour les récompenses hebdomadaires: vérifier si la dernière récupération était cette semaine
    if (rewardType === 'weekly') {
        // Récupérer la date de dernière réclamation
        const lastClaimedDateStr = user[field];
        
        // Obtenir la date actuelle sans l'heure
        const currentDate = new Date();
        const currentDateStr = currentDate.toISOString().split('T')[0];
        
        // Calculer le début de la semaine actuelle (lundi)
        const currentDay = currentDate.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
        
        // Créer une date pour le lundi de cette semaine
        const mondayDate = new Date(currentDate);
        mondayDate.setDate(currentDate.getDate() - daysFromMonday);
        const mondayDateStr = mondayDate.toISOString().split('T')[0];
        
        console.log(`Weekly check - User: ${userId}`);
        console.log(`Last claimed: ${lastClaimedDateStr}`);
        console.log(`Current date: ${currentDateStr}`);
        console.log(`Monday of this week: ${mondayDateStr}`);
        
        // Vérifier si la dernière réclamation est après ou égale au lundi de cette semaine
        return lastClaimedDateStr >= mondayDateStr;
    }
    
    return false;
}

/**
 * Marque un utilisateur comme ayant récupéré ses récompenses
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} rewardType - Type de récompense ('daily' ou 'weekly')
 */
function markRewardsClaimed(userId, rewardType) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    const today = new Date().toISOString().split('T')[0];
    const field = rewardType === 'daily' ? 'lastDaily' : 'lastWeekly';
    
    db.prepare(`UPDATE users SET ${field} = ? WHERE userId = ?`).run(today, userId);
}

/**
 * Ajoute un objet à l'inventaire de l'utilisateur
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} itemType - Type d'objet ('capsule', 'bonbon', etc.)
 * @param {String} itemId - ID de l'objet ('capsule_invocation', 'bonbon_xp', etc.)
 * @param {Number} quantity - Quantité à ajouter
 * @returns {Boolean} - true si l'ajout a réussi
 */
function addItemToInventory(userId, itemType, itemId, quantity = 1) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    try {
        const now = new Date().toISOString();
        
        // Vérifier si l'objet existe déjà dans l'inventaire
        const existingItem = db.prepare(
            'SELECT * FROM inventory WHERE userId = ? AND itemType = ? AND itemId = ?'
        ).get(userId, itemType, itemId);
        
        if (existingItem) {
            // Mettre à jour la quantité
            db.prepare(
                'UPDATE inventory SET quantity = quantity + ? WHERE id = ?'
            ).run(quantity, existingItem.id);
        } else {
            // Ajouter un nouvel objet
            db.prepare(`
                INSERT INTO inventory (userId, itemType, itemId, quantity, dateAcquired)
                VALUES (?, ?, ?, ?, ?)
            `).run(userId, itemType, itemId, quantity, now);
        }
        
        return true;
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un objet à l'inventaire:", error);
        return false;
    }
}

/**
 * Récupère tous les objets de l'inventaire d'un utilisateur
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} [itemType] - Type d'objet optionnel pour filtrer les résultats
 * @returns {Array} - Liste des objets de l'inventaire
 */
function getUserInventory(userId, itemType = null) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    if (itemType) {
        return db.prepare(
            'SELECT * FROM inventory WHERE userId = ? AND itemType = ? ORDER BY dateAcquired DESC'
        ).all(userId, itemType);
    } else {
        return db.prepare(
            'SELECT * FROM inventory WHERE userId = ? ORDER BY itemType, dateAcquired DESC'
        ).all(userId);
    }
}

/**
 * Vérifie si un champion existe déjà dans la collection de l'utilisateur
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} championId - ID du champion à vérifier
 * @returns {Object|null} - Données du champion s'il existe, sinon null
 */
function getUserChampion(userId, championId) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    return db.prepare('SELECT * FROM user_champions WHERE userId = ? AND championId = ?').get(userId, championId);
}

/**
 * Ajoute un doublon à un champion existant
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} championId - ID du champion à mettre à jour
 * @returns {Object|null} - Données du champion après mise à jour
 */
function addChampionDuplicate(userId, championId) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    try {
        const champion = getUserChampion(userId, championId);
        
        if (!champion) {
            return null;
        }
        
        // Vérifier si le champion a déjà atteint le maximum de doublons (10)
        if (champion.duplicates >= 10) {
            // Ajouter des Riot Points à l'utilisateur au lieu d'ajouter un doublon
            // Cette fonctionnalité sera implémentée plus tard
            return champion;
        }
        
        // Mettre à jour le nombre de doublons
        db.prepare(`
            UPDATE user_champions 
            SET duplicates = duplicates + 1 
            WHERE userId = ? AND championId = ?
        `).run(userId, championId);
        
        return getUserChampion(userId, championId);
    } catch (error) {
        console.error("Erreur lors de l'ajout d'un doublon:", error);
        return null;
    }
}

/**
 * Utilise un objet de l'inventaire (réduit sa quantité)
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} itemType - Type d'objet
 * @param {String} itemId - ID de l'objet
 * @param {Number} quantity - Quantité à utiliser
 * @returns {Boolean} - true si l'utilisation a réussi
 */
function useInventoryItem(userId, itemType, itemId, quantity = 1) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    try {
        const item = db.prepare(
            'SELECT * FROM inventory WHERE userId = ? AND itemType = ? AND itemId = ?'
        ).get(userId, itemType, itemId);
        
        if (!item || item.quantity < quantity) {
            return false;
        }
        
        if (item.quantity === quantity) {
            // Supprimer l'objet s'il ne reste plus rien
            db.prepare('DELETE FROM inventory WHERE id = ?').run(item.id);
        } else {
            // Réduire la quantité
            db.prepare(
                'UPDATE inventory SET quantity = quantity - ? WHERE id = ?'
            ).run(quantity, item.id);
        }
        
        return true;
    } catch (error) {
        console.error("Erreur lors de l'utilisation d'un objet:", error);
        return false;
    }
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
    getUserChampion,
    addChampionDuplicate,
    hasPlayedToday,
    markUserPlayed,
    getDailyChampion,
    addRewards,
    hasClaimedRewards,
    markRewardsClaimed,
    addItemToInventory,
    getUserInventory,
    useInventoryItem,
    updateChampionFavoriteStatus
};

/**
 * Met à jour le statut favori d'un champion
 * @param {String} userId - ID Discord de l'utilisateur
 * @param {String} championId - ID du champion à mettre à jour
 * @param {Boolean} isFavorite - Nouveau statut favori
 * @returns {Object|null} - Données du champion après mise à jour
 */
function updateChampionFavoriteStatus(userId, championId, isFavorite) {
    // Vérifier que la connexion est ouverte
    if (!db || !db.open) {
        if (!openConnection()) {
            throw new Error("La connexion à la base de données n'est pas disponible");
        }
    }
    
    try {
        const champion = getUserChampion(userId, championId);
        
        if (!champion) {
            return null;
        }
        
        // Mettre à jour le statut favori
        db.prepare(`
            UPDATE user_champions 
            SET isFavorite = ? 
            WHERE userId = ? AND championId = ?
        `).run(isFavorite ? 1 : 0, userId, championId);
        
        return getUserChampion(userId, championId);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut favori:", error);
        return null;
    }
}