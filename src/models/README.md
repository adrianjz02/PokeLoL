# Dossier Models

Ce dossier contient les modèles de données du bot PokeLoL.

## Objectif
Ce dossier comprend les structures de données et les interfaces pour tous les éléments du jeu, facilitant l'interaction avec la base de données et assurant la cohérence des données.

## Structure
- Chaque modèle correspond à une entité du jeu
- Les modèles définissent les schémas de données et les méthodes associées
- Ils servent de couche d'abstraction pour les opérations de la base de données

## Modèles principaux
- `Champion.js` - Définit les champions (PokéLoL) avec leurs stats, compétences, niveau, etc.
- `User.js` - Définit les données des joueurs (dresseurs), inventaire, progression, etc.
- `Skin.js` - Définit les skins disponibles et leurs effets élémentaires
- `Item.js` - Définit les objets équipables et leurs bonus de statistiques
- `Monster.js` - Définit les monstres de jungle et leurs caractéristiques
- `Raid.js` - Définit les raids, leurs niveaux et leurs récompenses
- `Quest.js` - Définit les quêtes journalières, hebdomadaires et de serveur
- `Craft.js` - Définit les recettes et ressources pour le crafting

## Organisation des données
Chaque joueur a:
- Une collection de champions
- Un inventaire d'objets et ressources
- Des statistiques de progression
- Un historique des activités

Ces modèles seront utilisés par tous les autres composants du bot pour assurer une manipulation cohérente des données.