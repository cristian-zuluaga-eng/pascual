#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 13: Validación Final
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

# Verificar estructura de directorios
check_directory_structure() {
    log_step "Verificando estructura de directorios..."
    local error_count=0

    # Directorios principales
    for dir in "users" "shared" "config" "master" "sentinel" "workflows" "skills"; do
        if [ ! -d "$PASCUAL_DIR/$dir" ]; then
            log_error "Directorio faltante: $PASCUAL_DIR/$dir"
            error_count=$((error_count + 1))
        else
            echo "  ✓ Directorio $dir"
        fi
    done

    # Archivos de configuración
    for file in "routing.json" "sentinel_policy.json" ".env"; do
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

# Verificar usuarios
check_users() {
    log_step "Verificando perfiles de usuario..."

    # Cargar usuarios desde routing.json
    local users_dir="$PASCUAL_DIR/users"
    local routing_file="$PASCUAL_CONFIG/routing.json"
    local registered_users=()

    if [ -f "$routing_file" ]; then
        # Usar Python para extraer usuarios registrados (más confiable que grep/sed)
        if command -v python3 &> /dev/null; then
            local users_json=$(python3 -c "import json; print(','.join(json.load(open('$routing_file'))['usuarios_registrados']))" 2>/dev/null)
            IFS=',' read -ra registered_users <<< "$users_json"
        else
            # Fallback si no hay Python
            registered_users=($(grep -o '"[^"]*"' "$routing_file" | grep -v "version\|telegram\|default\|wake_words\|rechazar\|priorizar" | tr -d '"' | sort -u))
        fi
    else
        log_error "Archivo routing.json no encontrado"
        return 1
    fi

    # Verificar que existan directorios para cada usuario
    local error_count=0
    for user in "${registered_users[@]}"; do
        if [ ! -d "$users_dir/$user" ]; then
            log_error "Directorio para usuario '$user' no encontrado"
            error_count=$((error_count + 1))
        else
            # Verificar estructura interna
            local subdirs=("config" "agents" "tasks" "data" "logs" "sandbox" "vector_index" "base_agent")
            local missing_subdirs=0

            for subdir in "${subdirs[@]}"; do
                if [ ! -d "$users_dir/$user/$subdir" ]; then
                    missing_subdirs=$((missing_subdirs + 1))
                fi
            done

            if [ $missing_subdirs -gt 0 ]; then
                log_warning "Usuario '$user': $missing_subdirs subdirectorios faltantes"
            else
                echo "  ✓ Usuario $user"
            fi
        fi
    done

    # Verificar permisos
    for user_dir in "$users_dir"/*; do
        if [ -d "$user_dir" ]; then
            local perms=$(stat -c "%a" "$user_dir")
            if [ "$perms" != "750" ]; then
                log_warning "Directorio $user_dir tiene permisos incorrectos: $perms (debería ser 750)"
            fi
        fi
    done

    # Retornar resultado
    if [ $error_count -eq 0 ]; then
        log_info "Perfiles de usuario configurados correctamente"
        return 0
    else
        log_error "Problemas en perfiles de usuario: $error_count errores encontrados"
        return 1
    fi
}

# Verificar servicios
check_services() {
    log_step "Verificando estado de servicios..."
    local error_count=0

    # Servicios principales
    local services=("pascual-maestro" "pascual-sentinel" "ollama")

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
| Sentinel | $(systemctl is-active pascual-sentinel.service 2>/dev/null || echo "No instalado") | ${PASCUAL_VERSION:-1.0.0} |
| Ollama | $(systemctl is-active ollama.service 2>/dev/null || echo "No instalado") | $(ollama --version 2>/dev/null || echo "Desconocido") |
| Python | Instalado | $(python3 --version 2>/dev/null || echo "Desconocido") |
| Node.js | $(command -v node &> /dev/null && echo "Instalado" || echo "No instalado") | $(node --version 2>/dev/null || echo "Desconocido") |

## 🤖 Modelos de IA

$(ollama list 2>/dev/null || echo "No se pudieron listar los modelos")

## 👤 Usuarios Configurados

$(if [ -f "$PASCUAL_CONFIG/routing.json" ]; then python3 -c "import json; print('\n'.join(['- ' + u for u in json.load(open('$PASCUAL_CONFIG/routing.json'))['usuarios_registrados']]))" 2>/dev/null || echo "Error al parsear usuarios"; else echo "Archivo de routing no encontrado"; fi)

## 🧪 Resultados de Validación

- **Estructura de Directorios**: $(check_directory_structure > /dev/null 2>&1 && echo "✅ Completa" || echo "❌ Incompleta")
- **Perfiles de Usuario**: $(check_users > /dev/null 2>&1 && echo "✅ Correctos" || echo "❌ Problemas encontrados")
- **Servicios**: $(check_services > /dev/null 2>&1 && echo "✅ Activos" || echo "❌ Problemas encontrados")
- **Modelos de IA**: $(check_models > /dev/null 2>&1 && echo "✅ Instalados" || echo "❌ Incompletos")
- **Herramientas de Voz**: $(check_voice_tools > /dev/null 2>&1 && echo "✅ Instaladas" || echo "❌ Incompletas")

## 📝 Próximos Pasos

1. **Verificar Servicios**:
   \`\`\`
   systemctl status pascual-maestro.service
   systemctl status pascual-sentinel.service
   \`\`\`

2. **Probar Reconocimiento de Voz**:
   \`\`\`
   python3 ~/.pascual/master/test-voice.py
   \`\`\`

3. **Acceder al Dashboard**:
   \`\`\`
   cd ~/.pascual/dashboard && npm run dev
   # Acceder a http://localhost:${DASHBOARD_PORT:-38472}
   \`\`\`

4. **Configurar API Keys**:
   - Editar \`~/.pascual/config/.env\` para configurar tokens de API

## 🔗 Enlaces Útiles

- **Documentación de Comandos de Voz**: \`~/.pascual/docs/comandos_voz.md\`
- **Log de Instalación**: \`$PASCUAL_LOG\`
- **Archivos de Configuración**: \`$PASCUAL_CONFIG/\`
EOF

    log_info "Reporte de instalación generado en $report_file"
    return 0
}

# Verificar todos los componentes y generar reporte final
verify_installation() {
    log_step "Verificando instalación completa..."
    local errors=0

    # Comprobar cada componente
    check_directory_structure
    errors=$((errors + $?))

    check_users
    errors=$((errors + $?))

    check_services
    errors=$((errors + $?))

    check_models
    errors=$((errors + $?))

    check_voice_tools
    errors=$((errors + $?))

    # Generar reporte final
    generate_report

    # Resumen
    echo ""
    if [ $errors -eq 0 ]; then
        log_info "🎉 ¡Felicidades! Pascual-Bot se ha instalado correctamente"
    else
        log_warning "⚠️ Instalación completada con $errors problemas"
        log_info "👉 Consulta el reporte para más detalles: $PASCUAL_DIR/installation_report.md"
    fi

    return $errors
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "                  PASCUAL-BOT: VALIDACIÓN FINAL                            "
echo "============================================================================"
echo ""

# Verificar que las fases anteriores se hayan completado
if [ ! -d "$PASCUAL_DIR" ] || [ ! -f "$PASCUAL_CONFIG/.env" ]; then
    log_error "No se encontró una instalación de Pascual-Bot"
    log_info "Debes ejecutar primero los scripts de instalación en orden"
    exit 1
fi

# Ejecutar validación completa
verify_installation
exit_code=$?

# Registrar fase completada
if [ $exit_code -eq 0 ]; then
    echo "FASE_13_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"
fi

echo ""
log_info "📝 Reporte de instalación disponible en: $PASCUAL_DIR/installation_report.md"
log_info "📚 Documentación de comandos de voz: $PASCUAL_DIR/docs/comandos_voz.md"
log_info "🌐 Repositorio del proyecto: https://github.com/usuario/pascual-bot"

# Instrucciones finales
echo ""
echo -e "${BLUE}============================================================================${NC}"
echo -e "${GREEN}¡Gracias por instalar Pascual-Bot!${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""
echo "Para comenzar a usar tu asistente de IA personal:"
echo ""
echo "1. Prueba los comandos de voz: ${GREEN}python3 ~/.pascual/master/test-voice.py${NC}"
echo "2. Accede al dashboard web: ${GREEN}cd ~/.pascual/dashboard && npm run dev${NC}"
echo "3. Configura integraciones opcionales editando: ${GREEN}~/.pascual/config/.env${NC}"
echo ""
echo -e "${YELLOW}¡Disfruta tu asistente de IA completamente local y privado!${NC}"
echo ""

exit $exit_code