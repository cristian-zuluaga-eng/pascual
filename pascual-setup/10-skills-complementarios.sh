#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local
# ============================================================================
# FASE 10: Skills Complementarios
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instala skills complementarios como OCR, procesamiento de PDFs, etc.
# Dependencias: Workflows (09-workflows-orchestrator.sh)
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
SKILLS_DIR="$PASCUAL_DIR/skills"

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
        log_info "Debes ejecutar primero: ./09-workflows-orchestrator.sh"
        exit 1
    fi

    # Verificar que la fase 9 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_9_COMPLETED" != "true" ]; then
        log_error "La fase 9 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./09-workflows-orchestrator.sh"
        exit 1
    fi
}