#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 10: Dashboard Web (NextJS)
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instala y configura un dashboard web basado en NextJS
# Dependencias: Sentinel (09-sentinel-agente.sh)
# ============================================================================

# Habilitar modo estricto - salir inmediatamente si cualquier comando falla
set -e

# Variables de color para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Variables globales
PASCUAL_DIR="$HOME/.pascual"
PASCUAL_CONFIG="$PASCUAL_DIR/config"
PASCUAL_LOG="$PASCUAL_DIR/shared/logs/installer.log"
DASHBOARD_DIR="$PASCUAL_DIR/dashboard"

# Verificar permisos de sudo sin solicitar contraseña
check_sudo() {
    if sudo -n true 2>/dev/null; then
        return 0
    else
        log_error "Se requieren privilegios de sudo para instalar dependencias"
        log_info "Por favor ejecuta: sudo echo 'Permisos de sudo confirmados'"
        log_info "Y luego ejecuta nuevamente este script"
        exit 1
    fi
}

# Verificar que la fase anterior se haya ejecutado
check_previous_phase() {
    if [ ! -f "$PASCUAL_CONFIG/.env" ]; then
        log_error "No se encontró el archivo de configuración de Pascual-Bot"
        log_info "Debes ejecutar primero: ./09-sentinel-agente.sh"
        exit 1
    fi

    # Verificar que la fase 9 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_9_COMPLETED" != "true" ]; then
        log_error "La fase 9 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./09-sentinel-agente.sh"
        exit 1
    fi
}

# Cargar variables de entorno
load_env() {
    if [ -f "$PASCUAL_CONFIG/.env" ]; then
        source "$PASCUAL_CONFIG/.env"
        log_info "Variables de entorno cargadas de $PASCUAL_CONFIG/.env"
    else
        log_error "Archivo .env no encontrado en $PASCUAL_CONFIG"
        exit 1
    fi
}

# Función para imprimir mensajes con formato
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
    echo "[INFO] $(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$PASCUAL_LOG" 2>/dev/null || true
}

log_warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
    echo "[WARN] $(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$PASCUAL_LOG" 2>/dev/null || true
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$PASCUAL_LOG" 2>/dev/null || true
}

log_step() {
    echo -e "${BLUE}[PASO]${NC} $1"
    echo "[STEP] $(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$PASCUAL_LOG" 2>/dev/null || true
}

# Función de limpieza en caso de error
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "¡Instalación interrumpida! Error en la línea $BASH_LINENO"
        log_info "Para solucionar problemas, revise el log: $PASCUAL_LOG"
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-10.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# Verificar Node.js
verify_nodejs() {
    log_step "Verificando instalación de Node.js..."

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_info "Node.js encontrado: $NODE_VERSION"

        # Verificar versión mínima (debe ser v16 o superior)
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1 | cut -c 2-)
        if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
            log_warning "Versión de Node.js demasiado antigua: $NODE_VERSION"
            log_info "Se requiere Node.js 16 o superior para NextJS moderno"
            install_nodejs
        else
            return 0
        fi
    else
        log_info "Node.js no encontrado, instalando..."
        install_nodejs
    fi
}

# Instalar Node.js
install_nodejs() {
    log_step "Instalando Node.js..."

    # Instalar Node.js 18 LTS
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs

    # Verificar instalación
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_info "Node.js instalado correctamente: $NODE_VERSION"
        return 0
    else
        log_error "Error al instalar Node.js"
        exit 1
    fi
}

# Crear aplicación NextJS
create_nextjs_app() {
    log_step "Creando aplicación NextJS..."

    # Verificar si el directorio ya existe
    if [ -d "$DASHBOARD_DIR" ]; then
        log_warning "El directorio del dashboard ya existe"
        read -p "¿Deseas sobrescribirlo? (s/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            log_info "Instalación cancelada por el usuario"
            exit 0
        else
            log_info "Respaldando directorio existente..."
            mv "$DASHBOARD_DIR" "${DASHBOARD_DIR}_backup_$(date +%Y%m%d%H%M%S)"
        fi
    fi

    # Crear directorio para la aplicación
    mkdir -p "$DASHBOARD_DIR"

    # Cambiar al directorio del dashboard
    cd "$DASHBOARD_DIR"

    # Crear una aplicación NextJS con TypeScript, Tailwind, App Router
    log_info "Creando aplicación NextJS con create-next-app..."
    npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm

    # Instalar dependencias adicionales
    log_info "Instalando dependencias adicionales..."
    npm install \
        recharts \
        socket.io-client \
        jsonwebtoken \
        bcrypt \
        jose \
        cookie \
        next-auth \
        @heroicons/react \
        react-hot-toast \
        zod \
        clsx \
        tailwind-merge \
        swr

    log_info "Aplicación NextJS creada correctamente ✓"
    return 0
}

# Configurar estructura del dashboard
configure_dashboard_structure() {
    log_step "Configurando estructura del dashboard..."

    # Crear estructura de directorios
    cd "$DASHBOARD_DIR"
    mkdir -p app/{login,tasks,agents,security,settings,api/auth,api/users,api/sentinel,api/realtime}
    mkdir -p components/{ui,layout,forms,charts,modals,security}
    mkdir -p lib/{auth,db,api,utils}
    mkdir -p public/icons

    # Crear archivo de configuración .env.local
    cat > "$DASHBOARD_DIR/.env.local" << EOF
# Configuración del dashboard
NEXT_PUBLIC_APP_NAME=Pascual Bot
NEXT_PUBLIC_APP_VERSION=${PASCUAL_VERSION:-1.0.0}
NEXT_PUBLIC_API_BASE_URL=http://localhost:${DASHBOARD_PORT:-38472}/api

# Configuración de autenticación
AUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:${DASHBOARD_PORT:-38472}
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Configuración de rutas
PASCUAL_DIR=${PASCUAL_DIR}
EOF

    # Crear archivo de configuración lib/config.ts
    cat > "$DASHBOARD_DIR/lib/config.ts" << 'EOF'
/**
 * Configuración global del dashboard de Pascual-Bot
 */

interface Config {
  appName: string;
  appVersion: string;
  apiBase: string;
  pascualDir: string;
  defaultTheme: 'light' | 'dark' | 'system';
  refreshInterval: number;
}

export const config: Config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Pascual Bot',
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  apiBase: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:38472/api',
  pascualDir: process.env.PASCUAL_DIR || '~/.pascual',
  defaultTheme: 'system',
  refreshInterval: 5000, // 5 segundos
};

export const routes = {
  home: '/',
  login: '/login',
  tasks: '/tasks',
  agents: '/agents',
  security: '/security',
  settings: '/settings',
};
EOF

    log_info "Estructura básica configurada ✓"
    return 0
}

# Crear componentes básicos
create_basic_components() {
    log_step "Creando componentes básicos..."

    # Crear layout principal
    cat > "$DASHBOARD_DIR/app/layout.tsx" << 'EOF'
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { config } from "@/lib/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: config.appName,
  description: "Panel de control para Pascual-Bot, tu asistente de IA personal multi-usuario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
EOF

    # Crear página principal
    cat > "$DASHBOARD_DIR/app/page.tsx" << 'EOF'
import Link from "next/link";
import { config, routes } from "@/lib/config";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Bienvenido a {config.appName} <span className="text-blue-400">v{config.appVersion}</span>
        </h1>

        <div className="mb-12 text-center text-gray-300">
          <p className="text-xl">Tu asistente de IA personal, 100% local y privado.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href={routes.login} className="group">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-blue-500 hover:shadow-blue-500/20 transition">
              <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400">Iniciar sesión</h2>
              <p className="text-gray-400">Accede a tu perfil personal de Pascual-Bot.</p>
            </div>
          </Link>

          <Link href="#features" className="group">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-blue-500 hover:shadow-blue-500/20 transition">
              <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-400">Características</h2>
              <p className="text-gray-400">Conoce las capacidades de tu asistente personal.</p>
            </div>
          </Link>
        </div>

        <div id="features" className="py-8 px-6 rounded-xl bg-gray-800 border border-gray-700">
          <h2 className="text-3xl font-bold mb-6 text-center">Características principales</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Privacidad total</h3>
              <p className="text-gray-300">Todo funciona 100% local en tu hardware, sin enviar datos a servidores externos.</p>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Multi-usuario</h3>
              <p className="text-gray-300">Perfiles independientes para cada persona, con completo aislamiento de datos.</p>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Agentes especializados</h3>
              <p className="text-gray-300">Agentes personalizados para tareas específicas: calendario, finanzas, y más.</p>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Memoria persistente</h3>
              <p className="text-gray-300">Recuerda conversaciones y preferencias para interacciones más naturales.</p>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Múltiples interfaces</h3>
              <p className="text-gray-300">Acceso por voz, chat (Telegram) y este dashboard web.</p>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-bold mb-2 text-blue-400">Monitoreo seguro</h3>
              <p className="text-gray-300">Sentinel vigila el sistema y protege tu información.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Pascual-Bot v{config.appVersion} • Sistema de IA local y privado</p>
        </div>
      </div>
    </main>
  );
}
EOF

    # Crear página de login
    cat > "$DASHBOARD_DIR/app/login/page.tsx" << 'EOF'
"use client";

import { useState } from "react";
import Link from "next/link";
import { config } from "@/lib/config";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulación de login (en desarrollo)
    setTimeout(() => {
      setIsLoading(false);
      setError("Sistema en desarrollo. El login no está disponible todavía.");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">{config.appName}</h2>
          <p className="text-gray-400 mt-2">Accede a tu asistente personal</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 text-red-100 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
EOF

    log_info "Componentes básicos creados ✓"
    return 0
}

# Crear archivo API básico
create_api_routes() {
    log_step "Creando rutas API básicas..."

    # Crear ruta de API para health check
    mkdir -p "$DASHBOARD_DIR/app/api/health"
    cat > "$DASHBOARD_DIR/app/api/health/route.ts" << 'EOF'
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"
  });
}
EOF

    # Crear ruta para obtener estado del sistema
    mkdir -p "$DASHBOARD_DIR/app/api/system"
    cat > "$DASHBOARD_DIR/app/api/system/status/route.ts" << 'EOF'
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const pascualDir = process.env.PASCUAL_DIR || "~/.pascual";
    const statusPath = path.join(pascualDir, "sentinel", "status.json");

    // Verificar si el archivo existe
    if (!fs.existsSync(statusPath)) {
      return NextResponse.json(
        { error: "Status file not found" },
        { status: 404 }
      );
    }

    // Leer archivo de estado
    const statusData = fs.readFileSync(statusPath, "utf-8");
    const status = JSON.parse(statusData);

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error reading system status:", error);
    return NextResponse.json(
      { error: "Error reading system status" },
      { status: 500 }
    );
  }
}
EOF

    log_info "Rutas API básicas creadas ✓"
    return 0
}

# Configurar servicio para el dashboard
configure_dashboard_service() {
    log_step "Configurando servicio para el Dashboard..."

    # Crear script de servicio
    cat > "$DASHBOARD_DIR/start-dashboard.sh" << EOF
#!/bin/bash
# Script para iniciar el dashboard de Pascual-Bot

cd "$DASHBOARD_DIR"
npm run build
npm start -- --port ${DASHBOARD_PORT:-38472}
EOF

    # Hacer ejecutable
    chmod +x "$DASHBOARD_DIR/start-dashboard.sh"

    # Crear servicio systemd
    sudo tee /etc/systemd/system/pascual-dashboard.service > /dev/null << EOF
[Unit]
Description=Pascual-Bot Dashboard Web
After=network.target pascual-sentinel.service
Wants=pascual-sentinel.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$DASHBOARD_DIR
ExecStart=/bin/bash $DASHBOARD_DIR/start-dashboard.sh
Restart=always
RestartSec=10
Environment="NEXT_PUBLIC_APP_NAME=Pascual Bot"
Environment="NEXT_PUBLIC_APP_VERSION=${PASCUAL_VERSION:-1.0.0}"
Environment="NEXT_PUBLIC_API_BASE_URL=http://localhost:${DASHBOARD_PORT:-38472}/api"
Environment="PASCUAL_DIR=$PASCUAL_DIR"

[Install]
WantedBy=multi-user.target
EOF

    # Recargar systemd
    sudo systemctl daemon-reload

    # NO habilitar ni iniciar el servicio automáticamente todavía (está en desarrollo)
    log_info "Servicio dashboard creado. No se inicia automáticamente todavía."
    log_info "Para iniciar manualmente: sudo systemctl start pascual-dashboard.service"

    return 0
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "                PASCUAL-BOT: INSTALACIÓN DEL DASHBOARD WEB                  "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env
check_sudo

# Verificar e instalar Node.js si es necesario
verify_nodejs

# Crear aplicación NextJS
create_nextjs_app

# Configurar estructura del dashboard
configure_dashboard_structure

# Crear componentes básicos
create_basic_components

# Crear rutas API básicas
create_api_routes

# Configurar servicio para el dashboard
configure_dashboard_service

# Registrar fase completada
echo "FASE_10_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Dashboard web NextJS instalado correctamente"
log_info "Para iniciar el dashboard en modo desarrollo, ejecuta:"
echo -e "${GREEN}   cd $DASHBOARD_DIR && npm run dev${NC}"
echo ""
log_info "El dashboard estará disponible en:"
echo -e "${GREEN}   http://localhost:${DASHBOARD_PORT:-3000}${NC}"
echo ""
log_info "➡️  Siguiente paso: ejecutar ./11-workflows-orchestrator.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0