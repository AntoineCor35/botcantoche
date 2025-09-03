# 🍽️ Bot Discord Cantoche

Bot Discord automatique qui récupère et envoie les menus de cantine des écoles de Rennes Métropole (secteur 3) avec une séparation claire entre le repas du midi et le goûter.

## ✨ Fonctionnalités

- **📅 Menu du jour** : Commande `/today` pour le menu d'aujourd'hui
- **🌅 Menu de demain** : Commande `/demain` pour le menu de demain  
- **📆 Menu de la semaine** : Commande `/semaine` pour les menus de la semaine en cours
- **🕐 Envoi automatique** : Tous les jours à 08h00 (lun/mar/jeu/ven)
- **🍰 Séparation claire** : Distinction entre dessert du midi et goûter
- **🏫 Secteur 3** : Menus des cantines du secteur 3 de Rennes

## 🚀 Déploiement

### Prérequis

- [Docker](https://docs.docker.com/get-docker/) et [Docker Compose](https://docs.docker.com/compose/install/)
- [Bot Discord](https://discord.com/developers/applications) créé et configuré
- Serveur ou machine avec accès internet

### 1. Cloner le projet

```bash
git clone https://github.com/AntoineCor35/botcantoche.git
cd botcantoche
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# Discord Bot Configuration
TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
CHANNEL_ID=your_channel_id_here
```

**Comment obtenir ces valeurs :**
- **TOKEN** : Dans votre [Application Discord](https://discord.com/developers/applications) → Bot → Token
- **CLIENT_ID** : Dans votre Application Discord → General Information → Application ID
- **GUILD_ID** : ID de votre serveur Discord (clic droit sur le nom du serveur → Copier l'identifiant)
- **CHANNEL_ID** : ID du canal où envoyer les menus (clic droit sur le canal → Copier l'identifiant)

### 3. Lancer le bot

```bash
# Construire et démarrer le conteneur
docker compose up -d --build

# Vérifier que le bot fonctionne
docker compose logs cantoche-bot

# Voir les logs en temps réel
docker compose logs -f cantoche-bot
```

### 4. Tester le bot

Dans Discord, sur votre serveur configuré :
- `/today` → Menu du jour
- `/demain` → Menu de demain
- `/semaine` → Menus de la semaine

## 🏗️ Architecture

```
├── docker-compose.yml    # Configuration Docker
├── dockerfile           # Image Docker du bot
├── index.js            # Code principal du bot
├── package.json        # Dépendances Node.js
├── .env               # Variables d'environnement (non commité)
└── .gitignore         # Fichiers exclus de Git
```

## 🔧 Commandes utiles

```bash
# Démarrer le bot
docker compose up -d

# Arrêter le bot
docker compose down

# Redémarrer le bot
docker compose restart

# Voir les logs
docker compose logs cantoche-bot

# Mettre à jour le code
git pull
docker compose up -d --build

# Vérifier le statut
docker compose ps
```

## 📊 API utilisée

Le bot utilise l'[API Rennes Métropole](https://data.rennesmetropole.fr/explore/dataset/menus-cantines/api/) pour récupérer les menus :

- **Endpoint** : `https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/menus-cantines/records`
- **Filtres** : `refine=secteur:"3"&refine=date:"YYYY/MM/DD"`
- **Format** : JSON avec structure détaillée des menus

## 🕐 Planification

Le bot utilise `node-cron` pour automatiser les envois :

- **08h00** : Envoi du menu du jour (lun/mar/jeu/ven)
- **Lundi 08h00** : Envoi des menus de la semaine

## 🔒 Sécurité

- **Tokens Discord** stockés dans des variables d'environnement
- **Fichier `.env`** exclu du versioning Git
- **API publique** Rennes Métropole (pas d'authentification requise)

## 🐛 Dépannage

### Le bot ne répond pas aux commandes
```bash
# Vérifier les logs
docker compose logs cantoche-bot

# Vérifier que le bot est connecté
# Vous devriez voir : "✅ Bot connecté en tant que [Nom]#[Tag]"
```

### Erreur de permissions Discord
- Vérifiez que votre bot a les permissions nécessaires sur le serveur
- Vérifiez que les commandes slash sont activées

### Problème de connexion à l'API
```bash
# Tester l'API manuellement
curl "https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/menus-cantines/records?limit=1"
```

## 📝 Personnalisation

### Changer le secteur de cantine
Modifiez la ligne dans `index.js` :
```javascript
const url = `https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/menus-cantines/records?limit=100&refine=secteur:"3"&refine=date:"${dateFr}"`;
// Changez "3" par le numéro de secteur souhaité
```

### Modifier l'heure d'envoi
Modifiez les crons dans `index.js` :
```javascript
// Tous les jours à 08h00
cron.schedule("0 8 * * 1-5", async () => {
  // Code d'envoi du menu du jour
});

// Le lundi à 08h00
cron.schedule("0 8 * * 1", async () => {
  // Code d'envoi des menus de la semaine
});
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [Rennes Métropole](https://data.rennesmetropole.fr/) pour l'API des menus
- [Discord.js](https://discord.js.org/) pour l'API Discord
- [node-cron](https://github.com/node-cron/node-cron) pour la planification

---

**⚠️ Important** : N'oubliez pas de créer votre fichier `.env` avec vos vraies valeurs Discord avant de lancer le bot !
