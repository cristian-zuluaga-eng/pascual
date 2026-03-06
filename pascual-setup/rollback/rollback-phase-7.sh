#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# Rollback Fase 7: Pascual-Maestro
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Revierte la instalación del servicio Pascual-Maestro
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
MASTER_DIR="$PASCUAL_DIR/master"

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
echo "         PASCUAL-BOT: ROLLBACK DE PASCUAL-MAESTRO                         "
echo "============================================================================"
echo ""

# Confirmar rollback
log_warning "⚠️  ATENCIÓN: Este script desinstalará el servicio Pascual-Maestro"
echo ""
read -p "¿Estás seguro de que deseas continuar? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    log_info "Rollback cancelado por el usuario"
    exit 0
fi

# Verificar sudo
check_sudo

# Detener y eliminar servicio Pascual-Maestro
if systemctl list-units --full -all | grep -q "pascual-maestro.service"; then
    log_info "Deteniendo servicio Pascual-Maestro..."
    sudo systemctl stop pascual-maestro.service
    sudo systemctl disable pascual-maestro.service
fi

# Eliminar archivo de servicio
if [ -f "/etc/systemd/system/pascual-maestro.service" ]; then
    log_info "Eliminando archivo de servicio..."
    sudo rm /etc/systemd/system/pascual-maestro.service
    sudo systemctl daemon-reload
fi

# Preguntar si desea eliminar los archivos del maestro
read -p "¿Deseas eliminar también los archivos del maestro? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    log_info "Eliminando archivos del maestro..."

    # Verificar si existe el directorio maestro
    if [ -d "$MASTER_DIR" ]; then
        # Crear respaldo
        BACKUP_DIR="$PASCUAL_DIR/backups/maestro-$(date +%Y%m%d%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        cp -r "$MASTER_DIR"/* "$BACKUP_DIR/"

        # Eliminar archivos
        rm -rf "$MASTER_DIR"/*

        log_info "Respaldo creado en: $BACKUP_DIR"
    else
        log_warning "Directorio del maestro no encontrado: $MASTER_DIR"
    fi
else
    log_info "Archivos del maestro conservados"
fi

# Actualizar configuración de Pascual
if [ -f "$PASCUAL_CONFIG/.env" ]; then
    log_info "Actualizando archivo de configuración..."
    sed -i '/FASE_7_COMPLETED/d' "$PASCUAL_CONFIG/.env"
fi

log_info "✅ Rollback de Pascual-Maestro completado"
log_info "Para reinstalar, ejecuta: ./07-pascual-maestro.sh"

exit 0