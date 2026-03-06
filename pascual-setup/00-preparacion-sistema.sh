#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 0: Preparación del Sistema
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instrucciones de preparación del sistema para instalar Pascual-Bot
# ============================================================================

# Variables de color para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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
echo "                  PASCUAL-BOT: PREPARACIÓN DEL SISTEMA                      "
echo "============================================================================"
echo ""

log_info "Esta fase requiere intervención manual antes de continuar con la instalación"
log_info "automatizada de Pascual-Bot."
echo ""

echo -e "${YELLOW}📋 CHECKLIST DE PREPARACIÓN:${NC}"
echo ""
echo "[ ] 1. Respaldar datos importantes de Windows (si dual-boot)"
echo "[ ] 2. Descargar Ubuntu 24.04 LTS: https://ubuntu.com/download"
echo "[ ] 3. Crear USB booteable con Rufus (Windows) o BalenaEtcher (Mac)"
echo "[ ] 4. Arrancar desde USB (F7/F11 al encender UM790 Pro)"
echo "[ ] 5. Instalar Ubuntu (borrar disco o junto a Windows)"
echo "[ ] 6. Completar asistente de instalación (usuario, contraseña)"
echo "[ ] 7. Reiniciar y remover USB"
echo "[ ] 8. Conectar a internet y hacer update inicial"
echo "[ ] 9. Instalar git (sudo apt install -y git)"
echo "[ ]10. Clonar este repositorio"
echo ""

log_warning "Es CRÍTICO que el hardware sea compatible con AMD ROCm:"
echo "   - UM790 Pro (Ryzen 9 7940HS)"
echo "   - Radeon 780M iGPU"
echo "   - 32GB RAM mínimo, 64GB recomendado"
echo ""

log_info "Una vez instalado Ubuntu 24.04 LTS, continúa con el siguiente script:"
echo -e "${GREEN}   ./01-estructura-perfiles.sh${NC}"
echo ""

# Verificación para continuar
echo "============================================================================"
log_info "Para continuar al siguiente paso, primero completa la checklist anterior"
echo "============================================================================"