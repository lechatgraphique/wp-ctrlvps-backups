# Backend API - WP Ctrl Backups

API backend Node.js/Express pour la gestion des sauvegardes WordPress sur le VPS.

## 🚀 Installation

```bash
npm install
```

## ⚙️ Configuration

1. Copiez le fichier `.env.example` vers `.env` :
```bash
cp .env.example .env
```

2. Configurez les variables d'environnement dans `.env` :
```env
VPS_HOST=votre-vps.example.com
VPS_USER=deploy
VPS_PORT=22
VPS_PRIVATE_KEY_PATH=~/.ssh/votre_cle_ssh
VPS_BACKUP_DIR=/home/deploy/docker-services/backups
PORT=3000
```

## 🏃 Développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## 🏗️ Build

```bash
npm run build
npm start
```

## 📡 Endpoints API

### GET /api/logs
Récupère tous les logs de backup combinés.

**Réponse :**
```json
[
  {
    "timestamp": "2024-12-10T12:00:00.000Z",
    "level": "info",
    "message": "Backup MySQL montfreeride started"
  }
]
```

### GET /api/logs/alerts
Récupère les alertes de backup.

**Réponse :**
```json
[
  {
    "timestamp": "2024-12-10T12:00:00.000Z",
    "message": "Dernière sauvegarde MySQL Montfreeride trop ancienne",
    "type": "warning"
  }
]
```

### GET /health
Vérifie l'état du serveur.

## 🔐 Authentification SSH

Le backend se connecte au VPS via SSH. Deux méthodes sont supportées :

1. **Clé privée SSH** (recommandé) : Configurez `VPS_PRIVATE_KEY_PATH`
2. **Mot de passe** : Configurez `VPS_PASSWORD`

## 📝 Structure

```
backend/
├── src/
│   ├── server.ts              # Point d'entrée
│   ├── services/
│   │   ├── ssh.service.ts     # Service SSH
│   │   └── log-parser.service.ts  # Parser de logs
│   ├── routes/
│   │   └── logs.routes.ts     # Routes API pour les logs
│   └── types/
│       └── index.ts           # Types TypeScript
├── package.json
├── tsconfig.json
└── README.md
```

