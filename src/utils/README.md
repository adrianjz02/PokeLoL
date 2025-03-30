# Dossier Utils

Ce dossier contient les utilitaires et fonctions réutilisables du bot PokeLoL.

## Objectif
Ce dossier regroupe des fonctions et utilitaires qui seront utilisés dans l'ensemble du projet pour faciliter des tâches communes et récurrentes, assurant ainsi une meilleure organisation et évitant la duplication de code.

## Structure
- Les utilitaires sont organisés par domaine fonctionnel
- Chaque fichier contient des fonctions connexes réutilisables
- Ces fonctions sont importées et utilisées dans tout le projet

## Utilitaires principaux
- `embedBuilder.js` - Fonctions pour créer des messages embed Discord formatés
- `pagination.js` - Système pour naviguer dans les listes de résultats (champions, inventaire, etc.)
- `economyUtils.js` - Fonctions pour gérer les transactions et récompenses
- `combatUtils.js` - Fonctions pour calculer les dégâts, résoudre les combats, etc.
- `timeUtils.js` - Fonctions pour gérer les cooldowns, les rafraîchissements quotidiens, etc.
- `randomUtils.js` - Fonctions pour les tirages aléatoires (drops, apparitions de monstres, etc.)
- `dataLoader.js` - Fonctions pour charger et traiter les données des champions et objets
- `imageGenerator.js` - Fonctions pour générer des images comme les cartes de profil

## Utilisation
Ces utilitaires visent à:
- Maintenir un code propre et DRY (Don't Repeat Yourself)
- Standardiser les interactions et affichages
- Faciliter la maintenance et les mises à jour
- Assurer la cohérence dans l'ensemble du bot