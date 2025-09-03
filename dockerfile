# Utilise une image Node officielle
FROM node:20-alpine

# Crée un dossier pour l'app
WORKDIR /app

# Copie les fichiers package.json / package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le code du bot
COPY . .

# Démarre le bot
CMD ["node", "index.js"]
