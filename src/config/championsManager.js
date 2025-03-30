const fs = require('fs');
const path = require('path');

// Chemin vers le fichier JSON des champions
const championsJsonPath = path.join(__dirname, 'allChampions.json');

let allChampions = [];
let starterChampions = [];
let championsByRole = {};
let championsByRegion = {};
let championsByElement = {};
let championsByType = {}; // Ajout d'une classification par type (pour les skins)

// Fonction pour charger les champions depuis le fichier JSON
function loadChampions() {
    try {
        // Vérifier si le fichier existe
        if (fs.existsSync(championsJsonPath)) {
            // Charger et parser le fichier JSON
            const championData = JSON.parse(fs.readFileSync(championsJsonPath, 'utf8'));
            allChampions = championData;
            
            // Créer les champions starter (on sélectionne des champions faciles par rôle)
            starterChampions = [
                // On cherche un tireur facile
                allChampions.find(c => c.role === 'marksman') || 
                allChampions.find(c => c.role === 'marksman'),
                
                // On cherche un combattant facile
                allChampions.find(c => c.role === 'fighter') || 
                allChampions.find(c => c.role === 'fighter'),
                
                // On cherche un mage facile
                allChampions.find(c => c.role === 'mage') || 
                allChampions.find(c => c.role === 'mage')
            ];
            
            // Organiser les champions par rôle
            championsByRole = {
                marksman: allChampions.filter(c => c.role === 'marksman'),
                fighter: allChampions.filter(c => c.role === 'fighter'),
                mage: allChampions.filter(c => c.role === 'mage'),
                assassin: allChampions.filter(c => c.role === 'assassin'),
                tank: allChampions.filter(c => c.role === 'tank'),
                support: allChampions.filter(c => c.role === 'support')
            };
            
            // Organiser les champions par région
            allChampions.forEach(champion => {
                if (!championsByRegion[champion.region]) {
                    championsByRegion[champion.region] = [];
                }
                championsByRegion[champion.region].push(champion);
            });
            
            // Organiser les champions par élément
            allChampions.forEach(champion => {
                if (!championsByElement[champion.element]) {
                    championsByElement[champion.element] = [];
                }
                championsByElement[champion.element].push(champion);
            });
            
            // Organiser les skins par type
            const types = ['acier', 'combat', 'dragon', 'eau', 'électrik', 'feu', 'fée', 'glace', 
                          'insecte', 'normal', 'plante', 'poison', 'psy', 'roche', 'sol', 
                          'spectre', 'ténèbres', 'vol'];
            
            // Initialiser les tableaux pour chaque type
            types.forEach(type => {
                championsByType[type] = [];
            });
            
            // Ajouter les skins aux tableaux par type
            allChampions.forEach(champion => {
                champion.skins.forEach(skin => {
                    if (championsByType[skin.type]) {
                        championsByType[skin.type].push({
                            championId: champion.id,
                            championName: champion.name,
                            skin: skin
                        });
                    }
                });
            });
            
            console.log(`✅ ${allChampions.length} champions chargés avec succès!`);
            return true;
        } else {
            console.error(`❌ Le fichier de champions n'existe pas encore à ${championsJsonPath}`);
            console.error(`Exécutez d'abord 'node generate-champions.js' pour générer le fichier.`);
            
            // Charger les champions par défaut depuis champions.js
            const { starterChampions: defaultStarters } = require('./champions');
            starterChampions = defaultStarters;
            allChampions = defaultStarters;
            
            return false;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des champions:', error);
        
        // Charger les champions par défaut depuis champions.js
        const { starterChampions: defaultStarters } = require('./champions');
        starterChampions = defaultStarters;
        allChampions = defaultStarters;
        
        return false;
    }
}

// Charger les champions au démarrage
loadChampions();

// Fonction pour obtenir un champion aléatoire
function getRandomChampion(options = {}) {
    let filteredChampions = [...allChampions];
    
    // Filtrer par rôle si spécifié
    if (options.role) {
        filteredChampions = filteredChampions.filter(c => c.role === options.role);
    }
    
    // Filtrer par région si spécifiée
    if (options.region) {
        filteredChampions = filteredChampions.filter(c => c.region === options.region);
    }
    
    // Filtrer par élément si spécifié
    if (options.element) {
        filteredChampions = filteredChampions.filter(c => c.element === options.element);
    }
    
    // Si aucun champion ne correspond aux critères, retourner null
    if (filteredChampions.length === 0) return null;
    
    // Sélectionner un champion aléatoire parmi les champions filtrés
    const randomIndex = Math.floor(Math.random() * filteredChampions.length);
    return filteredChampions[randomIndex];
}

// Fonction pour obtenir un skin aléatoire d'un type spécifique
function getRandomSkinByType(type) {
    if (!championsByType[type] || championsByType[type].length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * championsByType[type].length);
    return championsByType[type][randomIndex];
}

// Fonction pour trouver un champion par son nom ou ID
function findChampion(nameOrId) {
    nameOrId = nameOrId.toLowerCase().trim();
    
    // Chercher par ID exact
    const championById = allChampions.find(c => c.id.toLowerCase() === nameOrId);
    if (championById) return championById;
    
    // Chercher par nom exact
    const championByName = allChampions.find(c => c.name.toLowerCase() === nameOrId);
    if (championByName) return championByName;
    
    // Chercher par correspondance partielle du nom
    const championByPartialName = allChampions.find(c => c.name.toLowerCase().includes(nameOrId));
    if (championByPartialName) return championByPartialName;
    
    // Aucun champion trouvé
    return null;
}

// Fonctions utilitaires pour l'affichage des champions
function getColorByElement(element) {
    const colors = {
        normal: 0xA8A77A,
        feu: 0xEE8130,
        eau: 0x6390F0,
        électrik: 0xF7D02C,
        plante: 0x7AC74C,
        glace: 0x96D9D6,
        combat: 0xC22E28,
        poison: 0xA33EA1,
        sol: 0xE2BF65,
        vol: 0xA98FF3,
        psy: 0xF95587,
        insecte: 0xA6B91A,
        roche: 0xB6A136,
        spectre: 0x735797,
        dragon: 0x6F35FC,
        ténèbres: 0x705746,
        acier: 0xB7B7CE,
        fée: 0xD685AD
    };
    
    return colors[element] || 0x7B8D8E; // Couleur par défaut
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRoleName(role) {
    const roles = {
        marksman: "Tireur",
        fighter: "Combattant",
        mage: "Mage",
        assassin: "Assassin", 
        tank: "Tank",
        support: "Support"
    };
    
    return roles[role] || role;
}

function getStatsString(stats) {
    return `HP: ${stats.hp}
Mana: ${stats.mana}
Dégâts d'attaque: ${stats.attackDamage}
Puissance: ${stats.abilityPower}
Vitesse d'attaque: ${stats.attackSpeed}
Hâte: ${stats.abilityHaste}
Chance critique: ${stats.criticalChance}%
Pouvoir de soin: ${stats.healShieldPower}%
Pénétration d'armure: ${stats.armorPenetration}%
Pénétration magique: ${stats.magicPenetration}%
Vol de vie: ${stats.lifeSteal}%
Omnivamp: ${stats.omnivamp}%`;
}

// Exporter les fonctions et les données
module.exports = {
    loadChampions,
    allChampions,
    starterChampions,
    championsByRole,
    championsByRegion,
    championsByElement,
    championsByType,
    getRandomChampion,
    getRandomSkinByType,
    findChampion,
    // Fonctions utilitaires
    getColorByElement,
    capitalizeFirstLetter,
    getRoleName,
    getStatsString,
    // Types d'éléments et leurs relations (forces/faiblesses)
    elements: {
        normal: {
            strongAgainst: [],
            weakAgainst: ["combat"]
        },
        feu: {
            strongAgainst: ["plante", "insecte", "glace", "acier"],
            weakAgainst: ["eau", "roche", "sol"]
        },
        eau: {
            strongAgainst: ["feu", "roche", "sol"],
            weakAgainst: ["plante", "électrik"]
        },
        plante: {
            strongAgainst: ["eau", "roche", "sol"],
            weakAgainst: ["feu", "glace", "poison", "vol", "insecte"]
        },
        électrik: {
            strongAgainst: ["eau", "vol"],
            weakAgainst: ["sol"]
        },
        glace: {
            strongAgainst: ["plante", "sol", "vol", "dragon"],
            weakAgainst: ["feu", "combat", "roche", "acier"]
        },
        combat: {
            strongAgainst: ["normal", "glace", "roche", "ténèbres", "acier"],
            weakAgainst: ["vol", "psy", "fée"]
        },
        poison: {
            strongAgainst: ["plante", "fée"],
            weakAgainst: ["sol", "psy"]
        },
        sol: {
            strongAgainst: ["feu", "électrik", "poison", "roche", "acier"],
            weakAgainst: ["eau", "plante", "glace"]
        },
        vol: {
            strongAgainst: ["plante", "combat", "insecte"],
            weakAgainst: ["électrik", "glace", "roche"]
        },
        psy: {
            strongAgainst: ["combat", "poison"],
            weakAgainst: ["insecte", "ténèbres", "spectre"]
        },
        insecte: {
            strongAgainst: ["plante", "psy", "ténèbres"],
            weakAgainst: ["feu", "vol", "roche"]
        },
        roche: {
            strongAgainst: ["feu", "glace", "vol", "insecte"],
            weakAgainst: ["eau", "plante", "combat", "sol", "acier"]
        },
        spectre: {
            strongAgainst: ["psy", "spectre"],
            weakAgainst: ["ténèbres", "spectre"]
        },
        dragon: {
            strongAgainst: ["dragon"],
            weakAgainst: ["glace", "dragon", "fée"]
        },
        ténèbres: {
            strongAgainst: ["psy", "spectre"],
            weakAgainst: ["combat", "insecte", "fée"]
        },
        acier: {
            strongAgainst: ["glace", "roche", "fée"],
            weakAgainst: ["feu", "combat", "sol"]
        },
        fée: {
            strongAgainst: ["combat", "dragon", "ténèbres"],
            weakAgainst: ["poison", "acier"]
        }
    }
};