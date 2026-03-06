#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local
# ============================================================================
# FASE 1: Estructura de Perfiles
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Crear directorios para el sistema Pascual
# Dependencias: Ninguna
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
PASCUAL_LOG="$PASCUAL_DIR/installer.log"
VERSION="1.0.0"

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
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-1.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "              PASCUAL-BOT: ESTRUCTURA DE PERFILES              "
echo "                            (Versión $VERSION)                              "
echo "============================================================================"
echo ""

# Crear directorio de logs primero
mkdir -p "$HOME/.pascual/shared/logs"
PASCUAL_LOG="$HOME/.pascual/shared/logs/installer.log"
touch "$PASCUAL_LOG"
chmod 755 "$HOME/.pascual/shared/logs"

log_info "Iniciando creación de estructura de directorios..."
log_info "Log de instalación: $PASCUAL_LOG"

# Crear estructura básica
log_step "Creando estructura básica..."
mkdir -p "$PASCUAL_DIR"/{core,shared,config,master,docs,workflows}

# Crear estructura para configuración y datos
log_info "Creando estructura para datos y configuración..."
mkdir -p "$PASCUAL_DIR/core"/{config,agents,tasks,data,logs,sandbox,vector_index,base_agent}

# Config inicial
cat > "$PASCUAL_DIR/core/config.json" << EOF
{
  "nombre": "pascual",
  "canal_principal": "voice",
  "voz_tts": "es_ES-davefx-medium",
  "modelo_ia": "llama3.2:3b",
  "modelo_fallback": "qwen2.5:7b",
  "telegram_chat_id": "",
  "agents_registrados": [],
  "apis": {},
  "preferencias": {
    "notificaciones": ["telegram"],
    "limpieza_automatica": true,
    "zona_horaria": "America/Bogota",
    "idioma": "es"
  }
}
EOF

# Base de datos de historial vacía
touch "$PASCUAL_DIR/core/data/history.db"

# Recursos compartidos
log_step "Creando recursos compartidos..."
mkdir -p "$PASCUAL_DIR/shared"/{models,cache,logs,temp}
chmod 755 "$PASCUAL_DIR/shared"
log_info "Permisos (755) aplicados a recursos compartidos"

# Configuración global
log_step "Creando configuración global..."
mkdir -p "$PASCUAL_DIR/config"

# Archivo de configuración para canales
cat > "$PASCUAL_DIR/config/canales.json" << EOF
{
  "canales_activos": {
    "telegram": {
      "activo": false,
      "config": "pendiente"
    },
    "voice_local": {
      "activo": true,
      "dispositivo": "default",
      "wake_word": "oye pascual"
    },
    "web_dashboard": {
      "activo": false,
      "puerto": 38472
    }
  },
  "prioridad_canales": [
    "voice_local",
    "telegram",
    "web_dashboard"
  ]
}
EOF

# Archivo de configuración de entorno
cat > "$PASCUAL_DIR/config/.env" << EOF
# Configuración de Pascual-Bot
PASCUAL_VERSION=$VERSION
PASCUAL_DIR=$PASCUAL_DIR

# Variables para AMD GPU (ROCm)
HSA_OVERRIDE_GFX_VERSION=11.0.0

# Configuración de puertos
DASHBOARD_PORT=38472
API_PORT=38473

# API Keys (rellenar después de la instalación)
PICOVOICE_ACCESS_KEY=""
TELEGRAM_BOT_TOKEN=""

# Variables de rutas
OLLAMA_MODELS_DIR="$PASCUAL_DIR/shared/models"
LOG_DIR="$PASCUAL_DIR/shared/logs"
EOF

# Permisos para archivos de configuración
chmod 644 "$PASCUAL_DIR/config"/*.json
chmod 600 "$PASCUAL_DIR/config/.env" # Más restrictivo para secrets

# Copiar documentación
log_step "Copiando documentación..."
if [ -f "./README-COMANDOS-VOZ.md" ]; then
    cp "./README-COMANDOS-VOZ.md" "$PASCUAL_DIR/docs/"
    log_info "Documentación de comandos de voz copiada"
else
    log_warning "Archivo README-COMANDOS-VOZ.md no encontrado, se omitirá la copia"
fi

# Crear archivo de registro
touch "$PASCUAL_DIR/register.json"
cat > "$PASCUAL_DIR/register.json" << EOF
{
  "installation_date": "$(date +"%Y-%m-%d %H:%M:%S")",
  "version": "$VERSION",
  "architecture": "$(uname -m)",
  "kernel": "$(uname -r)",
  "system": "$(lsb_release -ds 2>/dev/null || cat /etc/*release 2>/dev/null | head -n1 || uname -om)"
}
EOF

log_info "✅ Estructura de directorios creada correctamente en $PASCUAL_DIR"
log_warning "⚠️  Importante: Debe editar el siguiente archivo antes de continuar:"
echo "   - $PASCUAL_DIR/config/.env (configurar PICOVOICE_ACCESS_KEY y TELEGRAM_BOT_TOKEN)"
echo ""
log_info "➡️  Siguiente paso: ejecutar ./02-dependencias-base.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0