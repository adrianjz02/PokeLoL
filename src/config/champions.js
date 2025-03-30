// Configuration des champions starter disponibles pour les nouveaux joueurs
module.exports = {
    // Liste des champions starter disponibles avec leurs statistiques et informations
    starterChampions: [
        {
            id: "ashe",
            name: "Ashe",
            title: "La Reine des Glaces",
            region: "Freljord",
            element: "glace",
            role: "marksman",
            difficulty: 1, // échelle de 1 à 3
            stats: {
                hp: 100,
                attack: 35,
                defense: 15,
                specialAttack: 30,
                specialDefense: 15,
                speed: 20
            },
            abilities: [
                "Volée de flèches",
                "Flèche enchantée",
                "Flèche de cristal"
            ],
            description: "Ashe est une championne à distance facile à maîtriser avec des capacités de gel et de ralentissement.",
            imageUrl: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ashe_0.jpg",
            iconUrl: "https://ddragon.leagueoflegends.com/cdn/13.5.1/img/champion/Ashe.png"
        },
        {
            id: "garen",
            name: "Garen",
            title: "La Force de Demacia",
            region: "Demacia",
            element: "normal",
            role: "fighter",
            difficulty: 1, // échelle de 1 à 3
            stats: {
                hp: 150,
                attack: 30,
                defense: 30,
                specialAttack: 10,
                specialDefense: 25,
                speed: 15
            },
            abilities: [
                "Frappe décisive",
                "Courage",
                "Justice démacienne"
            ],
            description: "Garen est un champion robuste et simple à jouer, idéal pour les débutants qui préfèrent être en première ligne.",
            imageUrl: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Garen_0.jpg",
            iconUrl: "https://ddragon.leagueoflegends.com/cdn/13.5.1/img/champion/Garen.png"
        },
        {
            id: "ahri",
            name: "Ahri",
            title: "La Renarde à Neuf Queues",
            region: "Ionia",
            element: "fée",
            role: "mage",
            difficulty: 2, // échelle de 1 à 3
            stats: {
                hp: 90,
                attack: 15,
                defense: 15,
                specialAttack: 40,
                specialDefense: 20,
                speed: 30
            },
            abilities: [
                "Orbe d'illusion",
                "Feu follet",
                "Assaut spirituel"
            ],
            description: "Ahri est une mage mobile avec de bonnes capacités d'attaque magique et d'esquive.",
            imageUrl: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
            iconUrl: "https://ddragon.leagueoflegends.com/cdn/13.5.1/img/champion/Ahri.png"
        }
    ],
    
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
            weakAgainst: ["plante", "électrique"]
        },
        plante: {
            strongAgainst: ["eau", "roche", "sol"],
            weakAgainst: ["feu", "glace", "poison", "vol", "insecte"]
        },
        électrique: {
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
            strongAgainst: ["feu", "électrique", "poison", "roche", "acier"],
            weakAgainst: ["eau", "plante", "glace"]
        },
        vol: {
            strongAgainst: ["plante", "combat", "insecte"],
            weakAgainst: ["électrique", "glace", "roche"]
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