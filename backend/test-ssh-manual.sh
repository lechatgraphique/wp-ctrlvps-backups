#!/bin/bash
# Script de test SSH manuel
# ⚠️  Ce script utilise des variables d'environnement pour la sécurité
# Assurez-vous que VPS_HOST et VPS_USER sont définis dans votre .env

echo "🔍 Test de connexion SSH manuelle..."
echo ""
echo "1. Test avec IPv4 explicite:"
ssh -4 -i "${VPS_PRIVATE_KEY_PATH:-~/.ssh/id_ed25519_vps}" \
    -o ConnectTimeout=10 \
    -o StrictHostKeyChecking=no \
    "${VPS_USER:-deploy}@${VPS_HOST:-votre-vps.example.com}" \
    "echo '✅ Connexion réussie'" 2>&1

echo ""
echo "2. Test avec verbose pour diagnostic:"
ssh -v -i "${VPS_PRIVATE_KEY_PATH:-~/.ssh/id_ed25519_vps}" \
    -o ConnectTimeout=10 \
    "${VPS_USER:-deploy}@${VPS_HOST:-votre-vps.example.com}" \
    "echo 'test'" 2>&1 | grep -E "(Authenticating|Offering|Connection|Permission)" | head -10
