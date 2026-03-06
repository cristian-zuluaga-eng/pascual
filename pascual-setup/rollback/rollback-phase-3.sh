#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# Rollback Fase 3: Ollama + AMD ROCm
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Revierte la instalación de Ollama y configuración ROCm
# ============================================================================

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

# Verificar permisos de sudo sin solicitar contraseña
check_sudo() {
    if sudo -n true 2>/dev/null; then
        return 0
    else
        log_error "Se requieren privilegios de sudo para este rollback"
        log_info "Por favor ejecuta: sudo echo 'Permisos de sudo confirmados'"
        log_info "Y luego ejecuta nuevamente este script"
        exit 1
    fi
}

# Encabezado
echo "============================================================================"
echo "         PASCUAL-BOT: ROLLBACK DE OLLAMA Y AMD ROCm                        "
echo "============================================================================"
echo ""

# Confirmar rollback
log_warning "⚠️  ATENCIÓN: Este script desinstalará Ollama y su configuración AMD ROCm"
echo ""
read -p "¿Estás seguro de que deseas continuar? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    log_info "Rollback cancelado por el usuario"
    exit 0
fi

# Verificar sudo
check_sudo

# Detener y eliminar servicio Ollama
if systemctl list-units --full -all | grep -q "ollama.service"; then
    log_info "Deteniendo servicio Ollama..."
    sudo systemctl stop ollama.service
    sudo systemctl disable ollama.service
fi

# Eliminar archivos de configuración de servicio
if [ -d "/etc/systemd/system/ollama.service.d" ]; then
    log_info "Eliminando configuración de servicio Ollama..."
    sudo rm -rf /etc/systemd/system/ollama.service.d
    sudo systemctl daemon-reload
fi

# Preguntar si desea eliminar los modelos descargados
read -p "¿Deseas eliminar también los modelos de Ollama? Esto liberará espacio pero requerirá volver a descargar (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    log_info "Eliminando modelos de Ollama..."

    # Verificar si existe el directorio .ollama
    if [ -d "$HOME/.ollama" ]; then
        rm -rf "$HOME/.ollama"
    fi
else
    log_info "Modelos de Ollama conservados"
fi

# Desinstalar Ollama
log_info "Desinstalando Ollama..."
if command -v ollama &> /dev/null; then
    # No hay desinstalador oficial, eliminar binario
    if [ -f "/usr/local/bin/ollama" ]; then
        sudo rm /usr/local/bin/ollama
    fi
fi

# Actualizar configuración de Pascual
if [ -f "$PASCUAL_CONFIG/.env" ]; then
    log_info "Actualizando archivo de configuración..."
    sed -i '/FASE_3_COMPLETED/d' "$PASCUAL_CONFIG/.env"
fi

log_info "✅ Rollback de Ollama y AMD ROCm completado"
log_info "Para reinstalar, ejecuta: ./03-ollama-roc-amd.sh"

exit 0