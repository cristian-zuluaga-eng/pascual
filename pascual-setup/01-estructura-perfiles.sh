#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 1: Estructura de Perfiles Multi-Usuario
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Crear directorios con aislamiento físico por usuario
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

# Función para pedir nombres de usuario
ask_users() {
    echo -e "${BOLD}Configuración de usuarios${NC}"
    echo "Ingresa el nombre de los usuarios separados por espacio (ej: 'papa mama hijo'):"
    read -p "> " user_input

    # Validar entrada
    if [ -z "$user_input" ]; then
        log_warning "No se ingresaron nombres de usuario. Usando valores por defecto: 'admin'"
        USUARIOS=("admin")
    else
        # Convertir string con espacios a array
        read -ra USUARIOS <<< "$user_input"
        log_info "Usuarios configurados: ${USUARIOS[*]}"
    fi
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "              PASCUAL-BOT: ESTRUCTURA DE PERFILES MULTI-USUARIO             "
echo "                            (Versión $VERSION)                              "
echo "============================================================================"
echo ""

# Crear directorio de logs primero
mkdir -p "$HOME/.pascual/shared/logs"
PASCUAL_LOG="$HOME/.pascual/shared/logs/installer.log"
touch "$PASCUAL_LOG"
chmod 755 "$HOME/.pascual/shared/logs"

log_info "Iniciando creación de estructura de perfiles..."
log_info "Log de instalación: $PASCUAL_LOG"

# Pedir nombres de usuario
ask_users

# Crear estructura básica
log_step "Creando estructura básica..."
mkdir -p "$PASCUAL_DIR"/{users,shared,config,master,docs,sentinel,workflows}

# Crear estructura para cada usuario
log_step "Creando perfiles de usuario..."
for usuario in "${USUARIOS[@]}"; do
    log_info "Creando perfil para: $usuario"
    mkdir -p "$PASCUAL_DIR/users/$usuario"/{config,agents,tasks,data,logs,sandbox,vector_index,base_agent}

    # Config inicial por usuario
    cat > "$PASCUAL_DIR/users/$usuario/config.json" << EOF
{
  "usuario_id": "$usuario",
  "nombre": "$usuario",
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
    touch "$PASCUAL_DIR/users/$usuario/data/history.db"

    # Permisos de aislamiento
    chmod 750 "$PASCUAL_DIR/users/$usuario"
    log_info "Permisos restrictivos (750) aplicados a: $PASCUAL_DIR/users/$usuario"
done

# Recursos compartidos
log_step "Creando recursos compartidos..."
mkdir -p "$PASCUAL_DIR/shared"/{models,cache,logs,temp}
chmod 755 "$PASCUAL_DIR/shared"
log_info "Permisos (755) aplicados a recursos compartidos"

# Configuración global
log_step "Creando configuración global..."
mkdir -p "$PASCUAL_DIR/config"

# Archivo de enrutamiento
cat > "$PASCUAL_DIR/config/routing.json" << EOF
{
  "version": "$VERSION",
  "usuarios_registrados": [
EOF

# Agregar usuarios al archivo routing.json
for i in "${!USUARIOS[@]}"; do
    if [ $i -eq $(( ${#USUARIOS[@]} - 1 )) ]; then
        # Último elemento sin coma
        echo "    \"${USUARIOS[$i]}\"" >> "$PASCUAL_DIR/config/routing.json"
    else
        # Con coma al final
        echo "    \"${USUARIOS[$i]}\"," >> "$PASCUAL_DIR/config/routing.json"
    fi
done

# Continuar con el resto del archivo routing.json
cat >> "$PASCUAL_DIR/config/routing.json" << EOF
  ],
  "mapeo_canales": {
    "telegram": {
EOF

# Agregar mapeo de telegram para cada usuario (placeholders)
for i in "${!USUARIOS[@]}"; do
    if [ $i -eq $(( ${#USUARIOS[@]} - 1 )) ]; then
        # Último elemento sin coma
        echo "      \"TELEGRAM_CHAT_ID_${USUARIOS[$i]}\": \"${USUARIOS[$i]}\"" >> "$PASCUAL_DIR/config/routing.json"
    else
        # Con coma al final
        echo "      \"TELEGRAM_CHAT_ID_${USUARIOS[$i]}\": \"${USUARIOS[$i]}\"," >> "$PASCUAL_DIR/config/routing.json"
    fi
done

# Continuar con el resto de la configuración
cat >> "$PASCUAL_DIR/config/routing.json" << EOF
    },
    "voice_local": {
      "default": "${USUARIOS[0]}",
      "wake_words": {
EOF

# Agregar wake words para cada usuario
for i in "${!USUARIOS[@]}"; do
    WAKE_WORD="oye pascual"
    if [ $i -gt 0 ]; then
        WAKE_WORD="hey asistente"
    fi

    if [ $i -eq $(( ${#USUARIOS[@]} - 1 )) ]; then
        # Último elemento sin coma
        echo "        \"$WAKE_WORD\": \"${USUARIOS[$i]}\"" >> "$PASCUAL_DIR/config/routing.json"
    else
        # Con coma al final
        echo "        \"$WAKE_WORD\": \"${USUARIOS[$i]}\"," >> "$PASCUAL_DIR/config/routing.json"
    fi
done

# Finalizar archivo routing.json
cat >> "$PASCUAL_DIR/config/routing.json" << EOF
      }
    }
  },
  "politicas": {
    "usuario_no_registrado": "rechazar",
    "conflicto_recursos": "priorizar_ultimo_comando"
  }
}
EOF

# Política de Sentinel
cat > "$PASCUAL_DIR/config/sentinel_policy.json" << EOF
{
  "monitoring": {
    "resources": ["cpu", "ram", "disk", "gpu_temp"],
    "thresholds": {
      "disk_warn": 80,
      "disk_critical": 90,
      "ram_warn": 85,
      "ram_critical": 95,
      "cpu_warn": 90,
      "cpu_critical": 98,
      "gpu_temp_warn": 80,
      "gpu_temp_critical": 90
    },
    "check_interval_sec": 60
  },
  "security": {
    "audit_user_configs": true,
    "detect_orphaned_files": true,
    "file_integrity_check": true,
    "audit_login_attempts": true
  },
  "jurisdiction": {
    "user_data_is_private": true,
    "system_alerts_go_to_all": true,
    "admin_users": ["${USUARIOS[0]}"]
  },
  "cleanup": {
    "temp_files_max_age_days": 7,
    "logs_max_age_days": 30,
    "cache_max_size_gb": 10
  }
}
EOF

# Archivo de configuración de entorno
cat > "$PASCUAL_DIR/config/.env" << EOF
# Configuración de Pascual-Bot
PASCUAL_VERSION=$VERSION
PASCUAL_DIR=$PASCUAL_DIR
DEFAULT_USER=${USUARIOS[0]}

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
  "users": ${#USUARIOS[@]},
  "architecture": "$(uname -m)",
  "kernel": "$(uname -r)",
  "system": "$(lsb_release -ds 2>/dev/null || cat /etc/*release 2>/dev/null | head -n1 || uname -om)"
}
EOF

log_info "✅ Estructura de directorios creada correctamente en $PASCUAL_DIR"
log_warning "⚠️  Importante: Debe editar los siguientes archivos antes de continuar:"
echo "   - $PASCUAL_DIR/config/routing.json (configurar TELEGRAM_CHAT_ID_*)"
echo "   - $PASCUAL_DIR/config/.env (configurar PICOVOICE_ACCESS_KEY y TELEGRAM_BOT_TOKEN)"
echo ""
log_info "➡️  Siguiente paso: ejecutar ./02-dependencias-base.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0