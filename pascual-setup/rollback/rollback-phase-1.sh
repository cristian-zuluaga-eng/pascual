#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# Rollback Fase 1: Estructura de Perfiles
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Revierte la creación de la estructura de directorios
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

# Encabezado
echo "============================================================================"
echo "         PASCUAL-BOT: ROLLBACK DE ESTRUCTURA DE PERFILES                    "
echo "============================================================================"
echo ""

# Confirmar rollback
log_warning "⚠️  ATENCIÓN: Este script eliminará toda la estructura de directorios de Pascual-Bot"
log_warning "⚠️  Ubicación: $PASCUAL_DIR"
echo ""
read -p "¿Estás seguro de que deseas continuar? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    log_info "Rollback cancelado por el usuario"
    exit 0
fi

# Verificar si existe el directorio
if [ ! -d "$PASCUAL_DIR" ]; then
    log_warning "El directorio $PASCUAL_DIR no existe. No hay nada que eliminar."
    exit 0
fi

# Crear un respaldo antes de eliminar
BACKUP_DIR="$HOME/pascual-backup-$(date +%Y%m%d%H%M%S)"
log_info "Creando respaldo en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Copiar archivos importantes antes de eliminar
if [ -d "$PASCUAL_DIR/config" ]; then
    log_info "Respaldando archivos de configuración..."
    cp -r "$PASCUAL_DIR/config" "$BACKUP_DIR/"
fi

# Eliminar estructura de directorios
log_warning "Eliminando estructura de directorios..."
rm -rf "$PASCUAL_DIR"

# Eliminar variables de entorno
if grep -q "PASCUAL_" "$HOME/.bashrc"; then
    log_info "Eliminando variables de entorno de .bashrc..."
    sed -i '/PASCUAL_/d' "$HOME/.bashrc"
fi

log_info "✅ Rollback de estructura de perfiles completado"
log_info "📁 Se ha creado un respaldo en: $BACKUP_DIR"
log_info "Para reinstalar, ejecuta: ./01-estructura-perfiles.sh"

exit 0