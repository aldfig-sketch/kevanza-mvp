#!/bin/bash

# KEVANZA MVP - Setup Environment Variables in Vercel
# Este script configura automáticamente las variables de entorno en Vercel

echo "🔧 KEVANZA - Configurando variables de entorno en Vercel..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json no encontrado"
  echo "Ejecuta este script desde la raíz del proyecto"
  exit 1
fi

# Verificar .env.local
if [ ! -f ".env.local" ]; then
  echo "❌ Error: .env.local no encontrado"
  exit 1
fi

# Leer variables del .env.local
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f 2)
SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d '=' -f 2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "❌ Error: Variables no encontradas en .env.local"
  exit 1
fi

echo "✅ Variables encontradas en .env.local"
echo "   URL: $SUPABASE_URL"
echo "   KEY: ${SUPABASE_KEY:0:20}..."
echo ""

# Instalar Vercel CLI si no está instalado
if ! command -v vercel &> /dev/null; then
  echo "📦 Instalando Vercel CLI..."
  npm install -g vercel
fi

echo ""
echo "🔑 Configurando variables en Vercel..."
echo "   (Se abrirá el navegador para autenticación si es necesario)"
echo ""

# Establecer variables con vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL" --yes
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "$SUPABASE_KEY" --yes

echo ""
echo "✅ Variables configuradas en Vercel"
echo ""
echo "📍 Próximo paso: Vercel hará redeploy automático"
echo "   Espera 2-3 minutos a que se complete el deploy"
echo ""
echo "🧪 Luego prueba: https://kevanza-mvp.vercel.app/auth/login"
