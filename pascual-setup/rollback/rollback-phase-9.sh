#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# Rollback Fase 9: Sentinel
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Revierte la instalación del servicio Sentinel
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
SENTINEL_DIR="$PASCUAL_DIR/sentinel"

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
echo "         PASCUAL-BOT: ROLLBACK DE SENTINEL                                 "
echo "============================================================================"
echo ""

# Confirmar rollback
log_warning "⚠️  ATENCIÓN: Este script desinstalará el servicio Sentinel"
echo ""
read -p "¿Estás seguro de que deseas continuar? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    log_info "Rollback cancelado por el usuario"
    exit 0
fi

# Verificar sudo
check_sudo

# Detener y eliminar servicio Sentinel
if systemctl list-units --full -all | grep -q "pascual-sentinel.service"; then
    log_info "Deteniendo servicio Sentinel..."
    sudo systemctl stop pascual-sentinel.service
    sudo systemctl disable pascual-sentinel.service
fi

# Eliminar archivo de servicio
if [ -f "/etc/systemd/system/pascual-sentinel.service" ]; then
    log_info "Eliminando archivo de servicio..."
    sudo rm /etc/systemd/system/pascual-sentinel.service
    sudo systemctl daemon-reload
fi

# Eliminar tarea cron
log_info "Eliminando tareas cron asociadas..."
(crontab -l | grep -v "sentinel.py --cleanup") | crontab -

# Preguntar si desea eliminar los archivos de Sentinel
read -p "¿Deseas eliminar también los archivos de Sentinel? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    log_info "Eliminando archivos de Sentinel..."

    # Verificar si existe el directorio de sentinel
    if [ -d "$SENTINEL_DIR" ]; then
        # Crear respaldo
        BACKUP_DIR="$PASCUAL_DIR/backups/sentinel-$(date +%Y%m%d%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        cp -r "$SENTINEL_DIR"/* "$BACKUP_DIR/"

        # Eliminar archivos
        rm -rf "$SENTINEL_DIR"/*

        log_info "Respaldo creado en: $BACKUP_DIR"
    else
        log_warning "Directorio de Sentinel no encontrado: $SENTINEL_DIR"
    fi
else
    log_info "Archivos de Sentinel conservados"
fi

# Actualizar configuración de Pascual
if [ -f "$PASCUAL_CONFIG/.env" ]; then
    log_info "Actualizando archivo de configuración..."
    sed -i '/FASE_9_COMPLETED/d' "$PASCUAL_CONFIG/.env"
fi

log_info "✅ Rollback de Sentinel completado"
log_info "Para reinstalar, ejecuta: ./09-sentinel-agente.sh"

exit 0