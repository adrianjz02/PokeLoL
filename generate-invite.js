require('dotenv').config();

// Récupérer le CLIENT_ID depuis le fichier .env
const clientId = process.env.CLIENT_ID;

if (!clientId) {
  console.error('ERROR: CLIENT_ID n\'est pas défini dans le fichier .env');
  process.exit(1);
}

// Calculer les permissions nécessaires
// 8 = Permission Administrator (pour le développement)
// Pour la production, vous devriez utiliser des permissions plus précises:
// 2147483648 = APPLICATION_COMMANDS (pour les commandes slash)
// 274877906944 = BOT (requis pour les bots)
// 68608 = SEND_MESSAGES + READ_MESSAGE_HISTORY (pour envoyer des messages et lire l'historique)
// Total pour production: 274877975552

// Pour le développement, utilisons simplement Administrator (8)
const permissions = 8;

// Générer l'URL d'invitation
const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;

console.log('==============================================');
console.log('🤖 URL D\'INVITATION DU BOT POKELOL 🤖');
console.log('==============================================');
console.log(inviteUrl);
console.log('==============================================');
console.log('Instructions:');
console.log('1. Copiez l\'URL ci-dessus et ouvrez-la dans votre navigateur');
console.log('2. Sélectionnez le serveur où vous souhaitez ajouter le bot');
console.log('3. Autorisez les permissions demandées');
console.log('4. Vérifiez que le bot apparaît bien dans la liste des membres du serveur');
console.log('==============================================');