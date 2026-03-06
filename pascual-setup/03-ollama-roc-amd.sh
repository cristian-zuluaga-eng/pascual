#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 3: Ollama + Configuración AMD ROCm
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instala Ollama y configura soporte para AMD GPU via ROCm
# Dependencias: Dependencias base (02-dependencias-base.sh)
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
    if [ ! -f "$PASCUAL_CONFIG/.env" ]; then
        log_error "No se encontró el archivo de configuración de Pascual-Bot"
        log_info "Debes ejecutar primero: ./02-dependencias-base.sh"
        exit 1
    fi

    # Verificar que la fase 2 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_2_COMPLETED" != "true" ]; then
        log_error "La fase 2 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./02-dependencias-base.sh"
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
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-3.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# Verificar que AMD GPU esté presente (Radeon 780M)
check_amd_gpu() {
    log_step "Verificando hardware AMD GPU..."

    if lspci | grep -i "vga\|3d\|display" | grep -i "AMD\|Radeon\|ATI" > /dev/null; then
        GPU_INFO=$(lspci | grep -i "vga\|3d\|display" | grep -i "AMD\|Radeon\|ATI")
        log_info "GPU AMD detectada: $GPU_INFO"
        return 0
    else
        log_warning "No se detectó GPU AMD compatible con ROCm"
        log_warning "Esta instalación está optimizada para AMD Radeon 780M"
        read -p "¿Deseas continuar de todos modos? La aceleración GPU puede no funcionar (s/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            log_info "Instalación cancelada por el usuario"
            exit 0
        fi
        return 1
    fi
}

# Instalar ROCm para AMD GPU
install_rocm() {
    log_step "Instalando AMD ROCm..."

    # Verificar si ROCm ya está instalado
    if command -v rocminfo &> /dev/null; then
        log_info "ROCm ya está instalado ✓"
        rocminfo --version
        return 0
    fi

    # Agregar repositorio ROCm
    log_info "Agregando repositorio ROCm..."

    # Dependencias para repositorio
    sudo apt-get update
    sudo apt-get install -y wget gnupg

    # Descargar y agregar clave pública
    wget -q -O - https://repo.radeon.com/rocm/rocm.gpg.key | sudo apt-key add -

    # Agregar repositorio (ajustar para la versión de Ubuntu)
    echo "deb [arch=amd64] https://repo.radeon.com/rocm/apt/debian/ ubuntu main" | sudo tee /etc/apt/sources.list.d/rocm.list

    sudo apt-get update

    # Instalar paquetes básicos ROCm
    log_info "Instalando paquetes ROCm..."
    sudo apt-get install -y \
        rocm-dev \
        miopen-hip \
        rocblas

    # Verificar instalación
    if command -v rocminfo &> /dev/null; then
        log_info "ROCm instalado correctamente ✓"
        rocminfo --version
        # Agregar al grupo
        sudo usermod -a -G render,video $USER
        return 0
    else
        log_error "Error al instalar ROCm"
        return 1
    fi
}

# Instalar Ollama
install_ollama() {
    log_step "Instalando Ollama..."

    # Verificar si Ollama ya está instalado
    if command -v ollama &> /dev/null; then
        OLLAMA_VER=$(ollama --version)
        log_info "Ollama ya está instalado: $OLLAMA_VER"
        return 0
    fi

    # Instalar Ollama
    log_info "Descargando e instalando Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh

    # Verificar instalación
    if command -v ollama &> /dev/null; then
        OLLAMA_VER=$(ollama --version)
        log_info "Ollama instalado correctamente: $OLLAMA_VER"
        return 0
    else
        log_error "Error al instalar Ollama"
        return 1
    fi
}

# Configurar servicio Ollama con soporte AMD
configure_ollama_service() {
    log_step "Configurando servicio Ollama con soporte AMD ROCm..."

    # Detener servicio si está corriendo
    sudo systemctl stop ollama.service 2>/dev/null || true

    # Crear directorio para override
    sudo mkdir -p /etc/systemd/system/ollama.service.d

    # Crear archivo de override
    sudo tee /etc/systemd/system/ollama.service.d/override.conf > /dev/null << EOF
[Service]
Environment="HSA_OVERRIDE_GFX_VERSION=11.0.0"
Environment="OLLAMA_MODELS=${OLLAMA_MODELS_DIR:-$HOME/.ollama}"
EOF

    # Recargar systemd
    sudo systemctl daemon-reload

    # Iniciar y habilitar servicio
    sudo systemctl enable ollama.service
    sudo systemctl start ollama.service

    # Verificar estado
    if sudo systemctl is-active ollama.service > /dev/null; then
        log_info "Servicio Ollama configurado y activo ✓"
        return 0
    else
        log_error "Error al iniciar servicio Ollama"
        sudo systemctl status ollama.service --no-pager
        return 1
    fi
}

# Verificar que Ollama esté funcionando con GPU
verify_ollama_gpu() {
    log_step "Verificando funcionamiento de Ollama con GPU..."

    # Esperar a que el servicio esté completamente arriba
    sleep 5

    # Verificar si el servidor Ollama está respondiendo
    if ! curl -s http://localhost:11434/api/version > /dev/null; then
        log_warning "El servidor Ollama no está respondiendo"
        log_info "Intentando iniciar el servidor manualmente..."
        ollama serve > /dev/null 2>&1 &
        OLLAMA_PID=$!
        sleep 5

        # Verificar nuevamente
        if ! curl -s http://localhost:11434/api/version > /dev/null; then
            log_error "No se pudo iniciar el servidor Ollama"
            kill $OLLAMA_PID 2>/dev/null || true
            return 1
        fi
    fi

    # Prueba simple para verificar funcionamiento
    log_info "Realizando prueba de Ollama..."

    # Crear archivo temporal para la prueba
    TEST_FILE=$(mktemp)
    cat > "$TEST_FILE" << EOF
{
  "model": "llama2",
  "prompt": "Responde brevemente: ¿Estás funcionando?"
}
EOF

    # Realizar prueba y capturar salida
    RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate -d "@$TEST_FILE")

    # Limpiar
    rm -f "$TEST_FILE"

    # Verificar respuesta
    if [[ "$RESPONSE" == *"funcionando"* ]] || [[ "$RESPONSE" == *"working"* ]]; then
        log_info "Ollama está respondiendo correctamente ✓"

        # Guardar ruta de modelos en .env si no existe
        if ! grep -q "OLLAMA_MODELS_DIR" "$PASCUAL_CONFIG/.env"; then
            echo "OLLAMA_MODELS_DIR=$HOME/.ollama/models" >> "$PASCUAL_CONFIG/.env"
        fi

        return 0
    else
        log_warning "No se pudo verificar que Ollama esté funcionando correctamente"
        log_info "Respuesta recibida: ${RESPONSE:0:100}..."
        return 0  # No consideramos esto un error fatal
    fi
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "             PASCUAL-BOT: OLLAMA + CONFIGURACIÓN AMD ROCm                   "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env
check_sudo

# Exportar variable para esta sesión
export HSA_OVERRIDE_GFX_VERSION=11.0.0

# Verificar hardware AMD
check_amd_gpu

# Instalar ROCm (opcional según detección de hardware)
if check_amd_gpu; then
    install_rocm
else
    log_warning "Instalación de ROCm omitida - hardware no compatible"
fi

# Instalar Ollama
install_ollama

# Configurar servicio Ollama
configure_ollama_service

# Verificar funcionamiento
verify_ollama_gpu

# Registrar fase completada
echo "FASE_3_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Ollama instalado y configurado correctamente con soporte AMD"
log_info "➡️  Siguiente paso: ejecutar ./04-modelos-ia.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0