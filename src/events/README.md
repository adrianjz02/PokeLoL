# Dossier Events

Ce dossier contient tous les gestionnaires d'événements Discord pour le bot PokeLoL.

## Objectif
Ce dossier comprend les fichiers qui réagissent aux différents événements déclenchés par l'API Discord, comme les connexions, les interactions, les messages reçus, etc.

## Structure
- Chaque événement est géré dans son propre fichier JavaScript
- Les événements sont automatiquement chargés et enregistrés au démarrage du bot

## Événements principaux
- `ready.js` - Gère le démarrage du bot (initialisation des commandes, annonce de connexion)
- `interactionCreate.js` - Traite les interactions des utilisateurs (commandes slash, boutons, menus)
- `guildMemberAdd.js` - Gère l'arrivée de nouveaux membres sur le serveur
- `messageCreate.js` - Peut être utilisé pour des fonctionnalités spécifiques liées aux messages

## Fonctionnalités spéciales
- Démarrage planifié des raids quotidiens (à 20h)
- Apparition aléatoire des raids spéciaux
- Mise à jour quotidienne des monstres de jungle disponibles
- Réinitialisation des mini-jeux quotidiens