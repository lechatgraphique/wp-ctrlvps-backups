# Étape 1: Build Angular
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY angular.json ./
COPY tsconfig*.json ./
COPY tailwind.config.ts ./
COPY .postcssrc.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY src/ ./src/
COPY public/ ./public/

# Builder l'application Angular en mode production
RUN npm run build

# Étape 2: Production avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

