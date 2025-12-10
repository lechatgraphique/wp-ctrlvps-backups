# WP Ctrl Backups

Application web pour gérer les sauvegardes WordPress sur un VPS avec interface moderne.

## 🚀 Stack Technique

- **Frontend** : Angular 21 + PrimeNG 21 + Tailwind CSS v4
- **Backend** : Node.js + Express + TypeScript
- **Connexion** : SSH2 pour interagir avec le VPS

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- Clé SSH configurée pour accéder au VPS

## 🔧 Installation

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Éditez .env avec vos informations VPS
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## ⚙️ Configuration

### Variables d'environnement Backend

Créez un fichier `backend/.env` basé sur `backend/.env.example` :

```env
VPS_HOST=votre-vps.example.com
VPS_USER=deploy
VPS_PORT=22
VPS_PRIVATE_KEY_PATH=~/.ssh/votre_cle_ssh
VPS_BACKUP_DIR=/home/deploy/docker-services/backups
PORT=3000
```

⚠️ **Important** : Ne commitez jamais le fichier `.env` contenant vos vraies informations !

## 🔐 Sécurité

- Les fichiers `.env` sont automatiquement ignorés par Git
- Les clés SSH ne doivent jamais être commitées
- Utilisez des variables d'environnement pour toutes les données sensibles

## 📁 Structure du Projet

```
wp-ctrlvps-backups/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── server.ts
│   │   ├── services/
│   │   ├── routes/
│   │   └── types/
│   ├── .env.example
│   └── package.json
├── frontend/            # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   └── services/
│   │   └── styles.scss
│   └── package.json
├── .gitignore
└── README.md
```

## 🎯 Fonctionnalités

- 📊 Dashboard avec statistiques système (CPU, RAM, Disque)
- 📈 Graphiques de taux de succès/erreur des backups
- 📋 Visualisation des logs de sauvegarde
- 🚨 Alertes et notifications
- 💾 Gestion des backups (liste, téléchargement)
- 🔄 Restauration de backups

## 📡 API Endpoints

- `GET /api/logs` - Récupère les logs de backup
- `GET /api/alerts` - Récupère les alertes
- `GET /api/backups/mysql/:project` - Liste des backups MySQL
- `GET /api/backups/files/:project` - Liste des backups fichiers
- `GET /api/stats/system` - Statistiques système
- `GET /api/stats/backups` - Statistiques de backups
- `POST /api/restore/mysql/:project` - Restaurer backup MySQL
- `POST /api/restore/files/:project` - Restaurer backup fichiers

## 🛠️ Développement

### Backend

```bash
cd backend
npm run dev      # Mode développement avec watch
npm run build    # Compilation TypeScript
npm start        # Production
```

### Frontend

```bash
cd frontend
npm start        # Serveur de développement (http://localhost:4200)
npm run build    # Build de production
```

## 📄 Licence

Ce projet est privé et confidentiel.
