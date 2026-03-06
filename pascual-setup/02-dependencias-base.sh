#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 2: Dependencias Base del Sistema
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instalación de paquetes y dependencias base necesarias para todos los módulos
# Dependencias: Estructura de perfiles (01-estructura-perfiles.sh)
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
    if [ ! -d "$PASCUAL_DIR" ] || [ ! -f "$PASCUAL_CONFIG/routing.json" ]; then
        log_error "No se encontró la estructura de directorios de Pascual-Bot"
        log_info "Debes ejecutar primero: ./01-estructura-perfiles.sh"
        exit 1
    fi
}

# Cargar variables de entorno
load_env() {
    if [ -f "$PASCUAL_CONFIG/.env" ]; then
        source "$PASCUAL_CONFIG/.env"
        log_info "Variables de entorno cargadas de $PASCUAL_CONFIG/.env"
    else
        log_warning "Archivo .env no encontrado, usando valores predeterminados"
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
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-2.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# Verificar que estamos en Ubuntu 24.04
check_ubuntu_version() {
    log_step "Verificando versión de Ubuntu..."

    if [ -f /etc/lsb-release ]; then
        source /etc/lsb-release

        if [ "$DISTRIB_ID" != "Ubuntu" ]; then
            log_error "Este script está diseñado para Ubuntu. Sistema detectado: $DISTRIB_ID"
            exit 1
        fi

        # Verificar versión específica o mostrar advertencia
        if [ "$DISTRIB_RELEASE" != "24.04" ]; then
            log_warning "Este script fue diseñado para Ubuntu 24.04 LTS"
            log_warning "Versión detectada: $DISTRIB_RELEASE - Pueden ocurrir errores"
            read -p "¿Desea continuar de todos modos? (s/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Ss]$ ]]; then
                log_info "Instalación cancelada por el usuario"
                exit 0
            fi
        else
            log_info "Ubuntu 24.04 LTS detectado correctamente ✓"
        fi
    else
        log_warning "No se pudo determinar la versión de Ubuntu"
        read -p "¿Desea continuar de todos modos? (s/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            log_info "Instalación cancelada por el usuario"
            exit 0
        fi
    fi
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "              PASCUAL-BOT: INSTALACIÓN DE DEPENDENCIAS BASE                 "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env
check_sudo
check_ubuntu_version

log_info "Iniciando instalación de dependencias base..."

# Actualizar sistema
log_step "Actualizando el sistema..."
sudo apt update && sudo apt upgrade -y
log_info "Sistema actualizado"

# Lista de dependencias
log_step "Instalando dependencias generales..."

# Dividir en grupos para mejor manejo
log_info "Instalando herramientas básicas..."
sudo apt install -y \
    git \
    curl \
    wget \
    htop \
    nano \
    unzip \
    zip \
    jq

# Instalar OpenClaw
log_step "Instalando OpenClaw..."
curl -fsSL https://openclaw.ai/install.sh | bash
log_info "OpenClaw instalado correctamente ✓"

log_info "Instalando dependencias de Python..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential

log_info "Instalando dependencias de audio..."
sudo apt install -y \
    portaudio19-dev \
    ffmpeg \
    alsa-utils \
    pulseaudio

log_info "Instalando dependencias del sistema..."
sudo apt install -y \
    libsqlite3-dev \
    systemd \
    lsb-release \
    apt-transport-https \
    ca-certificates \
    gnupg \
    socat \
    dnsutils

log_info "✅ Dependencias generales instaladas"

# Verificar versión de Python
log_step "Verificando versión de Python..."
PY_VERSION=$(python3 --version | cut -d' ' -f2)
PY_MAJOR=$(echo $PY_VERSION | cut -d'.' -f1)
PY_MINOR=$(echo $PY_VERSION | cut -d'.' -f2)

if [ "$PY_MAJOR" -lt 3 ] || [ "$PY_MAJOR" -eq 3 -a "$PY_MINOR" -lt 10 ]; then
    log_warning "Se requiere Python 3.10 o superior"
    log_warning "Versión detectada: $PY_VERSION"
    log_step "Instalando Python 3.10..."

    # Instalar Python 3.10
    sudo apt install -y software-properties-common
    sudo add-apt-repository -y ppa:deadsnakes/ppa
    sudo apt update
    sudo apt install -y python3.10 python3.10-venv python3.10-dev

    # Verificar la instalación
    if command -v python3.10 &> /dev/null; then
        log_info "Python 3.10 instalado correctamente ✓"
        # Crear enlace simbólico para usar Python 3.10 por defecto
        sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1
    else
        log_error "Error al instalar Python 3.10"
        exit 1
    fi
else
    log_info "Python $PY_VERSION detectado correctamente ✓"
fi

# Configurar entorno virtual para Pascual
log_step "Configurando entorno virtual para Pascual..."
python3 -m venv "$PASCUAL_DIR/venv"
source "$PASCUAL_DIR/venv/bin/activate"

# Instalar paquetes Python base
log_step "Instalando paquetes Python base..."
pip install --upgrade pip
pip install \
    numpy \
    pandas \
    requests \
    aiohttp \
    websockets \
    pyyaml \
    python-dotenv \
    fastapi \
    uvicorn \
    colorlog \
    jsonlines \
    python-multipart

log_info "✅ Paquetes Python base instalados"

# Crear script de activación para entorno
log_step "Creando script de activación del entorno..."
cat > "$PASCUAL_DIR/activate_env.sh" << EOF
#!/bin/bash
# Script para activar el entorno de Pascual-Bot

echo "Activando entorno virtual de Pascual-Bot..."
source "\$HOME/.pascual/venv/bin/activate"

# Establecer variables de entorno
export PYTHONPATH="\$HOME/.pascual:\$PYTHONPATH"

# Variables para GPU AMD
export HSA_OVERRIDE_GFX_VERSION=11.0.0

echo "Entorno activado. Puedes ejecutar los comandos de Pascual-Bot ahora."
EOF

# Hacer ejecutable el script de activación
chmod +x "$PASCUAL_DIR/activate_env.sh"

log_info "Script de activación creado en $PASCUAL_DIR/activate_env.sh"

# Registrar fase completada
if [ -f "$PASCUAL_CONFIG/.env" ]; then
    grep -q "FASE_2_COMPLETED" "$PASCUAL_CONFIG/.env" || echo "FASE_2_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"
else
    echo "FASE_2_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"
fi

log_info "✅ Instalación de dependencias base completada"
log_info "➡️  Siguiente paso: ejecutar ./03-ollama-roc-amd.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0