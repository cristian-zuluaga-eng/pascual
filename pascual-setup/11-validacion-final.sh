#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local
# ============================================================================
# FASE 11: Validación Final
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Verifica la instalación completa y genera reporte de estado
# Dependencias: Todas las fases anteriores
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

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    echo "[SUCCESS] $(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$PASCUAL_LOG" 2>/dev/null || true
}

log_failure() {
    echo -e "${RED}[✗]${NC} $1"
    echo "[FAILURE] $(date +"%Y-%m-%d %H:%M:%S") - $1" >> "$PASCUAL_LOG" 2>/dev/null || true
}

# Verificar estructura de directorios
check_directory_structure() {
    log_step "Verificando estructura de directorios..."
    local error_count=0

    # Directorios básicos
    local dirs=("core" "shared" "config" "master" "docs" "workflows" "skills" "dashboard")

    for dir in "${dirs[@]}"; do
        if [ ! -d "$PASCUAL_DIR/$dir" ]; then
            log_error "Directorio faltante: $PASCUAL_DIR/$dir"
            error_count=$((error_count + 1))
        else
            echo "  ✓ Directorio $dir"
        fi
    done

    # Archivos de configuración
    for file in ".env"; do
        if [ ! -f "$PASCUAL_CONFIG/$file" ]; then
            log_error "Archivo de configuración faltante: $PASCUAL_CONFIG/$file"
            error_count=$((error_count + 1))
        else
            echo "  ✓ Archivo $file"
        fi
    done

    # Retornar resultado
    if [ $error_count -eq 0 ]; then
        log_info "Estructura de directorios completa"
        return 0
    else
        log_error "Estructura de directorios incompleta: $error_count problemas encontrados"
        return 1
    fi
}

# Verificar servicios
check_services() {
    log_step "Verificando estado de servicios..."
    local error_count=0

    # Servicios principales
    local services=("pascual-maestro" "ollama")

    for service in "${services[@]}"; do
        if systemctl list-units --full -all | grep -q "$service.service"; then
            local status=$(systemctl is-active "$service.service")

            if [ "$status" = "active" ]; then
                echo "  ✓ Servicio $service: ACTIVO"
            else
                log_warning "Servicio $service: INACTIVO ($status)"
                error_count=$((error_count + 1))
            fi
        else
            log_error "Servicio $service no encontrado"
            error_count=$((error_count + 1))
        fi
    done

    # Servicio del dashboard (opcional)
    if systemctl list-units --full -all | grep -q "pascual-dashboard.service"; then
        local dashboard_status=$(systemctl is-active "pascual-dashboard.service")
        if [ "$dashboard_status" = "active" ]; then
            echo "  ✓ Servicio Dashboard: ACTIVO"
        else
            log_warning "Servicio Dashboard: INACTIVO ($dashboard_status) - No es crítico"
        fi
    else
        log_info "Servicio Dashboard no instalado como servicio (normal)"
    fi

    # Retornar resultado
    if [ $error_count -eq 0 ]; then
        log_info "Servicios configurados correctamente"
        return 0
    else
        log_error "Problemas en servicios: $error_count errores encontrados"
        return 1
    fi
}

# Verificar modelos de IA
check_models() {
    log_step "Verificando modelos de IA..."
    local error_count=0

    # Verificar que Ollama esté instalado
    if ! command -v ollama &> /dev/null; then
        log_error "Ollama no está instalado"
        return 1
    fi

    # Verificar que el servicio esté activo
    if ! systemctl is-active ollama.service &> /dev/null; then
        log_warning "Servicio Ollama no está activo, intentando iniciar..."
        sudo systemctl start ollama.service
        sleep 5
    fi

    # Listar modelos y verificar básicos
    echo "Listando modelos instalados:"
    ollama list

    # Verificar modelos básicos requeridos
    local required_models=("llama3.2:3b" "qwen2.5:7b" "llava:7b")

    for model in "${required_models[@]}"; do
        if ! ollama list | grep -q "$model"; then
            log_warning "Modelo requerido no encontrado: $model"
            error_count=$((error_count + 1))
        else
            echo "  ✓ Modelo $model"
        fi
    done

    # Retornar resultado
    if [ $error_count -eq 0 ]; then
        log_info "Modelos de IA instalados correctamente"
        return 0
    else
        log_warning "Faltan algunos modelos de IA: $error_count modelos no encontrados"
        return 1
    fi
}

# Verificar herramientas de voz
check_voice_tools() {
    log_step "Verificando herramientas de voz..."

    # Verificar entorno virtual
    if [ ! -d "$PASCUAL_DIR/venv" ]; then
        log_warning "Entorno virtual Python no encontrado"
        return 1
    fi

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Verificar paquetes Python
    local voice_packages=("faster_whisper" "pyaudio" "pvporcupine" "webrtcvad")
    local missing_packages=0

    for pkg in "${voice_packages[@]}"; do
        if ! python -c "import $pkg" &> /dev/null; then
            log_warning "Paquete $pkg no instalado"
            missing_packages=$((missing_packages + 1))
        else
            echo "  ✓ Paquete $pkg"
        fi
    done

    # Verificar Piper TTS
    if [ ! -d "$HOME/piper" ] || [ ! -f "$HOME/piper/bin/piper" ]; then
        log_warning "Piper TTS no encontrado"
        missing_packages=$((missing_packages + 1))
    else
        echo "  ✓ Piper TTS"

        # Verificar voces
        local voices=$(find "$HOME/piper/voices" -name "*.onnx" | wc -l)
        echo "  ✓ Voces instaladas: $voices"
    fi

    # Verificar script de prueba
    if [ ! -f "$PASCUAL_DIR/master/test-voice.py" ]; then
        log_warning "Script de prueba de voz no encontrado"
    else
        echo "  ✓ Script test-voice.py"
    fi

    # Resumen
    if [ $missing_packages -gt 0 ]; then
        log_warning "Faltan algunos componentes de voz: $missing_packages paquetes no encontrados"
        return 1
    else
        log_info "Herramientas de voz instaladas correctamente"
        return 0
    fi
}

# Generar reporte de instalación
generate_report() {
    log_step "Generando reporte de instalación..."
    local report_file="$PASCUAL_DIR/installation_report.md"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")

    # Crear reporte en formato Markdown
    cat > "$report_file" << EOF
# 📋 Reporte de Instalación de Pascual-Bot

**Fecha**: $timestamp

## 📊 Resumen del Sistema

- **Sistema**: $(lsb_release -ds 2>/dev/null || cat /etc/*release 2>/dev/null | head -n1 || uname -om)
- **Kernel**: $(uname -r)
- **CPU**: $(grep "model name" /proc/cpuinfo | head -n1 | cut -d':' -f2 | sed 's/^[ \t]*//')
- **RAM Total**: $(free -h | grep Mem | awk '{print $2}')
- **Espacio en Disco**: $(df -h / | grep / | awk '{print $4}') disponible

## 🧩 Componentes Instalados

| Componente | Estado | Versión |
|------------|--------|---------|
| Pascual-Maestro | $(systemctl is-active pascual-maestro.service 2>/dev/null || echo "No instalado") | ${PASCUAL_VERSION:-1.0.0} |
| Ollama | $(systemctl is-active ollama.service 2>/dev/null || echo "No instalado") | $(ollama --version 2>/dev/null || echo "Desconocido") |
| Python | Instalado | $(python3 --version 2>/dev/null || echo "Desconocido") |
| Node.js | $(command -v node &> /dev/null && echo "Instalado" || echo "No instalado") | $(node --version 2>/dev/null || echo "Desconocido") |

## 🤖 Modelos de IA

$(ollama list 2>/dev/null || echo "No se pudieron listar los modelos")

## 🧪 Resultados de Validación

- **Estructura de Directorios**: $(check_directory_structure > /dev/null 2>&1 && echo "✅ Completa" || echo "❌ Incompleta")
- **Servicios**: $(check_services > /dev/null 2>&1 && echo "✅ Activos" || echo "❌ Problemas encontrados")
- **Modelos de IA**: $(check_models > /dev/null 2>&1 && echo "✅ Instalados" || echo "❌ Incompletos")
- **Herramientas de Voz**: $(check_voice_tools > /dev/null 2>&1 && echo "✅ Instaladas" || echo "❌ Incompletas")

## 📝 Próximos Pasos

1. **Verificar Servicios**:
   \`\`\`
   systemctl status pascual-maestro.service
   \`\`\`

2. **Probar Reconocimiento de Voz**:
   \`\`\`
   python3 ~/.pascual/master/test-voice.py
   \`\`\`

3. **Acceder al Dashboard**:
   \`\`\`
   cd ~/.pascual/dashboard && npm run dev
   \`\`\`
   Luego abra en su navegador: http://localhost:3000
EOF

    # Aviso de finalización
    log_info "Reporte generado en $report_file"
    return 0
}

# Verificar instalación completa
verificar_instalacion_completa() {
    log_step "Verificando la instalación completa de Pascual-Bot..."

    # Realizar verificaciones
    local check_results=0
    check_directory_structure || check_results=$((check_results + 1))
    check_services || check_results=$((check_results + 1))
    check_models || check_results=$((check_results + 1))
    check_voice_tools || check_results=$((check_results + 1))

    # Generar reporte
    generate_report

    # Mostrar resultado final
    echo ""
    echo "============================================================================"
    echo "          PASCUAL-BOT: VERIFICACIÓN DE INSTALACIÓN COMPLETADA                "
    echo "============================================================================"

    if [ $check_results -eq 0 ]; then
        log_success "¡Instalación completada con éxito!"
        echo ""
        echo "Todos los componentes han sido instalados correctamente."
        echo "Puedes revisar el reporte detallado en: $PASCUAL_DIR/installation_report.md"
    else
        log_warning "Instalación completada con advertencias ($check_results problemas)"
        echo ""
        echo "Se detectaron algunos problemas que deberías revisar."
        echo "Revisa el reporte detallado en: $PASCUAL_DIR/installation_report.md"
    fi

    echo ""
    log_info "Para comenzar a usar Pascual:"
    echo "  1. Inicia los servicios requeridos"
    echo "     systemctl start ollama.service"
    echo "     systemctl start pascual-maestro.service"
    echo ""
    echo "  2. Inicia el dashboard web (opcional)"
    echo "     cd $PASCUAL_DIR/dashboard && npm run dev"
    echo ""
    echo "  3. Prueba la interacción por voz"
    echo "     python3 $PASCUAL_DIR/master/test-voice.py"
    echo ""

    return $check_results
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "                PASCUAL-BOT: VALIDACIÓN FINAL                              "
echo "============================================================================"
echo ""

# Verificación completa
verificar_instalacion_completa

exit 0