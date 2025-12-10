# Étape 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY src/ ./src/

# Builder l'application
RUN npm run build

# Étape 2: Production
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production

# Copier les fichiers buildés depuis le builder
COPY --from=builder /app/dist ./dist

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]

