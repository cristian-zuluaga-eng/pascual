#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# Rollback Completo: Eliminar toda la instalación
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Revierte completamente la instalación de Pascual-Bot
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

# Función para imprimir mensajes con formato
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar permisos de sudo sin solicitar contraseña
check_sudo() {
    if sudo -n true 2>/dev/null; then
        return 0
    else
        log_error "Se requieren privilegios de sudo para este rollback completo"
        log_info "Por favor ejecuta: sudo echo 'Permisos de sudo confirmados'"
        log_info "Y luego ejecuta nuevamente este script"
        exit 1
    fi
}

# Encabezado
echo "============================================================================"
echo "         PASCUAL-BOT: ROLLBACK COMPLETO DE LA INSTALACIÓN                  "
echo "============================================================================"
echo ""

# Confirmar rollback con verificación adicional
log_warning "⚠️  ATENCIÓN: Este script eliminará TODA la instalación de Pascual-Bot"
log_warning "⚠️  Incluye todos los servicios, archivos, configuraciones y datos de usuario"
echo ""
read -p "¿Estás ABSOLUTAMENTE seguro de que deseas continuar? (escriba 'CONFIRMAR' para proceder): " confirm
echo ""

if [ "$confirm" != "CONFIRMAR" ]; then
    log_info "Rollback cancelado por el usuario"
    exit 0
fi

# Verificar sudo
check_sudo

# Crear respaldo antes de eliminar todo
BACKUP_DIR="$HOME/pascual-backup-completo-$(date +%Y%m%d%H%M%S)"
log_info "Creando respaldo completo en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Verificar directorio Pascual
if [ -d "$PASCUAL_DIR" ]; then
    cp -r "$PASCUAL_DIR" "$BACKUP_DIR/"
else
    log_warning "Directorio principal de Pascual-Bot no encontrado"
fi

# Detener todos los servicios
log_info "Deteniendo servicios de Pascual-Bot..."
sudo systemctl stop pascual-maestro.service 2>/dev/null || true
sudo systemctl stop pascual-sentinel.service 2>/dev/null || true
sudo systemctl stop pascual-dashboard.service 2>/dev/null || true
sudo systemctl stop ollama.service 2>/dev/null || true

# Deshabilitar servicios
log_info "Deshabilitando servicios..."
sudo systemctl disable pascual-maestro.service 2>/dev/null || true
sudo systemctl disable pascual-sentinel.service 2>/dev/null || true
sudo systemctl disable pascual-dashboard.service 2>/dev/null || true

# Eliminar archivos de servicio
log_info "Eliminando archivos de servicio..."
sudo rm -f /etc/systemd/system/pascual-maestro.service 2>/dev/null || true
sudo rm -f /etc/systemd/system/pascual-sentinel.service 2>/dev/null || true
sudo rm -f /etc/systemd/system/pascual-dashboard.service 2>/dev/null || true

# Eliminar configuración de servicio Ollama
sudo rm -rf /etc/systemd/system/ollama.service.d 2>/dev/null || true

# Recargar systemd
sudo systemctl daemon-reload

# Eliminar tareas cron
log_info "Eliminando tareas cron..."
(crontab -l | grep -v "pascual") | crontab -

# Preguntar si eliminar Ollama y modelos
read -p "¿Deseas desinstalar Ollama y sus modelos? (s/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Ss]$ ]]; then
    log_info "Desinstalando Ollama..."

    # Eliminar binario de Ollama
    if [ -f "/usr/local/bin/ollama" ]; then
        sudo rm /usr/local/bin/ollama 2>/dev/null || true
    fi

    # Eliminar modelos
    if [ -d "$HOME/.ollama" ]; then
        log_warning "Eliminando modelos de Ollama (esto puede liberar bastante espacio)..."
        rm -rf "$HOME/.ollama"
    fi
else
    log_info "Ollama y sus modelos se han conservado"
fi

# Eliminar entorno virtual Python
if [ -d "$PASCUAL_DIR/venv" ]; then
    log_info "Eliminando entorno virtual Python..."
    rm -rf "$PASCUAL_DIR/venv"
fi

# Eliminar directorio principal
log_warning "Eliminando directorio principal de Pascual-Bot..."
rm -rf "$PASCUAL_DIR"

# Eliminar otras carpetas relacionadas
log_info "Eliminando directorios adicionales..."
rm -rf "$HOME/piper" 2>/dev/null || true

# Eliminar variables de entorno
log_info "Eliminando variables de entorno..."
if grep -q "PASCUAL_" "$HOME/.bashrc"; then
    sed -i '/PASCUAL_/d' "$HOME/.bashrc"
fi
if grep -q "HSA_OVERRIDE_GFX_VERSION" "$HOME/.bashrc"; then
    sed -i '/HSA_OVERRIDE_GFX_VERSION/d' "$HOME/.bashrc"
fi

log_info "✅ Rollback completo ejecutado exitosamente"
log_info "📁 Se ha creado un respaldo en: $BACKUP_DIR"
log_info "Para reinstalar, comienza desde el primer script: ./00-preparacion-sistema.sh"

exit 0