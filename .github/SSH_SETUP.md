# 🔐 Configuration SSH pour GitHub Actions

## Problème : "ssh: unable to authenticate"

Cette erreur signifie que GitHub Actions ne peut pas s'authentifier sur le VPS.

## ✅ Solution étape par étape

### 1. Générer une clé SSH dédiée pour GitHub Actions

Sur le VPS, exécutez :

```bash
# Générer une nouvelle clé SSH
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/id_ed25519_github_actions -N ""

# Afficher la clé PUBLIQUE (à ajouter sur le VPS)
cat ~/.ssh/id_ed25519_github_actions.pub
```

### 2. Ajouter la clé publique sur le VPS

```bash
# Ajouter la clé publique à authorized_keys
cat ~/.ssh/id_ed25519_github_actions.pub >> ~/.ssh/authorized_keys

# Vérifier les permissions (CRUCIAL)
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Vérifier que la clé est bien ajoutée
tail -1 ~/.ssh/authorized_keys
```

### 3. Obtenir la clé PRIVÉE pour GitHub Secrets

```bash
# Sur le VPS, afficher la clé PRIVÉE complète
cat ~/.ssh/id_ed25519_github_actions
```

**Important** : Copiez TOUT le contenu, y compris :
- `-----BEGIN OPENSSH PRIVATE KEY-----`
- Toutes les lignes au milieu
- `-----END OPENSSH PRIVATE KEY-----`

### 4. Configurer les secrets GitHub

Allez sur : https://github.com/lechatgraphique/wp-ctrlvps-backups/settings/secrets/actions

Mettez à jour le secret `VPS_SSH_KEY` avec la clé privée complète obtenue à l'étape 3.

### 5. Vérifier la configuration SSH sur le VPS

```bash
# Vérifier que l'authentification par clé est activée
sudo grep -E "^PubkeyAuthentication|^AuthorizedKeysFile|^PasswordAuthentication" /etc/ssh/sshd_config

# Devrait afficher :
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys
# PasswordAuthentication yes (ou no, selon votre config)

# Si modifié, redémarrer SSH
sudo systemctl restart sshd
```

### 6. Tester la connexion manuellement

Depuis votre Mac ou un autre serveur :

```bash
# Copier la clé privée temporairement
scp deploy@vps-15e30067.vps.ovh.net:~/.ssh/id_ed25519_github_actions.pub /tmp/test_key.pub

# Tester la connexion
ssh -i ~/.ssh/id_ed25519_github_actions deploy@vps-15e30067.vps.ovh.net "echo 'Connection test successful'"
```

## 🔍 Vérifications de diagnostic

### Sur le VPS

```bash
# Vérifier les clés autorisées
cat ~/.ssh/authorized_keys | wc -l  # Devrait afficher au moins 1

# Vérifier les permissions
ls -la ~/.ssh/
# authorized_keys devrait être -rw------- (600)
# .ssh/ devrait être drwx------ (700)

# Vérifier les logs SSH en temps réel
sudo tail -f /var/log/auth.log | grep ssh
```

### Format de la clé SSH

La clé privée dans GitHub Secrets doit :
- ✅ Commencer par `-----BEGIN OPENSSH PRIVATE KEY-----`
- ✅ Finir par `-----END OPENSSH PRIVATE KEY-----`
- ✅ Contenir toutes les lignes (généralement 5-10 lignes)
- ❌ Ne PAS être la clé publique (commence par `ssh-ed25519`)

## ⚠️ Erreurs courantes

1. **Clé publique au lieu de clé privée** : Vérifiez que vous copiez la clé qui commence par `-----BEGIN`
2. **Clé tronquée** : Assurez-vous de copier toutes les lignes
3. **Permissions incorrectes** : `authorized_keys` doit être en `600`, `.ssh/` en `700`
4. **Clé non ajoutée** : Vérifiez que la clé publique est bien dans `authorized_keys`

## 📝 Checklist finale

- [ ] Clé SSH générée sur le VPS
- [ ] Clé publique ajoutée à `~/.ssh/authorized_keys`
- [ ] Permissions correctes (`600` pour authorized_keys, `700` pour .ssh)
- [ ] Clé privée complète copiée dans GitHub Secrets `VPS_SSH_KEY`
- [ ] Test de connexion manuelle réussi
- [ ] Configuration SSH vérifiée (`PubkeyAuthentication yes`)

