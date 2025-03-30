const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Utilisation de la dernière version spécifiée
let VERSION = '15.6.1';
const LANGUAGE = 'fr_FR'; // Langue des données (fr_FR pour français)

// URL de base pour Data Dragon
let BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${VERSION}`;

/**
 * Récupère la dernière version disponible de l'API Data Dragon
 * @returns {Promise<string>} La dernière version
 */
async function getLatestVersion() {
    try {
        const response = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json');
        return response.data[0]; // La première version est la plus récente
    } catch (error) {
        console.error('Erreur lors de la récupération de la dernière version, utilisation de la version par défaut:', error);
        return VERSION; // Retourne la version par défaut en cas d'erreur
    }
}

/**
 * Initialise la version et l'URL de base
 */
async function initialize() {
    // Nous utilisons directement la version 15.6.1 comme demandé
    BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${VERSION}`;
    console.log(`Utilisation de la version ${VERSION} de Data Dragon`);
}

/**
 * Récupère tous les champions depuis l'API Data Dragon
 * @returns {Promise<Object>} Données des champions
 */
async function fetchAllChampions() {
    try {
        const response = await axios.get(`${BASE_URL}/data/${LANGUAGE}/champion.json`);
        return response.data.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des champions:', error);
        throw error;
    }
}

/**
 * Récupère les détails d'un champion spécifique
 * @param {string} championId - ID du champion (ex: "Ashe")
 * @returns {Promise<Object>} Détails du champion
 */
async function fetchChampionDetails(championId) {
    try {
        const response = await axios.get(`${BASE_URL}/data/${LANGUAGE}/champion/${championId}.json`);
        return response.data.data[championId];
    } catch (error) {
        console.error(`Erreur lors de la récupération des détails de ${championId}:`, error);
        throw error;
    }
}

/**
 * Convertit le type de champion LoL en type d'élément Pokémon
 * @param {string} tags - Tags du champion LoL
 * @returns {string} Type d'élément
 */
function getLolElementType(tags) {
    // Mapping des tags LoL vers des types Pokémon
    const typeMapping = {
        'Fighter': 'combat',
        'Tank': 'roche',
        'Mage': 'psy',
        'Assassin': 'ténèbres',
        'Support': 'fée',
        'Marksman': 'normal'
    };
    
    // Si le champion a plusieurs tags, prend le premier qui a une correspondance
    for (const tag of tags) {
        if (typeMapping[tag]) return typeMapping[tag];
    }
    
    return 'normal'; // Type par défaut
}

/**
 * Attribue un type à un skin basé sur son thème
 * @param {string} skinName - Nom du skin
 * @param {string} championBaseType - Type de base du champion
 * @param {string} championName - Nom du champion pour les cas spéciaux
 * @returns {string} Type attribué au skin
 */
function getSkinType(skinName, championBaseType, championName) {
    if (skinName === 'default') return championBaseType;
    
    skinName = skinName.toLowerCase();
    championName = championName.toLowerCase();
    
    // Mappages de mots-clés dans les noms de skins vers des types
    const skinTypeKeywords = {
        'feu': 'feu',
        'flamme': 'feu',
        'infernal': 'feu',
        'volcan': 'feu',
        'brûl': 'feu',
        'phoenix': 'feu',
        'rouge': 'feu',
        'ignite': 'feu',
        
        'eau': 'eau',
        'océan': 'eau',
        'mer': 'eau',
        'marin': 'eau',
        'aqua': 'eau',
        'profond': 'eau',
        'marée': 'eau',
        'pirate': 'eau',
        'piscine': 'eau',
        'rivière': 'eau',
        'bleu': 'eau',
        
        'plante': 'plante',
        'fleur': 'plante',
        'forêt': 'plante',
        'sylvestre': 'plante',
        'bois': 'plante',
        'jungle': 'plante',
        'vert': 'plante',
        'nature': 'plante',
        
        'électr': 'électrik',
        'foudre': 'électrik',
        'orage': 'électrik',
        'tonnerre': 'électrik',
        'pulsefire': 'électrik',
        'projet': 'électrik',
        'jaune': 'électrik',
        'cyber': 'électrik',
        
        'glace': 'glace',
        'gel': 'glace',
        'neige': 'glace',
        'arctique': 'glace',
        'freljord': 'glace',
        'hivern': 'glace',
        'frost': 'glace',
        'cryo': 'glace',
        'hiver': 'glace',
        
        'poison': 'poison',
        'toxic': 'poison',
        'venom': 'poison',
        'zaun': 'poison',
        'chimique': 'poison',
        'contamination': 'poison',
        'radiation': 'poison',
        'violet': 'poison',
        
        'acier': 'acier',
        'métal': 'acier',
        'hextech': 'acier',
        'robot': 'acier',
        'mecha': 'acier',
        'machine': 'acier',
        'gris': 'acier',
        'program': 'acier',
        'steel': 'acier',
        'chrome': 'acier',
        
        'dragon': 'dragon',
        'drake': 'dragon',
        'wyvern': 'dragon',
        'shenlong': 'dragon',
        'dracomancien': 'dragon',
        
        'combat': 'combat',
        'lutte': 'combat',
        'guerr': 'combat',
        'boxe': 'combat',
        'arts martiaux': 'combat',
        'karaté': 'combat',
        'champion': 'combat',
        'sumo': 'combat',
        
        'psy': 'psy',
        'mental': 'psy',
        'cosmique': 'psy',
        'céleste': 'psy',
        'arcane': 'psy',
        'astral': 'psy',
        'divin': 'psy',
        'oracle': 'psy',
        'espace': 'psy',
        
        'roche': 'roche',
        'pierre': 'roche',
        'géologie': 'roche',
        'montagne': 'roche',
        'cristal': 'roche',
        'mineur': 'roche',
        
        'sol': 'sol',
        'terre': 'sol',
        'sable': 'sol',
        'désert': 'sol',
        'shurima': 'sol',
        'brun': 'sol',
        'séisme': 'sol',
        
        'vol': 'vol',
        'aile': 'vol',
        'oiseau': 'vol',
        'phénix': 'vol',
        'aérien': 'vol',
        'tempête': 'vol',
        'papillon': 'vol',
        'plume': 'vol',
        
        'insecte': 'insecte',
        'scarabée': 'insecte',
        'arachn': 'insecte',
        'araignée': 'insecte',
        'beetle': 'insecte',
        'fourmi': 'insecte',
        'papillon': 'insecte',
        
        'spectre': 'spectre',
        'fantôm': 'spectre',
        'mort': 'spectre',
        'âme': 'spectre',
        'esprit': 'spectre',
        'shadow': 'spectre',
        'cauchemar': 'spectre',
        'halloween': 'spectre',
        'ghost': 'spectre',
        
        'ténèbres': 'ténèbres',
        'obscur': 'ténèbres',
        'sombre': 'ténèbres',
        'noir': 'ténèbres',
        'nuit': 'ténèbres',
        'lune': 'ténèbres',
        'dark': 'ténèbres',
        'maudit': 'ténèbres',
        'corrupt': 'ténèbres',
        
        'fée': 'fée',
        'étoile': 'fée',
        'gardien': 'fée',
        'enchant': 'fée',
        'magie': 'fée',
        'k/da': 'fée',
        'rose': 'fée',
        'arcade': 'fée',
        'star': 'fée',
        'pyjama': 'fée'
    };
    
    // Associations spécifiques pour certains skins connus
    const specificSkins = {
        'dark cosmic': 'ténèbres',
        'cosmic': 'psy',
        'PROJECT': 'électrik',
        'true damage': 'électrik',
        'pool party': 'eau',
        'blood moon': 'spectre',
        'elderwood': 'plante',
        'deep sea': 'eau',
        'worldbreaker': 'sol',
        'dark star': 'ténèbres',
        'super galaxy': 'feu',
        'arcade': 'fée',
        'battle boss': 'électrik',
        'spirit blossom': 'spectre',
        'odyssey': 'psy',
        'lunar': 'psy',
        'solar': 'feu',
        'void': 'ténèbres',
        'high noon': 'feu',
        'resistance': 'acier',
        'demacia': 'fée',
        'noxus': 'ténèbres',
        'ionia': 'psy',
        'freljord': 'glace',
        'bilgewater': 'eau',
        'piltover': 'acier',
        'zaun': 'poison',
        'shurima': 'sol',
        'void': 'ténèbres',
        'star guardian': 'fée',
        'winter': 'glace',
        'prehistoric': 'roche',
        'program': 'acier',
        'jurassic': 'dragon',
        'warring kingdoms': 'combat',
        'battlecast': 'acier',
        'halloween': 'spectre'
    };
    
    // Vérifier d'abord dans les associations spécifiques
    for (const [skinKey, type] of Object.entries(specificSkins)) {
        if (skinName.includes(skinKey.toLowerCase())) {
            return type;
        }
    }
    
    // Ensuite parcourir les mots-clés généraux
    for (const [keyword, type] of Object.entries(skinTypeKeywords)) {
        if (skinName.includes(keyword.toLowerCase())) {
            return type;
        }
    }
    
    // Si aucun mot-clé ne correspond, attribuer en fonction du nom du champion
    if (championName === 'brand' || championName === 'annie') return 'feu';
    if (championName === 'nami' || championName === 'fizz') return 'eau';
    if (championName === 'ivern' || championName === 'maokai') return 'plante';
    if (championName === 'kennen' || championName === 'volibear') return 'électrik';
    if (championName === 'lissandra' || championName === 'nunu') return 'glace';
    if (championName === 'singed' || championName === 'twitch') return 'poison';
    if (championName === 'ornn' || championName === 'blitzcrank') return 'acier';
    if (championName === 'shyvana' || championName === 'aurelion sol') return 'dragon';
    if (championName === 'lee sin' || championName === 'vi') return 'combat';
    if (championName === 'syndra' || championName === 'karma') return 'psy';
    if (championName === 'malphite' || championName === 'taliyah') return 'roche';
    if (championName === 'azir' || championName === 'renekton') return 'sol';
    if (championName === 'anivia' || championName === 'quinn') return 'vol';
    if (championName === 'khazix' || championName === 'elise') return 'insecte';
    if (championName === 'thresh' || championName === 'hecarim') return 'spectre';
    if (championName === 'nocturne' || championName === 'kayn') return 'ténèbres';
    if (championName === 'lulu' || championName === 'janna') return 'fée';
    
    // Si toujours aucune correspondance, retourner le type de base du champion
    return championBaseType;
}

/**
 * Essaie de déterminer la région d'un champion à partir de son lore
 * @param {string} lore - Lore du champion
 * @returns {string} Région du champion
 */
function mapLoreToRegion(lore) {
    const regions = {
        'Demacia': ['demacia', 'démacia'],
        'Noxus': ['noxus'],
        'Ionia': ['ionia', 'ionien'],
        'Freljord': ['freljord'],
        'Shurima': ['shurima'],
        'Piltover': ['piltover'],
        'Zaun': ['zaun'],
        'Bilgewater': ['bilgewater'],
        'Shadow Isles': ['îles obscures', 'iles obscures', 'shadow isles'],
        'Void': ['néant', 'vide', 'void'],
        'Bandle City': ['bandle', 'yordle'],
        'Targon': ['targon'],
        'Ixtal': ['ixtal']
    };
    
    lore = lore.toLowerCase();
    
    for (const [region, keywords] of Object.entries(regions)) {
        for (const keyword of keywords) {
            if (lore.includes(keyword)) return region;
        }
    }
    
    return 'Runeterra';
}

/**
 * Crée un objet champion au format PokeLoL avec les nouvelles statistiques demandées
 * @param {Object} championData - Données du champion depuis l'API
 * @param {Object} championDetails - Détails du champion (sorts, etc.)
 * @returns {Object} Champion au format PokeLoL
 */
function createPokeLolChampion(championData, championDetails) {
    try {
        // Extraire les sorts sous forme de tableau de noms et coûts
        const abilities = championDetails.spells.map(spell => ({
            name: spell.name,
            costType: spell.costType || 'None',  // Valeur par défaut si indéfini
            costBurn: spell.costBurn || '0',     // Valeur par défaut si indéfini
            cost: spell.cost || [0],             // Valeur par défaut si indéfini
            description: spell.description || "" // Valeur par défaut si indéfini
        }));
        
        // Élément de base du champion
        const baseElementType = getLolElementType(championData.tags);
        
        // Déterminer le rôle principal
        const role = championData.tags[0].toLowerCase();
        
        // Créer les stats de base pour ce champion selon les nouvelles demandes
        const stats = {
            hp: Math.round((championData.stats.hp || 500) * 0.7),  // Valeur par défaut si indéfini
            mana: Math.round((championData.stats.mp || 300) * 0.7), // Valeur par défaut si indéfini
            attackDamage: Math.round((championData.stats.attackdamage || 50) * 1.2), // Valeur par défaut si indéfini
            abilityPower: 0,
            attackSpeed: parseFloat(((championData.stats.attackspeed || 0.625) + 0.1).toFixed(2)), // Valeur par défaut si indéfini
            abilityHaste: 0,
            criticalChance: 0,
            healShieldPower: 0,
            armorPenetration: 0,
            magicPenetration: 0,
            lifeSteal: 0,
            omnivamp: 0
        };
        
        // Ajuster les stats en fonction du rôle
        switch (role) {
            case 'marksman':
                stats.attackDamage += 15;
                stats.attackSpeed += 0.1;
                stats.criticalChance = 5;
                stats.armorPenetration = 5;
                stats.lifeSteal = 3;
                break;
            case 'fighter':
                stats.hp += 50;
                stats.attackDamage += 10;
                stats.lifeSteal = 3;
                stats.omnivamp = 2;
                break;
            case 'mage':
                stats.mana += 100;
                stats.abilityPower = 20;
                stats.abilityHaste = 5;
                stats.magicPenetration = 5;
                break;
            case 'assassin':
                stats.attackDamage += 15;
                stats.armorPenetration = 7;
                stats.lifeSteal = 2;
                stats.attackSpeed += 0.05;
                break;
            case 'tank':
                stats.hp += 100;
                stats.mana += 50;
                stats.abilityHaste = 5;
                break;
            case 'support':
                stats.mana += 50;
                stats.abilityHaste = 10;
                stats.healShieldPower = 10;
                break;
        }
        
        // S'assurer que championDetails.skins existe et est un tableau
        const skins = championDetails.skins || [{ id: championData.id + "0", num: 0, name: "default" }];
        
        // Créer les skins avec leurs types
        const championSkins = skins.map(skin => ({
            id: skin.id || `${championData.id}_${skin.num || 0}`,
            name: skin.name === 'default' ? 'Default' : (skin.name || 'Default'),
            imageUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championData.id}_${skin.num || 0}.jpg`,
            type: getSkinType(skin.name || 'default', baseElementType, championData.name)
        }));
        
        // Créer l'objet champion au format PokeLoL avec les nouvelles stats
        return {
            id: championData.id.toLowerCase(),
            name: championData.name,
            title: championData.title || "",
            region: championDetails.lore ? mapLoreToRegion(championDetails.lore) : 'Runeterra',
            element: baseElementType,
            role: role,
            stats: stats,
            abilities: abilities.slice(0, Math.min(abilities.length, 3)), // Limiter à 3 capacités ou moins si pas assez
            description: championData.blurb || "",
            imageUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championData.id}_0.jpg`,
            iconUrl: `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${championData.id}.png`,
            skins: championSkins
        };
    } catch (error) {
        console.error(`Erreur dans createPokeLolChampion pour ${championData.id}:`, error);
        throw error;
    }
}

/**
 * Récupère tous les champions et exporte au format PokeLoL
 */
async function fetchAndExportAllChampions() {
    try {
        // Initialiser avec la version spécifiée 15.6.1
        await initialize();
        
        console.log('Récupération de tous les champions...');
        const allChampions = await fetchAllChampions();
        
        // Créer un tableau pour stocker tous les champions au format PokeLoL
        const pokeLolChampions = [];
        
        // Tous les champions
        const championKeys = Object.keys(allChampions);
        
        console.log(`Traitement de ${championKeys.length} champions...`);
        
        for (const championKey of championKeys) {
            try {
                console.log(`Récupération des détails de ${championKey}...`);
                const championDetails = await fetchChampionDetails(championKey);
                
                // Vérifier si les détails ont été correctement récupérés
                if (!championDetails) {
                    console.error(`Aucun détail retourné pour ${championKey}, on continue...`);
                    continue;
                }
                
                const pokeLolChampion = createPokeLolChampion(allChampions[championKey], championDetails);
                pokeLolChampions.push(pokeLolChampion);
                // Petite pause pour éviter de surcharger l'API
                await new Promise(resolve => setTimeout(resolve, 200)); // Délai de 200ms
            } catch (error) {
                console.error(`Erreur détaillée avec le champion ${championKey}:`, error.message);
                // continuer avec le champion suivant
            }
        }
        
        // Écrire le résultat dans un fichier JSON
        const outputPath = path.join(__dirname, '..', 'config', 'allChampions.json');
        
        // Vérifier si nous avons récupéré des champions
        if (pokeLolChampions.length === 0) {
            throw new Error("Aucun champion n'a pu être récupéré. Vérifiez les erreurs ci-dessus.");
        }
        
        await fs.writeFile(outputPath, JSON.stringify(pokeLolChampions, null, 2));
        
        console.log(`✅ ${pokeLolChampions.length} champions ont été exportés vers ${outputPath}`);
        return pokeLolChampions;
    } catch (error) {
        console.error('Erreur lors de l\'exportation des champions:', error);
        throw error;
    }
}

module.exports = {
    fetchAllChampions,
    fetchChampionDetails,
    fetchAndExportAllChampions,
    getLatestVersion
};