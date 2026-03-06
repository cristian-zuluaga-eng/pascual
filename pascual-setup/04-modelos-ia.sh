#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 4: Descarga de Modelos de IA
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Descarga de modelos LLM, visión y embeddings para uso local
# Dependencias: Ollama (03-ollama-roc-amd.sh)
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

# Verificar que la fase anterior se haya ejecutado
check_previous_phase() {
    if [ ! -f "$PASCUAL_CONFIG/.env" ]; then
        log_error "No se encontró el archivo de configuración de Pascual-Bot"
        log_info "Debes ejecutar primero: ./03-ollama-roc-amd.sh"
        exit 1
    fi

    # Verificar que la fase 3 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_3_COMPLETED" != "true" ]; then
        log_error "La fase 3 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./03-ollama-roc-amd.sh"
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
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-4.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# Verificar si Ollama está instalado y funcionando
check_ollama() {
    log_step "Verificando instalación de Ollama..."

    if ! command -v ollama &> /dev/null; then
        log_error "Ollama no está instalado"
        log_info "Debes ejecutar primero: ./03-ollama-roc-amd.sh"
        exit 1
    fi

    # Verificar si el servicio está activo
    if ! curl -s http://localhost:11434/api/version > /dev/null; then
        log_warning "El servidor de Ollama no está respondiendo"

        # Intentar iniciar el servicio
        log_info "Intentando iniciar el servicio Ollama..."
        sudo systemctl start ollama.service
        sleep 5

        # Verificar nuevamente
        if ! curl -s http://localhost:11434/api/version > /dev/null; then
            log_error "No se pudo iniciar el servicio Ollama"
            exit 1
        fi
    fi

    # Todo bien
    log_info "Ollama está instalado y funcionando correctamente ✓"
    return 0
}

# Verificar RAM disponible para decidir qué modelos descargar
check_ram() {
    log_step "Verificando memoria RAM disponible..."

    # Obtener RAM total en KB y convertir a GB
    local MEM_TOTAL_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
    local MEM_TOTAL_GB=$((MEM_TOTAL_KB / 1024 / 1024))

    log_info "Memoria RAM total: ${MEM_TOTAL_GB}GB"

    # Determinar qué modelos son seguros de descargar
    if [ "$MEM_TOTAL_GB" -ge 64 ]; then
        log_info "Memoria suficiente para modelos grandes (64GB+ RAM) ✓"
        echo "RAM_TIER=large" >> "$PASCUAL_CONFIG/.env"
    elif [ "$MEM_TOTAL_GB" -ge 32 ]; then
        log_info "Memoria suficiente para modelos medianos (32GB RAM) ✓"
        echo "RAM_TIER=medium" >> "$PASCUAL_CONFIG/.env"
    else
        log_warning "Memoria limitada (menos de 32GB). Solo se instalarán modelos pequeños."
        echo "RAM_TIER=small" >> "$PASCUAL_CONFIG/.env"
    fi

    return 0
}

# Descargar modelo con retry
download_model() {
    local model_name=$1
    local max_attempts=3
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        log_info "Descargando modelo $model_name (intento $attempt de $max_attempts)..."

        if ollama pull "$model_name"; then
            log_info "Modelo $model_name descargado correctamente ✓"
            return 0
        else
            log_warning "Error al descargar modelo $model_name (intento $attempt)"
            attempt=$((attempt+1))
            sleep 5
        fi
    done

    log_error "No se pudo descargar el modelo $model_name después de $max_attempts intentos"
    return 1
}

# Verificar que el modelo se haya descargado correctamente
verify_model() {
    local model_name=$1

    if ollama list | grep -q "$model_name"; then
        log_info "Verificación: modelo $model_name encontrado ✓"
        return 0
    else
        log_error "El modelo $model_name no se encuentra en la lista de modelos descargados"
        return 1
    fi
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "                  PASCUAL-BOT: DESCARGA DE MODELOS DE IA                    "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env

# Verificar Ollama
check_ollama

# Verificar RAM disponible
check_ram

# Crear directorio de tracking
mkdir -p "$PASCUAL_DIR/shared/models/status"

# Descargar modelos base (para cualquier cantidad de RAM)
log_step "Descargando modelos base..."

# Modelo pequeño rápido (3B)
log_info "Descargando Llama 3.2 3B (rápido)..."
if download_model "llama3.2:3b"; then
    verify_model "llama3.2:3b"
    touch "$PASCUAL_DIR/shared/models/status/llama3.2-3b.done"
fi

# Modelo mediano (7B) - balanceado
log_info "Descargando Qwen2.5 7B (balance velocidad/calidad)..."
if download_model "qwen2.5:7b"; then
    verify_model "qwen2.5:7b"
    touch "$PASCUAL_DIR/shared/models/status/qwen2.5-7b.done"
fi

# Modelo de visión
log_info "Descargando LLaVA 7B (visión)..."
if download_model "llava:7b"; then
    verify_model "llava:7b"
    touch "$PASCUAL_DIR/shared/models/status/llava-7b.done"
fi

# Modelos adicionales según RAM disponible
if [ "$RAM_TIER" = "large" ]; then
    log_step "Descargando modelos adicionales para sistemas con 64GB+ RAM..."

    # Modelo grande avanzado
    log_info "Descargando Qwen2.5 14B (avanzado)..."
    if download_model "qwen2.5:14b"; then
        verify_model "qwen2.5:14b"
        touch "$PASCUAL_DIR/shared/models/status/qwen2.5-14b.done"
    fi

    # Phi-3 (opcional)
    log_info "Descargando Phi-3 Medium (opcional)..."
    if download_model "phi3:medium"; then
        verify_model "phi3:medium"
        touch "$PASCUAL_DIR/shared/models/status/phi3-medium.done"
    fi
elif [ "$RAM_TIER" = "medium" ]; then
    log_warning "No se descargarán modelos grandes (14B+) debido a limitaciones de RAM (32GB)"
    log_info "Si deseas probar modelos más grandes, ejecuta: ollama pull qwen2.5:14b"
else
    log_warning "Sistema con RAM limitada. Solo se han descargado modelos pequeños y medianos."
    log_warning "No se recomienda ejecutar modelos más grandes en este sistema."
fi

# Mostrar modelos descargados
log_step "Modelos instalados:"
ollama list

# Registrar fase completada
echo "FASE_4_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Modelos de IA descargados correctamente"
log_info "➡️  Siguiente paso: ejecutar ./05-servicios-voz.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0