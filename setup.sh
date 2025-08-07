#!/bin/bash

echo "🚀 Configuration du Cyber Alerts Dashboard"
echo "=========================================="

# Vérifier si .env.local existe
if [ ! -f .env.local ]; then
    echo "📝 Création du fichier .env.local..."
    cat > .env.local << EOF
# Configuration Supabase
# Remplacez ces valeurs par vos propres clés Supabase

NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Instructions :
# 1. Allez sur https://supabase.com
# 2. Créez un nouveau projet ou utilisez un projet existant
# 3. Dans Settings > API, copiez :
#    - Project URL → NEXT_PUBLIC_SUPABASE_URL
#    - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
# 4. Remplacez les valeurs ci-dessus par vos vraies clés
EOF
    echo "✅ Fichier .env.local créé"
else
    echo "✅ Fichier .env.local existe déjà"
fi

echo ""
echo "📋 Étapes suivantes :"
echo "1. Modifiez le fichier .env.local avec vos clés Supabase"
echo "2. Créez les tables dans Supabase avec les scripts database/"
echo "3. Lancez le serveur avec : npm run dev"
echo ""
echo "🔗 Accès au dashboard : http://localhost:3000" 