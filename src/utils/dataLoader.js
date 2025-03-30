const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Utilisation de la dernière version spécifiée
let VERSION = '15.6.1';
const LANGUAGE = 'fr_FR'; // Langue des données (fr_FR pour français)

// URL de base pour Data Dragon
let BASE_URL = `https://ddragon.leagueoflegends.com/cdn/${VERSION}`;

// Informations complémentaires sur les champions qui ne sont pas dans Data Dragon
const CHAMPION_ADDITIONAL_INFO = {
    // Année de sortie des champions (informations de l'univers LoL)
    releaseYears: {
        "Aatrox": 2013, "Ahri": 2011, "Akali": 2010, "Akshan": 2021, "Alistar": 2009,
        "Amumu": 2009, "Anivia": 2009, "Annie": 2009, "Aphelios": 2019, "Ashe": 2009,
        "AurelionSol": 2016, "Azir": 2014, "Bard": 2015, "Belveth": 2022, "Blitzcrank": 2009,
        "Brand": 2011, "Braum": 2014, "Briar": 2023, "Caitlyn": 2011, "Camille": 2016,
        "Cassiopeia": 2010, "Chogath": 2009, "Corki": 2009, "Darius": 2012, "Diana": 2012,
        "Draven": 2012, "DrMundo": 2009, "Ekko": 2015, "Elise": 2012, "Evelynn": 2009,
        "Ezreal": 2010, "Fiddlesticks": 2009, "Fiora": 2012, "Fizz": 2011, "Galio": 2010,
        "Gangplank": 2009, "Garen": 2010, "Gnar": 2014, "Gragas": 2010, "Graves": 2011,
        "Gwen": 2021, "Hecarim": 2012, "Heimerdinger": 2009, "Illaoi": 2015, "Irelia": 2010,
        "Ivern": 2016, "Janna": 2009, "JarvanIV": 2011, "Jax": 2009, "Jayce": 2012,
        "Jhin": 2016, "Jinx": 2013, "Kaisa": 2018, "Kalista": 2014, "Karma": 2011,
        "Karthus": 2009, "Kassadin": 2009, "Katarina": 2009, "Kayle": 2009, "Kayn": 2017,
        "Kennen": 2010, "Khazix": 2012, "Kindred": 2015, "Kled": 2016, "KogMaw": 2010,
        "KSante": 2022, "Leblanc": 2010, "LeeSin": 2011, "Leona": 2011, "Lillia": 2020,
        "Lissandra": 2013, "Lucian": 2013, "Lulu": 2012, "Lux": 2010, "Malphite": 2009,
        "Malzahar": 2010, "Maokai": 2011, "MasterYi": 2009, "Milio": 2023, "MissFortune": 2010,
        "MonkeyKing": 2011, "Mordekaiser": 2010, "Morgana": 2009, "Naafiri": 2023, "Nami": 2012,
        "Nasus": 2009, "Nautilus": 2012, "Neeko": 2018, "Nidalee": 2009, "Nilah": 2022,
        "Nocturne": 2011, "Nunu": 2009, "Olaf": 2010, "Orianna": 2011, "Ornn": 2017,
        "Pantheon": 2010, "Poppy": 2010, "Pyke": 2018, "Qiyana": 2019, "Quinn": 2013,
        "Rakan": 2017, "Rammus": 2009, "RekSai": 2014, "Rell": 2020, "Renata": 2022,
        "Renekton": 2011, "Rengar": 2012, "Riven": 2011, "Rumble": 2011, "Ryze": 2009,
        "Samira": 2020, "Sejuani": 2012, "Senna": 2019, "Seraphine": 2020, "Sett": 2020,
        "Shaco": 2009, "Shen": 2010, "Shyvana": 2011, "Singed": 2009, "Sion": 2009,
        "Sivir": 2009, "Skarner": 2011, "Sona": 2010, "Soraka": 2009, "Swain": 2010,
        "Sylas": 2019, "Syndra": 2012, "TahmKench": 2015, "Taliyah": 2016, "Talon": 2011,
        "Taric": 2009, "Teemo": 2009, "Thresh": 2013, "Tristana": 2009, "Trundle": 2010,
        "Tryndamere": 2009, "TwistedFate": 2009, "Twitch": 2009, "Udyr": 2009, "Urgot": 2010,
        "Varus": 2012, "Vayne": 2011, "Veigar": 2009, "Velkoz": 2014, "Vex": 2021,
        "Vi": 2012, "Viego": 2021, "Viktor": 2011, "Vladimir": 2010, "Volibear": 2011,
        "Warwick": 2009, "Xayah": 2017, "Xerath": 2011, "XinZhao": 2010, "Yasuo": 2013,
        "Yone": 2020, "Yorick": 2011, "Yuumi": 2019, "Zac": 2013, "Zed": 2012,
        "Zeri": 2022, "Ziggs": 2012, "Zilean": 2009, "Zoe": 2017, "Zyra": 2012,
        "Hwei": 2023, "Smolder": 2024, "Briar": 2023, "Neeko": 2018, "Nilah": 2022,
        "Milio": 2023
    },
    
    // Genre des champions
    genders: {
        "male": ["Aatrox", "Akshan", "Alistar", "Amumu", "Aphelios", "AurelionSol", "Azir", "Bard", 
                "Blitzcrank", "Brand", "Braum", "Chogath", "Corki", "Darius", "DrMundo", "Draven", 
                "Ekko", "Ezreal", "Fiddlesticks", "Fizz", "Galio", "Gangplank", "Garen", "Gragas", 
                "Graves", "Hecarim", "Heimerdinger", "Ivern", "JarvanIV", "Jax", "Jayce", "Jhin", 
                "Kayn", "Kennen", "Khazix", "Kled", "KogMaw", "KSante", "LeeSin", "Lucian", 
                "Malphite", "Malzahar", "Maokai", "MasterYi", "Milio", "MonkeyKing", "Mordekaiser", 
                "Nasus", "Nautilus", "Nocturne", "Nunu", "Olaf", "Ornn", "Pantheon", "Pyke", 
                "Rammus", "Renekton", "Rengar", "RekSai", "Ryze", "Sett", "Shaco", "Shen", 
                "Singed", "Sion", "Skarner", "Swain", "Sylas", "TahmKench", "Talon", "Taric", 
                "Teemo", "Thresh", "Trundle", "Tryndamere", "TwistedFate", "Twitch", "Udyr", 
                "Urgot", "Varus", "Veigar", "Velkoz", "Viego", "Viktor", "Vladimir", "Volibear", 
                "Warwick", "Xerath", "XinZhao", "Yasuo", "Yone", "Yorick", "Zac", "Zed", 
                "Ziggs", "Zilean", "Hwei", "Smolder"],
                
        "female": ["Ahri", "Akali", "Anivia", "Annie", "Ashe", "Belveth", "Briar", "Caitlyn", 
                  "Camille", "Cassiopeia", "Diana", "Elise", "Evelynn", "Fiora", "Gwen", 
                  "Illaoi", "Irelia", "Janna", "Jinx", "Kaisa", "Kalista", "Karma", "Katarina", 
                  "Kayle", "Kindred", "Leblanc", "Leona", "Lillia", "Lissandra", "Lulu", "Lux", 
                  "MissFortune", "Morgana", "Naafiri", "Nami", "Neeko", "Nidalee", "Nilah", 
                  "Orianna", "Poppy", "Qiyana", "Quinn", "Rell", "Renata", "Riven", "Samira", 
                  "Sejuani", "Senna", "Seraphine", "Shyvana", "Sivir", "Sona", "Soraka", "Syndra", 
                  "Taliyah", "Tristana", "Vayne", "Vex", "Vi", "Xayah", "Yuumi", "Zeri", "Zoe", "Zyra"],
                  
        "unknown": ["Gnar", "Kindred", "RekSai", "Belveth"]
    },
    
    // Type de portée des champions (melee/ranged)
    attackRange: {
        "melee": ["Aatrox", "Akali", "Alistar", "Amumu", "Blitzcrank", "Braum", "Camille", "Chogath", 
                 "Darius", "Diana", "DrMundo", "Ekko", "Evelynn", "Fiora", "Fizz", "Galio", 
                 "Gangplank", "Garen", "Gnar", "Gragas", "Gwen", "Hecarim", "Illaoi", "Irelia", 
                 "Ivern", "JarvanIV", "Jax", "Kayn", "Kassadin", "Katarina", "Kled", "KSante", 
                 "LeeSin", "Leona", "Lillia", "Malphite", "Maokai", "MasterYi", "Mordekaiser", 
                 "Naafiri", "Nasus", "Nautilus", "Nilah", "Nocturne", "Nunu", "Olaf", "Ornn", 
                 "Pantheon", "Poppy", "Pyke", "Qiyana", "Rammus", "RekSai", "Rell", "Renekton", 
                 "Rengar", "Riven", "Rumble", "Sejuani", "Sett", "Shaco", "Shen", "Shyvana", 
                 "Singed", "Sion", "Skarner", "Sylas", "TahmKench", "Talon", "Taric", "Trundle", 
                 "Tryndamere", "Udyr", "Urgot", "Vi", "Viego", "Volibear", "Warwick", "Wukong", 
                 "XinZhao", "Yasuo", "Yone", "Yorick", "Zac", "Briar"],
                 
        "ranged": ["Ahri", "Akshan", "Anivia", "Annie", "Aphelios", "Ashe", "AurelionSol", "Azir", 
                  "Bard", "Brand", "Caitlyn", "Cassiopeia", "Corki", "Draven", "Elise", "Ezreal", 
                  "Fiddlesticks", "Graves", "Heimerdinger", "Jayce", "Jhin", "Jinx", "Kaisa", 
                  "Kalista", "Karma", "Karthus", "Kayle", "Kennen", "Kindred", "KogMaw", "Leblanc", 
                  "Lissandra", "Lucian", "Lulu", "Lux", "Malzahar", "MissFortune", "Morgana", 
                  "Nami", "Neeko", "Nidalee", "Orianna", "Quinn", "Rakan", "Renata", "Ryze", 
                  "Samira", "Senna", "Seraphine", "Sivir", "Sona", "Soraka", "Swain", "Syndra", 
                  "Taliyah", "Teemo", "Thresh", "Tristana", "TwistedFate", "Twitch", "Varus", 
                  "Vayne", "Veigar", "Velkoz", "Vex", "Viktor", "Vladimir", "Xayah", "Xerath", 
                  "Yuumi", "Zed", "Zeri", "Ziggs", "Zilean", "Zoe", "Zyra", "Hwei", "Smolder", 
                  "Milio"]
    },
    
    // Espèce des champions
    species: {
        "human": ["Akali", "Akshan", "Annie", "Aphelios", "Braum", "Caitlyn", "Camille", "Darius", 
                 "Diana", "Draven", "Ekko", "Ezreal", "Fiora", "Gangplank", "Garen", "Graves", 
                 "Gwen", "Irelia", "JarvanIV", "Jayce", "Jhin", "Jinx", "Kaisa", "Kalista", "Karma", 
                 "Katarina", "Kayle", "Kayn", "KSante", "Leblanc", "LeeSin", "Leona", "Lucian", 
                 "Lux", "MissFortune", "Morgana", "Nilah", "Olaf", "Pantheon", "Pyke", "Qiyana", 
                 "Quinn", "Riven", "Samira", "Sejuani", "Senna", "Seraphine", "Sett", "Shen", 
                 "Sivir", "Sona", "Soraka", "Swain", "Sylas", "Taliyah", "Talon", "Taric", 
                 "Tristana", "TwistedFate", "Vayne", "Vi", "Viktor", "Vladimir", "Xayah", "XinZhao", 
                 "Yasuo", "Yone", "Zed", "Zeri", "Hwei", "Milio"],
                 
        "vastaya": ["Ahri", "Nami", "Neeko", "Rakan", "Rengar", "Wukong", "Xayah", "Sett"],
        
        "yordle": ["Corki", "Heimerdinger", "Kennen", "Kled", "Lulu", "Poppy", "Rumble", "Teemo", 
                  "Tristana", "Veigar", "Yuumi", "Ziggs"],
                  
        "undead": ["Hecarim", "Karthus", "Mordekaiser", "Sion", "Thresh", "Yorick", "Kalista"],
        
        "god-warrior": ["Aatrox", "Azir", "Nasus", "Renekton", "Xerath"],
        
        "void": ["Belveth", "Chogath", "Kaisa", "Kassadin", "Khazix", "KogMaw", "Malzahar", 
               "RekSai", "Velkoz"],
               
        "demon": ["Evelynn", "Fiddlesticks", "Nocturne", "Shaco", "TahmKench"],
        
        "celestial": ["AurelionSol", "Bard", "Soraka", "Zoe"],
        
        "minotaur": ["Alistar"],
        
        "golem": ["Blitzcrank", "Galio", "Malphite"],
        
        "revenant": ["Brand", "Pyke", "Viego"],
        
        "troll": ["Trundle"],
        
        "iceborn": ["Lissandra"],
        
        "chemically-altered": ["DrMundo", "Singed", "Twitch", "Urgot", "Warwick", "Zac"],
        
        "animal": ["Elise", "Nidalee", "Rammus", "Rengar", "Shyvana", "Twitch", "Volibear", "Wukong"],
        
        "spirit": ["Ivern", "Janna", "Kindred", "Lillia", "Nunu", "Ornn", "Udyr", "Volibear"],
        
        "unknown": ["Amumu", "Anivia", "Briar", "Fizz", "Gnar", "Gragas", "Illaoi", "Jax", 
                   "Maokai", "Naafiri", "Nautilus", "Orianna", "Rell", "Renata", "Ryze", 
                   "Skarner", "Syndra", "Vex", "Zilean", "Zyra", "Smolder"]
    }
};

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
 * Détermine le genre d'un champion
 * @param {string} championId - ID du champion
 * @returns {string} Genre du champion (male, female, unknown)
 */
function getChampionGender(championId) {
    for (const [gender, champions] of Object.entries(CHAMPION_ADDITIONAL_INFO.genders)) {
        if (champions.includes(championId)) {
            return gender;
        }
    }
    return "unknown";
}

/**
 * Détermine le type de portée d'un champion (distance/mêlée)
 * @param {string} championId - ID du champion
 * @returns {string} Type de portée (ranged, melee)
 */
function getChampionAttackRange(championId) {
    if (CHAMPION_ADDITIONAL_INFO.attackRange.ranged.includes(championId)) {
        return "ranged";
    }
    return "melee";
}

/**
 * Détermine l'espèce d'un champion
 * @param {string} championId - ID du champion
 * @returns {string} Espèce du champion
 */
function getChampionSpecies(championId) {
    for (const [species, champions] of Object.entries(CHAMPION_ADDITIONAL_INFO.species)) {
        if (champions.includes(championId)) {
            return species;
        }
    }
    return "unknown";
}

/**
 * Récupère l'année de sortie d'un champion
 * @param {string} championId - ID du champion
 * @returns {number} Année de sortie ou année actuelle si inconnue
 */
function getChampionReleaseYear(championId) {
    return CHAMPION_ADDITIONAL_INFO.releaseYears[championId] || new Date().getFullYear();
}

/**
 * Détermine la ressource utilisée par un champion
 * @param {Object} championDetails - Détails du champion
 * @returns {string} Type de ressource
 */
function getChampionResource(championDetails) {
    if (!championDetails.partype) return "None";
    
    const partype = championDetails.partype.toLowerCase();
    
    if (partype.includes("mana")) return "Mana";
    if (partype.includes("energy") || partype.includes("énergie")) return "Energy";
    if (partype.includes("health") || partype.includes("santé")) return "Health";
    if (partype.includes("rage") || partype.includes("fury")) return "Rage";
    if (partype.includes("shield") || partype.includes("bouclier")) return "Shield";
    if (partype.includes("heat") || partype.includes("chaleur")) return "Heat";
    if (partype.includes("bloodwell") || partype.includes("bloodthirst")) return "Blood";
    if (partype.includes("ferocity") || partype.includes("férocité")) return "Ferocity";
    
    return partype || "None";
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
        
        // Récupérer l'année de sortie du champion
        const releaseYear = getChampionReleaseYear(championData.id);
        
        // Récupérer le genre du champion
        const gender = getChampionGender(championData.id);
        
        // Récupérer le type de portée du champion
        const attackRange = getChampionAttackRange(championData.id);
        
        // Récupérer l'espèce du champion
        const species = getChampionSpecies(championData.id);
        
        // Récupérer le type de ressource utilisé par le champion
        const resource = getChampionResource(championDetails);
        
        // Déterminer les positions typiques du champion
        let positions = [];
        if (role === 'marksman') positions.push('bot');
        if (role === 'support') positions.push('support');
        if (role === 'mage') positions.push('mid');
        if (role === 'assassin') positions.push('mid', 'jungle');
        if (role === 'tank') positions.push('top', 'support');
        if (role === 'fighter') positions.push('top', 'jungle');
        
        // Éviter les doublons
        positions = [...new Set(positions)];
        
        // Créer l'objet champion au format PokeLoL avec les nouvelles caractéristiques
        return {
            id: championData.id.toLowerCase(),
            name: championData.name,
            title: championData.title || "",
            region: championDetails.lore ? mapLoreToRegion(championDetails.lore) : 'Runeterra',
            element: baseElementType,
            role: role,
            gender: gender,
            species: species,
            attackRange: attackRange,
            releaseYear: releaseYear,
            resource: resource,
            positions: positions,
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