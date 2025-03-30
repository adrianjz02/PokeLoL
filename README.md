# PokeLoL

## Résumé
PokeLoL est un bot Discord qui combine l'univers de League of Legends avec les mécaniques de Pokémon. Les joueurs collectionnent des champions LoL (PokéLoL), les améliorent grâce à un système de doublons et d'expérience, et collaborent pour progresser à travers 100 paliers de raid. Avec des combats contre des monstres de jungle, un système de crafting élaboré et des quêtes quotidiennes, PokeLoL offre une expérience PvE collaborative et évolutive où l'ensemble du serveur travaille vers un objectif commun.

## Description
PokeLoL est un bot Discord qui combine les mécaniques de jeu de Pokémon avec l'univers de League of Legends. Les utilisateurs peuvent choisir un "starter" parmi trois champions de LoL, participer à des jeux quotidiens, faire évoluer leurs champions, combattre des monstres et bien plus encore.

## But principal
Le but ultime du jeu est de progresser collectivement à travers 100 paliers de raids. Chaque jour à heure fixe (20h), un raid sera lancé automatiquement sur le serveur Discord. Tous les dresseurs du serveur pourront y participer en cliquant sur une réaction dans le message d'annonce. Ces raids représentent une progression commune où tous les membres du serveur collaborent pour atteindre le palier 100.

### Progression des paliers
- La difficulté augmente progressivement à chaque nouveau palier
- Les récompenses (XP, ressources, chances de drop) augmentent également avec le niveau des paliers
- Plus le serveur atteint un palier élevé, plus les gains des activités quotidiennes et hebdomadaires sont importants pour tous les joueurs
- Le système de types et faiblesses se débloque progressivement à partir des paliers intermédiaires, ajoutant une nouvelle dimension stratégique au mid/late game

## Fonctionnalités principales

### Système de démarrage
- Chaque utilisateur peut choisir l'un des 3 starters (champions LoL)
- Collection de champions à capturer et à entraîner
- Intégration des skins de LoL avec des bonus de statistiques

### Système d'acquisition de champions
- **Capsule d'Invocation** : Système quotidien de base permettant d'obtenir des PokeLoL
  - Accessible gratuitement une fois par jour via la commande `/capsule`
  - Contient entre 3 et 5 champions aléatoires que le joueur acquiert automatiquement
  - Tous les champions ont la même rareté de base

- **Hextech Craft** : Système d'acquisition intermédiaire nécessitant des matériaux collectés en jeu
  - Accessible via la commande `/hextech` (coûte des ressources spécifiques)
  - Contient entre 8 et 10 champions aléatoires que le joueur acquiert automatiquement
  - Requiert des matériaux comme "Sang de Gromp", "Patte de Carapateur", "Langue de Loup" et un objet de monstre Épique
  - L'objet crafté est stocké dans l'inventaire jusqu'à ce que le joueur décide de l'utiliser

- **Forge Légendaire** : Système d'acquisition premium nécessitant des ressources rares
  - Accessible via la commande `/forge` (coûte une ressource légendaire)
  - Contient entre 13 et 15 champions aléatoires que le joueur acquiert automatiquement
  - Requiert un "Cœur de PokeLoL Légendaire" obtenu uniquement des raids spéciaux (PokeBaron, PokeDrake, PokeAtakhan)
  - L'objet crafté est stocké dans l'inventaire jusqu'à ce que le joueur décide de l'utiliser

- **Événements spéciaux** : Possibilité d'obtenir des skins exclusifs lors d'événements saisonniers
  - Skins temporairement disponibles correspondant à des thèmes saisonniers

### Système de doublons
- Chaque doublon d'un champion augmente sa puissance
- Maximum de 10 doublons par champion
- Chaque doublon donne +10% à toutes les statistiques (jusqu'à +100% avec 10 doublons)
- Les doublons au-delà du maximum sont convertis en Riot Points pour acheter des skins

### Combats contre des monstres de jungle
- Apparition quotidienne de groupes de monstres de la jungle (Void Grubs, Gromp, Loups, Raptors, etc.)
- Participation limitée à 4 dresseurs par combat
- Types de groupes de monstres :
  - **Normal** : Disponibles quotidiennement, récompenses basiques
  - **Épique** : Plus rares, meilleurs drops, plus difficiles
  - **Légendaire** : Limités à 3 fois par semaine, drops premium, très difficiles
- Récompenses : Essence Bleue, XP pour les champions participants
- Drops spécifiques :
  - Ressources pour crafts (Sang de Gromp, Patte de Carapateur, etc.)
  - Chance d'obtenir des capsules selon un pourcentage basé sur le type de monstre
  - Les monstres plus rares ont de meilleures chances de donner des objets plus précieux
- Renouvellement quotidien des groupes de monstres disponibles
- Prévisualisation des monstres et des récompenses potentielles

### Système de quêtes
- **Quêtes personnelles** : Spécifiques à chaque dresseur
  - Quêtes journalières : Récompensent principalement des Capsules d'Invocation
  - Quêtes hebdomadaires : Récompensent des crafts Hextech
  - Récompenses additionnelles : Bonbons XP, ressources diverses, Essence Bleue

- **Quêtes de serveur** : Objectifs communs pour tous les dresseurs
  - Collaboration entre les joueurs
  - Récompenses pour l'ensemble de la communauté

### Gestion d'équipe
- Limite de 6 PokéLoL actifs par dresseur pour les combats et raids
- Système de PC pour stocker les champions supplémentaires
- Interface pour configurer et personnaliser son équipe active
- Possibilité de changer l'ordre des champions dans l'équipe

### Progression
- Système d'expérience pour les champions et les dresseurs
- Rangs de dresseurs avec des niveaux à atteindre
- Récompenses quotidiennes et hebdomadaires selon le niveau du dresseur
- Les PokéLoL commencent au niveau 1 avec uniquement leur compétence de base
- Les compétences ultimes se débloquent à partir d'un certain niveau

### Mini-jeux quotidiens
- **LoLdle** : Jeu quotidien où il faut deviner un champion à partir d'indices
- **Quiz** : Questions quotidiennes sur l'univers de League of Legends
- Défis divers liés à l'univers LoL
- Gains d'XP et de monnaie en jeu
- Tous les mini-jeux sont réinitialisés chaque jour

### Raids
- **Raid de Progression** : Raid quotidien à heure fixe (20h) pour progresser dans les 100 paliers du jeu
  - Tous les dresseurs du serveur peuvent y participer
  - Objectif collectif d'atteindre le palier 100
  - Difficulté progressive à chaque nouveau palier

- **Raids Spéciaux** (PokeBaron, PokeDrake, PokeAtakhan) : Apparitions aléatoires dans la journée/semaine
  - Participation limitée à 4 dresseurs par raid spécial
  - Difficulté adaptative selon le niveau des participants
  - Récompenses en XP et butin pour les participants
  - Fournissent des buffs temporaires qui aideront les dresseurs lors du raid de progression
  - Statistiques détaillées post-raid (dégâts infligés, soins, etc.)

### Personnalisation des champions
- Attribution d'items pour améliorer les stats
- Changement de skins modifiant les statistiques et l'élément
- Classes de champions : Tank, Bruiser, DPS, Healer, Shielder
- Statistiques de base : HP, ARMOR, RM, AP, AD, AS
- Puissance augmentée par le système de doublons
- Système de types et faiblesses (débloqué aux paliers intermédiaires) qui ajoute des bonus/malus lors des combats

### Profil et statistiques
- Vue détaillée du profil du dresseur
- Niveau de dresseur et progression vers le niveau suivant
- Nombre total de PokéLoL capturés et pourcentage de complétion du Pokédex
- Statistiques de combat (victoires, défaites, dégâts totaux, etc.)
- Suivi de toutes les activités disponibles et de leur temps de recharge
- Monnaies et ressources possédées
- Accomplissements débloqués

## Commandes principales
- `/starter` - Choisir son champion de départ
- `/profile` - Afficher son profil de dresseur complet avec statistiques
- `/status` - Consulter les activités disponibles et leurs temps de recharge
- `/daily` - Récupérer des récompenses quotidiennes
- `/weekly` - Récupérer des récompenses hebdomadaires
- `/loldle` - Jouer au jeu de devinette quotidien
- `/quiz` - Participer au quiz quotidien sur League of Legends
- `/champions` - Afficher sa collection de champions
- `/team` - Configurer son équipe active de 6 PokéLoL
- `/pc` - Accéder à tous ses PokéLoL stockés
- `/capsule` - Ouvrir une Capsule d'Invocation quotidienne (obtention de 3-5 champions)
- `/hextech` - Utiliser un Hextech Craft déjà préparé ou en créer un nouveau
- `/forge` - Utiliser une Forge Légendaire déjà préparée ou en créer une nouvelle
- `/jungle` - Voir les groupes de monstres disponibles pour les combats
- `/inventory` - Consulter l'inventaire d'objets, ressources et capsules craftées
- `/craft` - Accéder au menu de craft pour préparer de nouveaux objets
- `/quests` - Consulter les quêtes journalières et hebdomadaires disponibles
- `/server-quests` - Consulter l'avancement des quêtes de serveur
- `/raid` - Consulter l'état d'avancement des 100 paliers du raid principal
- `/raid-history` - Voir l'historique des raids spéciaux vaincus et les buffs actifs
- `/help` - Afficher l'aide et les tutoriels du bot

## Installation
*Instructions d'installation à venir*

## Prérequis techniques
- Node.js
- Discord.js
- Base de données (à définir)

## Roadmap
- [x] Conception initiale
- [ ] Développement du système de starter
- [ ] Implémentation des mini-jeux quotidiens
- [ ] Système de combat de base
- [ ] Système d'économie et de boutique
- [ ] Raids et combats de boss
- [ ] Système d'échange entre joueurs

## Contribuer
Toute contribution au projet est la bienvenue. N'hésitez pas à ouvrir une issue ou une pull request.

## Licence
*À définir*