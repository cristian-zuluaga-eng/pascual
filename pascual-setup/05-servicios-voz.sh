#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 5: Servicios de Voz (Experiencia Tipo Alexa)
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instala STT (faster-whisper), TTS (Piper) y wake word (Picovoice)
# Dependencias: Modelos IA (04-modelos-ia.sh)
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
PIPER_DIR="$HOME/piper"

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
        log_info "Debes ejecutar primero: ./04-modelos-ia.sh"
        exit 1
    fi

    # Verificar que la fase 4 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_4_COMPLETED" != "true" ]; then
        log_error "La fase 4 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./04-modelos-ia.sh"
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
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-5.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# Verificar dispositivos de audio
check_audio_devices() {
    log_step "Verificando dispositivos de audio..."

    # Verificar dispositivos de captura
    log_info "Dispositivos de captura de audio detectados:"
    arecord -l

    # Verificar dispositivos de reproducción
    log_info "Dispositivos de reproducción de audio detectados:"
    aplay -l

    # Verificar si hay dispositivos
    if ! arecord -l | grep -q "card"; then
        log_warning "No se detectaron dispositivos de captura de audio"
        log_info "El sistema de reconocimiento de voz no funcionará"
    fi

    if ! aplay -l | grep -q "card"; then
        log_warning "No se detectaron dispositivos de reproducción de audio"
        log_info "El sistema de síntesis de voz no funcionará"
    fi

    return 0
}

# Instalar faster-whisper para reconocimiento de voz
install_faster_whisper() {
    log_step "Instalando faster-whisper (reconocimiento de voz)..."

    # Verificar si ya está instalado
    if python3 -c "import faster_whisper" &>/dev/null; then
        log_info "faster-whisper ya está instalado ✓"
    else
        # Crear un entorno virtual para instalaciones de Python
        if [ ! -d "$PASCUAL_DIR/venv" ]; then
            log_info "Creando entorno virtual Python..."
            python3 -m venv "$PASCUAL_DIR/venv"
        fi

        # Activar entorno virtual
        source "$PASCUAL_DIR/venv/bin/activate"

        # Actualizar pip en el entorno virtual
        pip install --upgrade pip

        # Instalar faster-whisper
        log_info "Instalando faster-whisper..."
        pip install faster-whisper

        # Verificar instalación
        if python -c "import faster_whisper" &>/dev/null; then
            log_info "faster-whisper instalado correctamente ✓"

            # Probar descarga de modelo (pequeño)
            log_info "Descargando modelo base small para faster-whisper..."
            python -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu')"
            log_info "Modelo small de faster-whisper descargado ✓"
        else
            log_error "Error al instalar faster-whisper"
        fi
    fi
}

# Instalar Piper TTS para síntesis de voz
install_piper_tts() {
    log_step "Instalando Piper TTS (síntesis de voz)..."

    # Verificar si ya está instalado
    if [ -f "$PIPER_DIR/bin/piper" ]; then
        log_info "Piper TTS ya está instalado ✓"
    else
        # Crear directorios necesarios
        mkdir -p "$PIPER_DIR"/{bin,voices}

        # Descargar piper
        log_info "Descargando Piper TTS..."
        wget -q -P "/tmp" https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_linux_x86_64.tar.gz

        # Extraer archivos
        tar -xzf "/tmp/piper_linux_x86_64.tar.gz" -C "/tmp"
        mv /tmp/piper "$PIPER_DIR/bin/"
        chmod +x "$PIPER_DIR/bin/piper"

        # Limpiar
        rm -f "/tmp/piper_linux_x86_64.tar.gz"

        # Verificar instalación
        if [ -f "$PIPER_DIR/bin/piper" ]; then
            log_info "Piper TTS instalado correctamente ✓"
        else
            log_error "Error al instalar Piper TTS"
            return 1
        fi
    fi

    # Descargar voces en español
    log_step "Descargando voces en español para Piper TTS..."

    # Voz masculina de España
    if [ ! -f "$PIPER_DIR/voices/es_ES-davefx-medium.onnx" ]; then
        log_info "Descargando voz masculina (es_ES-davefx)..."
        wget -q -P "$PIPER_DIR/voices" https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.onnx
        wget -q -P "$PIPER_DIR/voices" https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.onnx.json

        if [ -f "$PIPER_DIR/voices/es_ES-davefx-medium.onnx" ]; then
            log_info "Voz masculina española descargada correctamente ✓"
        else
            log_warning "Error al descargar voz masculina española"
        fi
    else
        log_info "Voz masculina española ya está descargada ✓"
    fi

    # Voz femenina de México
    if [ ! -f "$PIPER_DIR/voices/es_MX-ald-medium.onnx" ]; then
        log_info "Descargando voz femenina (es_MX-ald)..."
        wget -q -P "$PIPER_DIR/voices" https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/es_MX-ald-medium.onnx
        wget -q -P "$PIPER_DIR/voices" https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/es_MX-ald-medium.onnx.json

        if [ -f "$PIPER_DIR/voices/es_MX-ald-medium.onnx" ]; then
            log_info "Voz femenina mexicana descargada correctamente ✓"
        else
            log_warning "Error al descargar voz femenina mexicana"
        fi
    else
        log_info "Voz femenina mexicana ya está descargada ✓"
    fi

    # Agregar enlaces simbólicos a Pascual
    mkdir -p "$PASCUAL_DIR/shared/voices"
    ln -sf "$PIPER_DIR/voices"/* "$PASCUAL_DIR/shared/voices/" 2>/dev/null || true

    # Guardar ruta de Piper en .env
    sed -i "s#PIPER_DIR=.*#PIPER_DIR=$PIPER_DIR#" "$PASCUAL_CONFIG/.env" 2>/dev/null || echo "PIPER_DIR=$PIPER_DIR" >> "$PASCUAL_CONFIG/.env"

    return 0
}

# Instalar PyAudio para captura de micrófono
install_pyaudio() {
    log_step "Instalando PyAudio (captura de micrófono)..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Verificar si ya está instalado
    if python -c "import pyaudio" &>/dev/null; then
        log_info "PyAudio ya está instalado ✓"
    else
        # Instalar dependencia de sistema
        log_info "Instalando dependencias de sistema para PyAudio..."
        sudo apt install -y portaudio19-dev

        # Instalar PyAudio
        log_info "Instalando PyAudio..."
        pip install pyaudio

        # Verificar instalación
        if python -c "import pyaudio" &>/dev/null; then
            log_info "PyAudio instalado correctamente ✓"
        else
            log_error "Error al instalar PyAudio"
            return 1
        fi
    fi

    return 0
}

# Instalar Picovoice Porcupine para detección de wake word
install_porcupine() {
    log_step "Instalando Picovoice Porcupine (wake word)..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Verificar si ya está instalado
    if python -c "import pvporcupine" &>/dev/null; then
        log_info "Picovoice Porcupine ya está instalado ✓"
    else
        # Instalar Porcupine
        log_info "Instalando Picovoice Porcupine..."
        pip install pvporcupine

        # Verificar instalación
        if python -c "import pvporcupine" &>/dev/null; then
            log_info "Picovoice Porcupine instalado correctamente ✓"
        else
            log_error "Error al instalar Picovoice Porcupine"
            return 1
        fi
    fi

    # Preguntar por Access Key (requerida para usar Porcupine)
    log_warning "⚠️  Se requiere una Access Key de Picovoice para utilizar la wake word"
    log_info "Obtén una clave gratuita en: https://console.picovoice.ai/"
    echo ""
    read -p "Ingresa tu Picovoice Access Key (dejar vacío para configurar después): " picovoice_key

    if [ -n "$picovoice_key" ]; then
        # Guardar en .env
        sed -i "s/PICOVOICE_ACCESS_KEY=.*/PICOVOICE_ACCESS_KEY=\"$picovoice_key\"/" "$PASCUAL_CONFIG/.env" 2>/dev/null || echo "PICOVOICE_ACCESS_KEY=\"$picovoice_key\"" >> "$PASCUAL_CONFIG/.env"
        log_info "Access Key de Picovoice guardada en $PASCUAL_CONFIG/.env"
    else
        log_warning "No se proporcionó Access Key. Configúrala más tarde en $PASCUAL_CONFIG/.env"
    fi

    return 0
}

# Instalar WebRTC VAD para detección de silencio
install_webrtcvad() {
    log_step "Instalando WebRTC VAD (detección de silencio)..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Verificar si ya está instalado
    if python -c "import webrtcvad" &>/dev/null; then
        log_info "WebRTC VAD ya está instalado ✓"
    else
        # Instalar WebRTC VAD
        log_info "Instalando WebRTC VAD..."
        pip install webrtcvad

        # Verificar instalación
        if python -c "import webrtcvad" &>/dev/null; then
            log_info "WebRTC VAD instalado correctamente ✓"
        else
            log_error "Error al instalar WebRTC VAD"
            return 1
        fi
    fi

    return 0
}

# Configurar dispositivo de audio
configure_audio_device() {
    log_step "Configurando dispositivo de audio..."

    # Verificar si hay un dispositivo USB (posiblemente eMeet M0)
    log_info "Buscando dispositivo de audio USB (eMeet M0)..."

    # Buscar dispositivos en arecord
    audio_cards=$(arecord -l | grep 'card [0-9]' || echo "No se encontraron dispositivos")
    echo "$audio_cards"

    # Buscar tarjeta específicamente USB
    usb_card=$(arecord -l | grep -i "USB" | head -n1)

    if [ -n "$usb_card" ]; then
        # Intentar extraer número de tarjeta de la salida
        card_num=$(echo "$usb_card" | sed -E 's/card ([0-9]+).*/\1/')

        if [ -n "$card_num" ]; then
            log_info "Dispositivo USB detectado como card $card_num"

            # Crear archivo .asoundrc
            cat > "$HOME/.asoundrc" << EOF
pcm.!default {
    type hw
    card $card_num
    device 0
}
ctl.!default {
    type hw
    card $card_num
}
EOF
            log_info "Archivo .asoundrc configurado para usar card $card_num"
        else
            log_warning "No se pudo determinar número de tarjeta automáticamente"

            # Crear archivo .asoundrc con configuración manual
            cat > "$HOME/.asoundrc" << EOF
# Configuración manual - editar según sea necesario
pcm.!default {
    type hw
    card 1  # Cambiar a número correcto (usar 'arecord -l')
    device 0
}
ctl.!default {
    type hw
    card 1  # Cambiar a número correcto (usar 'arecord -l')
}
EOF
            log_warning "Archivo .asoundrc creado con configuración predeterminada"
            log_warning "Editar ~/.asoundrc manualmente si es necesario (verificar con: arecord -l)"
        fi
    else
        log_warning "No se detectó dispositivo de audio USB"
        log_info "Usando dispositivo de audio predeterminado"

        # Crear archivo .asoundrc básico
        cat > "$HOME/.asoundrc" << EOF
# Configuración predeterminada - editar según sea necesario
pcm.!default {
    type hw
    card 0  # Cambiar a número correcto (usar 'arecord -l')
    device 0
}
ctl.!default {
    type hw
    card 0  # Cambiar a número correcto (usar 'arecord -l')
}
EOF
        log_warning "Editar ~/.asoundrc manualmente para configurar el dispositivo de audio"
    fi

    return 0
}

# Crear script de prueba de voz
create_test_voice_script() {
    log_step "Creando script de prueba de voz..."

    # Directorio para scripts de prueba
    mkdir -p "$PASCUAL_DIR/master"

    # Crear script de prueba
    cat > "$PASCUAL_DIR/master/test-voice.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Script de prueba de servicios de voz
Permite probar micrófono, TTS y wake word
"""
import os
import sys
import time
import wave
import json
import argparse
import tempfile
import subprocess
from pathlib import Path

# Directorio base de Pascual
PASCUAL_DIR = os.path.expanduser("~/.pascual")

def load_env():
    """Cargar variables de entorno desde .env"""
    env_file = os.path.join(PASCUAL_DIR, "config", ".env")
    env_vars = {}

    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    # Limpiar comillas
                    env_vars[key] = value.strip('"\'')

    return env_vars

def test_microphone():
    """Prueba de grabación de micrófono"""
    print("\n=== PRUEBA DE MICRÓFONO ===")
    print("Grabando 5 segundos de audio... Habla algo")

    # Crear archivo temporal para la grabación
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
        temp_filename = temp_file.name

    # Usar arecord para grabar
    cmd = [
        "arecord",
        "-d", "5",  # duración 5 segundos
        "-f", "S16_LE",
        "-c", "1",
        "-r", "16000",
        temp_filename
    ]

    try:
        subprocess.run(cmd, check=True)
        print(f"✅ Audio grabado correctamente en: {temp_filename}")

        # Reproducir el audio grabado
        print("\nReproduciendo audio grabado...")
        subprocess.run(["aplay", temp_filename], check=True)

        return True, temp_filename
    except subprocess.CalledProcessError:
        print("❌ Error al grabar audio. Verifica tu micrófono.")
        return False, None

def test_tts(env_vars):
    """Prueba de síntesis de voz (TTS)"""
    print("\n=== PRUEBA DE SÍNTESIS DE VOZ ===")

    # Verificar Piper
    piper_dir = env_vars.get('PIPER_DIR', os.path.expanduser("~/piper"))
    piper_bin = os.path.join(piper_dir, "bin", "piper")

    if not os.path.exists(piper_bin):
        print(f"❌ No se encontró Piper en {piper_bin}")
        return False

    # Buscar voces disponibles
    voices_dir = os.path.join(piper_dir, "voices")
    voices = [f for f in os.listdir(voices_dir) if f.endswith('.onnx')]

    if not voices:
        print(f"❌ No se encontraron voces en {voices_dir}")
        return False

    # Usar la primera voz en español
    voice = next((v for v in voices if v.startswith('es')), voices[0])
    voice_path = os.path.join(voices_dir, voice)

    print(f"Usando voz: {voice}")

    # Crear archivo temporal para salida de audio
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
        temp_filename = temp_file.name

    # Texto para sintetizar
    text = "Hola, soy Pascual Bot, tu asistente de voz en español. Sistema de prueba funcionando correctamente."

    # Ejecutar Piper TTS
    try:
        cmd = [
            piper_bin,
            "--model", voice_path,
            "--output_file", temp_filename
        ]

        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, text=True)
        proc.communicate(text)
        proc.wait()

        # Verificar archivo creado
        if os.path.exists(temp_filename) and os.path.getsize(temp_filename) > 0:
            print(f"✅ TTS generado correctamente: {temp_filename}")

            # Reproducir audio sintetizado
            print("Reproduciendo audio sintetizado...")
            subprocess.run(["aplay", temp_filename], check=True)
            return True
        else:
            print("❌ Error: archivo TTS vacío o no generado")
            return False

    except Exception as e:
        print(f"❌ Error al ejecutar Piper: {e}")
        return False

def test_whisper(env_vars, audio_file):
    """Prueba de reconocimiento de voz con faster-whisper"""
    print("\n=== PRUEBA DE RECONOCIMIENTO DE VOZ ===")

    # Verificar si tenemos un archivo de audio para transcribir
    if not audio_file or not os.path.exists(audio_file):
        print("❌ No hay archivo de audio para transcribir")
        return False

    # Ejecutar script que carga faster-whisper y transcribe
    try:
        venv_python = os.path.join(PASCUAL_DIR, "venv", "bin", "python")

        # Crear script temporal para ejecutar la transcripción
        with tempfile.NamedTemporaryFile(suffix='.py', delete=False) as script_file:
            script_path = script_file.name
            script_file.write(b"""
import sys
from faster_whisper import WhisperModel

# Cargar modelo small
model = WhisperModel('small', device='cpu')

# Transcribir audio
result, _ = model.transcribe(sys.argv[1], language='es')

# Imprimir resultado
full_text = " ".join([segment.text for segment in result])
print(full_text)
            """)

        # Ejecutar script
        print("Transcribiendo audio con faster-whisper (modelo 'small')...")
        result = subprocess.run(
            [venv_python, script_path, audio_file],
            capture_output=True,
            text=True,
            check=True
        )

        # Mostrar transcripción
        print("\nTranscripción detectada:")
        print(f"🗣️  \"{result.stdout.strip()}\"")

        # Limpiar
        os.unlink(script_path)

        return True

    except Exception as e:
        print(f"❌ Error al ejecutar faster-whisper: {e}")
        return False

def main():
    """Prueba completa de servicios de voz"""
    print("==================================================")
    print("       PASCUAL-BOT: PRUEBA DE SERVICIOS DE VOZ    ")
    print("==================================================")

    # Cargar variables de entorno
    env_vars = load_env()

    # Pruebas
    micro_ok, audio_file = test_microphone()
    tts_ok = test_tts(env_vars)
    whisper_ok = False

    if micro_ok and audio_file:
        whisper_ok = test_whisper(env_vars, audio_file)
        # Limpiar archivo temporal
        try:
            os.unlink(audio_file)
        except:
            pass

    # Resumen
    print("\n=== RESUMEN DE PRUEBAS ===")
    print(f"Micrófono: {'✅ OK' if micro_ok else '❌ ERROR'}")
    print(f"Síntesis de voz: {'✅ OK' if tts_ok else '❌ ERROR'}")
    print(f"Reconocimiento de voz: {'✅ OK' if whisper_ok else '❌ ERROR'}")

    # Estado general
    if micro_ok and tts_ok and whisper_ok:
        print("\n✅ Todos los servicios de voz funcionan correctamente")
    else:
        print("\n⚠️  Algunos servicios de voz tienen problemas")

    print("\nPara obtener ayuda adicional, consulta la documentación.")

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutable
    chmod +x "$PASCUAL_DIR/master/test-voice.py"
    log_info "Script de prueba creado en $PASCUAL_DIR/master/test-voice.py"

    return 0
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "                 PASCUAL-BOT: INSTALACIÓN SERVICIOS DE VOZ                  "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env
check_sudo

# Verificar dispositivos de audio
check_audio_devices

# Instalar componentes de voz
install_faster_whisper
install_piper_tts
install_pyaudio
install_porcupine
install_webrtcvad

# Configurar dispositivo de audio
configure_audio_device

# Crear script de prueba
create_test_voice_script

# Registrar fase completada
echo "FASE_5_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Servicios de voz instalados correctamente"
log_info "Para probar los servicios de voz, ejecuta:"
echo -e "${GREEN}   python3 $PASCUAL_DIR/master/test-voice.py${NC}"
echo ""
log_info "➡️  Siguiente paso: ejecutar ./06-memoria-vectorial.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0