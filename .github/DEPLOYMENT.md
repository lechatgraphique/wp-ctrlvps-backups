# 🚀 Guide de Déploiement Automatique

Ce projet utilise GitHub Actions pour déployer automatiquement sur le VPS à chaque push sur la branche `main`.

## 📋 Configuration des Secrets GitHub

Pour que le déploiement automatique fonctionne, vous devez configurer les secrets suivants dans votre repository GitHub :

### Étapes pour ajouter les secrets

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez les secrets suivants :

### Secrets à configurer

| Secret | Description | Exemple |
|--------|-------------|---------|
| `VPS_HOST` | Hostname ou IP du VPS | `vps-15e30067.vps.ovh.net` |
| `VPS_USER` | Utilisateur SSH | `deploy` |
| `VPS_PORT` | Port SSH | `22` |
| `VPS_SSH_KEY` | Clé privée SSH | Contenu de `~/.ssh/id_ed25519_github` |

### Obtenir la clé SSH privée

Sur le VPS, exécutez :

```bash
cat ~/.ssh/id_ed25519_github
```

Copiez **tout le contenu** (y compris `-----BEGIN OPENSSH PRIVATE KEY-----` et `-----END OPENSSH PRIVATE KEY-----`) et collez-le dans le secret `VPS_SSH_KEY`.

⚠️ **Important** : Ne partagez jamais votre clé privée publiquement !

## 🔄 Processus de Déploiement

Le workflow GitHub Actions :

1. ✅ Checkout le code
2. ✅ Setup Node.js 20
3. ✅ Build le frontend (Angular)
4. ✅ Se connecte au VPS via SSH
5. ✅ Pull les dernières modifications
6. ✅ Build le frontend sur le VPS
7. ✅ Build le backend sur le VPS
8. ✅ Redémarre les services Docker
9. ✅ Affiche les logs pour vérification

## 📝 Déploiement Manuel

Si vous devez déployer manuellement :

```bash
# Sur le VPS
cd /home/deploy/docker-services/apps/wp-ctrl-backups
git pull origin main

# Build frontend
cd frontend
npm ci
npm run build
cd ..

# Build backend
cd backend
npm ci
npm run build
cd ..

# Redémarrer les services
cd /home/deploy/docker-services
docker compose -f docker-compose.backups.yml restart
```

## 🐛 Dépannage

### Le déploiement échoue

1. Vérifiez que les secrets sont correctement configurés
2. Vérifiez les logs GitHub Actions : **Actions** → Sélectionnez le workflow → Voir les logs
3. Vérifiez que la clé SSH est bien ajoutée sur GitHub
4. Testez la connexion SSH manuellement depuis le VPS vers GitHub

### Les services ne redémarrent pas

```bash
# Vérifier les conteneurs
docker ps | grep wp-ctrl-backups

# Voir les logs
docker logs wp-ctrl-backups-backend
docker logs wp-ctrl-backups-frontend

# Redémarrer manuellement
docker compose -f docker-compose.backups.yml restart
```

## 🔐 Sécurité

- Les secrets sont stockés de manière sécurisée dans GitHub
- La clé SSH est utilisée uniquement pour le déploiement
- Les builds sont effectués sur le VPS pour éviter d'exposer des secrets

