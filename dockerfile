# Utiliser l'image officielle Node.js
FROM node:23-alpine AS build

# Répertoire de travail dans le container
WORKDIR /app

# Copier le package.json et package-lock.json pour installer les dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances de l'application
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port 3000 pour l'application
EXPOSE 3000

# Lancer l'application en mode développement avec `npm run dev`
CMD ["npm", "run", "dev"]
