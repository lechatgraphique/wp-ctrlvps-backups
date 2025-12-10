# WP Ctrl Backups - Frontend

Application Angular 21 pour la gestion des sauvegardes WordPress.

## 🚀 Technologies

- **Angular 21** - Framework frontend
- **PrimeNG 21** - Bibliothèque de composants UI
- **PrimeIcons** - Icônes
- **TypeScript** - Langage de programmation
- **SCSS** - Préprocesseur CSS

## 📋 Prérequis

- Node.js 22+ 
- npm 11+

## 🛠️ Installation

```bash
npm install
```

**Note importante** : 
- PrimeNG 21 nécessite `@primeuix/themes` pour les thèmes
- Tailwind CSS v4 et `tailwindcss-primeui` sont requis pour les styles de base (polices, bordures, etc.)
- La configuration du thème se fait dans `app.config.ts` via `providePrimeNG`
- Les styles Tailwind sont configurés dans `styles.scss`

**Documentation** : https://primeng.org/tailwind

## 🏃 Développement

Lancer le serveur de développement :

```bash
npm start
```

L'application sera accessible sur `http://localhost:4200`

## 🏗️ Build

Générer les fichiers de production :

```bash
npm run build
```

Les fichiers seront générés dans le dossier `dist/frontend`

## 🧪 Tests

Lancer les tests :

```bash
npm test
```

## 📁 Structure du Projet

```
src/
├── app/
│   ├── components/
│   │   ├── dashboard/          # Tableau de bord
│   │   ├── logs/               # Visualisation des logs
│   │   ├── backups/            # Gestion des sauvegardes
│   │   └── restore-dialog/     # Dialogue de restauration
│   ├── services/
│   │   └── backup-api.service.ts  # Service API
│   ├── app.ts                  # Composant racine
│   ├── app.config.ts           # Configuration de l'application
│   └── app.routes.ts           # Routes
├── styles.scss                  # Styles globaux
└── main.ts                     # Point d'entrée
```

## 🎯 Fonctionnalités

### Dashboard
- Vue d'ensemble des sauvegardes
- Statistiques par projet (Montfreeride, Oxygenefit)
- État des dernières sauvegardes
- Espace disque utilisé

### Logs
- Visualisation des logs de sauvegarde
- Alertes et erreurs
- Historique des opérations

### Sauvegardes
- Liste des backups MySQL par projet
- Liste des backups wp-content par projet
- Informations détaillées (taille, date, etc.)
- Téléchargement des backups
- Restauration des sauvegardes

## 🔧 Configuration

### Variables d'environnement

L'URL de l'API backend peut être configurée dans le service `BackupApiService` :

```typescript
private readonly apiUrl = 'http://localhost:3000/api';
```

## 📝 Bonnes Pratiques Angular 21

Cette application suit les bonnes pratiques Angular 21 :

- ✅ Composants standalone (pas de NgModules)
- ✅ Signals pour la gestion d'état
- ✅ ChangeDetectionStrategy.OnPush
- ✅ Utilisation de `input()` et `output()` au lieu des décorateurs
- ✅ Control flow natif (`@if`, `@for`, `@switch`)
- ✅ Injection de dépendances avec `inject()`
- ✅ Lazy loading des routes

## 📚 Documentation PrimeNG 21

Cette application utilise PrimeNG 21 avec référence à la documentation LLM :

- **Documentation LLM** : https://primeng.org/llms-full.txt
- **Documentation standard** : https://primeng.org
- **Référence locale** : Voir `PRIMENG_REFERENCE.md`

### Points importants PrimeNG 21

- Utilisation de `@primeuix/styles` pour les styles (variables CSS)
- Severity : utiliser `warn` au lieu de `warning`
- Tous les composants sont standalone
- Import sélectif des modules nécessaires uniquement

## 🔗 API Backend

L'application communique avec une API REST backend. Les endpoints attendus sont :

- `GET /api/logs` - Récupérer les logs
- `GET /api/alerts` - Récupérer les alertes
- `GET /api/backups/mysql/:project` - Liste backups MySQL
- `GET /api/backups/files/:project` - Liste backups wp-content
- `GET /api/stats` - Statistiques générales
- `POST /api/restore/mysql/:project` - Restaurer backup MySQL
- `POST /api/restore/files/:project` - Restaurer backup wp-content
- `GET /api/backups/download?path=...` - Télécharger un backup

## 📄 Licence

Projet privé
