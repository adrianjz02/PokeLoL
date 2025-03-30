# Dossier Config

Ce dossier contient les configurations et paramètres du bot PokeLoL.

## Objectif
Ce dossier regroupe tous les fichiers de configuration et paramètres qui définissent le comportement du bot, stockant les constantes, les variables d'environnement et autres réglages.

## Structure
- Fichiers de configuration organisés par domaine
- Constantes et paramètres centralisés pour faciliter les modifications
- Séparation des configurations du développement et de la production

## Fichiers principaux
- `config.js` - Configuration principale et centralisation des paramètres
- `champions.js` - Données des champions disponibles avec leurs statistiques de base
- `constants.js` - Constantes utilisées dans tout le bot (cooldowns, limites, etc.)
- `emojis.js` - Liste des emojis utilisés pour les interfaces utilisateur
- `elements.js` - Définition du système de types et leurs relations (forces/faiblesses)
- `items.js` - Liste des objets équipables et leurs effets
- `monsters.js` - Configuration des monstres de jungle et leurs drops
- `raids.js` - Configuration des paliers de raid et des raids spéciaux
- `quests.js` - Définition des quêtes disponibles et leurs récompenses

## Avantages
- Centralisation des paramètres pour faciliter les ajustements de gameplay
- Séparation claire entre la logique et les données
- Facilité de mise à jour des valeurs sans modifier le code
- Possibilité d'implémenter des configurations spécifiques au serveur