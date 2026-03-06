#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 7: Pascual-Maestro (Orquestador Central)
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instala y configura el servicio principal que enruta solicitudes por usuario
# Dependencias: Memoria vectorial (06-memoria-vectorial.sh)
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
MASTER_DIR="$PASCUAL_DIR/master"

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
        log_info "Debes ejecutar primero: ./06-memoria-vectorial.sh"
        exit 1
    fi

    # Verificar que la fase 6 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_6_COMPLETED" != "true" ]; then
        log_error "La fase 6 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./06-memoria-vectorial.sh"
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
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-7.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# Instalar dependencias de Pascual-Maestro
install_master_dependencies() {
    log_step "Instalando dependencias del Pascual-Maestro..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Lista de dependencias específicas
    log_info "Instalando paquetes Python necesarios..."
    pip install \
        requests \
        websockets \
        python-telegram-bot \
        pydantic \
        fastapi \
        uvicorn \
        python-dotenv \
        schedule \
        httpx

    log_info "Dependencias del maestro instaladas correctamente ✓"
    return 0
}

# Crear directorio y archivos del maestro
create_master_files() {
    log_step "Creando archivos del Pascual-Maestro..."

    # Crear directorio si no existe
    mkdir -p "$MASTER_DIR"

    # Crear archivo principal del maestro
    cat > "$MASTER_DIR/pascual.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Maestro: Orquestador central multi-usuario
Servicio principal que enruta solicitudes a los agentes base de cada usuario
"""
import os
import sys
import json
import time
import signal
import logging
import argparse
from pathlib import Path
from datetime import datetime
import importlib.util
from typing import Dict, Any, Optional, List, Tuple

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.expanduser("~/.pascual/shared/logs/maestro.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("Pascual-Maestro")

# Directorio base de Pascual
PASCUAL_DIR = Path.home() / ".pascual"
CONFIG_DIR = PASCUAL_DIR / "config"
USERS_DIR = PASCUAL_DIR / "users"


class PascualMaestro:
    """Orquestador central que enruta solicitudes a agentes de usuario"""

    def __init__(self):
        """Inicializar orquestador central"""
        self.routing = self._load_routing()
        self.telegram_handlers = {}
        self.voice_handlers = {}
        self.running = True
        logger.info(f"Pascual-Maestro inicializado con {len(self.routing.get('usuarios_registrados', []))} usuarios")

    def _load_routing(self) -> Dict[str, Any]:
        """Cargar configuración de enrutamiento"""
        routing_path = CONFIG_DIR / "routing.json"
        try:
            with open(routing_path, "r") as f:
                routing = json.load(f)
            logger.info(f"Configuración de enrutamiento cargada: {len(routing.get('usuarios_registrados', []))} usuarios")
            return routing
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.error(f"Error al cargar configuración de enrutamiento: {e}")
            return {"usuarios_registrados": [], "mapeo_canales": {}}

    def identificar_usuario(self, canal: str, credencial: str) -> Optional[str]:
        """Identificar usuario por canal + credencial"""
        if canal == "telegram":
            # Mapeo de chat_id a nombre de usuario
            telegram_map = self.routing.get("mapeo_canales", {}).get("telegram", {})
            for chat_id, user in telegram_map.items():
                if chat_id == credencial:
                    return user
        elif canal == "voice_local":
            # Para voz local, verificar wake word o usar default
            wake_words = self.routing.get("mapeo_canales", {}).get("voice_local", {}).get("wake_words", {})
            if credencial in wake_words:
                return wake_words[credencial]
            else:
                return self.routing.get("mapeo_canales", {}).get("voice_local", {}).get("default")
        elif canal == "web":
            # Para web, la credencial debe ser un token JWT válido
            # Aquí iría la verificación del token
            return credencial  # Simplificado para esta versión

        return None

    def procesar_comando(self, usuario: str, texto: str, canal: str) -> str:
        """Procesar comando y enrutarlo al agente base del usuario"""
        if not usuario or usuario not in self.routing.get("usuarios_registrados", []):
            logger.warning(f"Usuario no reconocido: {usuario}")
            return "Usuario no reconocido. Acceso denegado."

        # Verificar que la carpeta del usuario exista
        user_dir = USERS_DIR / usuario
        if not user_dir.exists():
            logger.error(f"Directorio del usuario no encontrado: {user_dir}")
            return "Error: Configuración de usuario no encontrada"

        # Cargar configuración del usuario
        try:
            with open(user_dir / "config.json", "r") as f:
                config = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.error(f"Error al cargar configuración del usuario {usuario}: {e}")
            return f"Error al cargar configuración: {e}"

        # Registrar el comando en el historial
        self._registrar_comando(usuario, texto, canal)

        # TODO: Aquí iría la lógica de enrutamiento al agente base del usuario
        # Por ahora, retornar un mensaje placeholder
        logger.info(f"Comando de {usuario} ({canal}): {texto[:50]}{'...' if len(texto) > 50 else ''}")
        return f"Comando recibido de {usuario}: {texto}"

    def _registrar_comando(self, usuario: str, texto: str, canal: str) -> None:
        """Registrar comando en el historial del usuario"""
        history_dir = USERS_DIR / usuario / "data"
        history_file = history_dir / "history.txt"

        # Crear directorio si no existe
        history_dir.mkdir(exist_ok=True)

        # Añadir entrada al historial
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(history_file, "a") as f:
            f.write(f"{timestamp} [{canal}] {texto}\n")

    def iniciar_servicios(self):
        """Iniciar todos los servicios (Telegram, voz, API)"""
        logger.info("Iniciando servicios de Pascual-Maestro...")

        # Iniciar modo CLI simple para pruebas
        self._iniciar_cli()

    def _iniciar_cli(self):
        """Iniciar interfaz de línea de comandos simple para pruebas"""
        logger.info("Iniciando modo CLI (Ctrl+C para salir)")
        print("\n====== PASCUAL-BOT CLI MODE ======")
        print("Escribe comandos con formato: <usuario>:<texto>")
        print("Ejemplo: admin:¿Qué hora es?")
        print("Ctrl+C para salir")
        print("==================================\n")

        try:
            while self.running:
                try:
                    entrada = input("> ")
                    if not entrada:
                        continue

                    # Procesar comando
                    if ":" in entrada:
                        usuario, texto = entrada.split(":", 1)
                        respuesta = self.procesar_comando(usuario.strip(), texto.strip(), "cli")
                        print(f"[RESPUESTA] {respuesta}")
                    else:
                        print("Formato incorrecto. Usa <usuario>:<texto>")
                except EOFError:
                    break
        except KeyboardInterrupt:
            print("\nSaliendo del modo CLI...")
            self.running = False

    def detener_servicios(self):
        """Detener todos los servicios"""
        logger.info("Deteniendo servicios de Pascual-Maestro...")
        self.running = False

def signal_handler(sig, frame):
    """Manejador de señales para cierre elegante"""
    logger.info(f"Señal recibida ({sig}), deteniendo Pascual-Maestro...")
    maestro.detener_servicios()
    sys.exit(0)

if __name__ == "__main__":
    # Registrar manejadores de señales
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Parsear argumentos
    parser = argparse.ArgumentParser(description='Pascual-Maestro: Orquestador central multi-usuario')
    parser.add_argument('--debug', action='store_true', help='Activar modo debug')
    args = parser.parse_args()

    # Configurar nivel de logging
    if args.debug:
        logger.setLevel(logging.DEBUG)
        for handler in logger.handlers:
            handler.setLevel(logging.DEBUG)

    # Iniciar maestro
    logger.info("Iniciando Pascual-Maestro...")
    maestro = PascualMaestro()
    maestro.iniciar_servicios()
EOF

    # Crear script de configuración
    cat > "$MASTER_DIR/config.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Módulo de configuración y utilidades
"""
import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List

# Constantes
PASCUAL_DIR = Path.home() / ".pascual"
CONFIG_DIR = PASCUAL_DIR / "config"
USERS_DIR = PASCUAL_DIR / "users"
SHARED_DIR = PASCUAL_DIR / "shared"
LOGS_DIR = SHARED_DIR / "logs"

# Asegurar que existe el directorio de logs
LOGS_DIR.mkdir(parents=True, exist_ok=True)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / "pascual.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("Pascual-Config")

def load_env() -> Dict[str, str]:
    """Cargar variables de entorno desde .env"""
    env_vars = {}
    env_file = CONFIG_DIR / ".env"

    if env_file.exists():
        with open(env_file, "r") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    try:
                        key, value = line.split('=', 1)
                        env_vars[key] = value.strip('"\'')
                    except ValueError:
                        pass

    return env_vars

def load_routing() -> Dict[str, Any]:
    """Cargar configuración de enrutamiento"""
    routing_path = CONFIG_DIR / "routing.json"
    try:
        with open(routing_path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Error al cargar configuración de enrutamiento: {e}")
        return {"usuarios_registrados": [], "mapeo_canales": {}}

def load_user_config(user: str) -> Dict[str, Any]:
    """Cargar configuración de un usuario específico"""
    config_path = USERS_DIR / user / "config.json"
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Error al cargar configuración del usuario {user}: {e}")
        return {}

def save_user_config(user: str, config: Dict[str, Any]) -> bool:
    """Guardar configuración de un usuario específico"""
    config_path = USERS_DIR / user / "config.json"
    try:
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error al guardar configuración del usuario {user}: {e}")
        return False

def get_users() -> List[str]:
    """Obtener lista de usuarios registrados"""
    try:
        routing = load_routing()
        return routing.get("usuarios_registrados", [])
    except Exception as e:
        logger.error(f"Error al obtener lista de usuarios: {e}")
        return []

if __name__ == "__main__":
    # Pruebas básicas
    print("Configuración de Pascual-Bot:")
    print(f"- Directorio base: {PASCUAL_DIR}")
    env_vars = load_env()
    print(f"- Variables de entorno: {len(env_vars)} cargadas")
    users = get_users()
    print(f"- Usuarios registrados: {users}")
EOF

    # Hacer ejecutables
    chmod +x "$MASTER_DIR/pascual.py"
    chmod +x "$MASTER_DIR/config.py"

    log_info "Archivos del maestro creados en $MASTER_DIR"
    return 0
}

# Crear servicio systemd
create_systemd_service() {
    log_step "Creando servicio systemd para Pascual-Maestro..."

    # Verificar ruta al intérprete de Python del entorno virtual
    PYTHON_PATH="$PASCUAL_DIR/venv/bin/python3"
    if [ ! -f "$PYTHON_PATH" ]; then
        log_warning "No se encontró Python en el entorno virtual. Usando sistema."
        PYTHON_PATH=$(which python3)
    fi

    # Crear archivo de servicio systemd
    sudo tee /etc/systemd/system/pascual-maestro.service > /dev/null << EOF
[Unit]
Description=Pascual-Bot Maestro (Orquestador Central Multi-Usuario)
After=network.target ollama.service
Wants=ollama.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$MASTER_DIR
ExecStart=$PYTHON_PATH $MASTER_DIR/pascual.py
Restart=always
RestartSec=10
Environment="PYTHONPATH=$PASCUAL_DIR"
Environment="HSA_OVERRIDE_GFX_VERSION=11.0.0"
Environment="PASCUAL_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

    # Recargar systemd, habilitar y reiniciar servicio
    sudo systemctl daemon-reload
    sudo systemctl enable pascual-maestro.service
    sudo systemctl restart pascual-maestro.service

    # Verificar estado
    if sudo systemctl is-active pascual-maestro.service > /dev/null; then
        log_info "Servicio Pascual-Maestro iniciado y activo ✓"
    else
        log_warning "El servicio Pascual-Maestro no pudo iniciarse correctamente"
        sudo systemctl status pascual-maestro.service --no-pager
    fi

    log_info "Servicio systemd creado: pascual-maestro.service"
    return 0
}

# Crear archivos de configuración adicionales
create_config_files() {
    log_step "Creando archivos de configuración adicionales..."

    # Crear archivo de canales de comunicación
    cat > "$PASCUAL_CONFIG/canales.json" << EOF
{
  "canales_activos": {
    "telegram": {
      "activo": false,
      "config": "pendiente"
    },
    "voice_local": {
      "activo": true,
      "dispositivo": "default"
    },
    "web_dashboard": {
      "activo": false,
      "puerto": ${DASHBOARD_PORT:-38472}
    }
  },
  "prioridad_canales": [
    "voice_local",
    "telegram",
    "web_dashboard"
  ]
}
EOF

    # Crear plantilla de configuración Telegram Bot
    cat > "$PASCUAL_CONFIG/telegram_config.json" << EOF
{
  "activo": false,
  "token": "",
  "admins": [],
  "comandos": [
    {"comando": "start", "descripcion": "Iniciar conversación con Pascual-Bot"},
    {"comando": "ayuda", "descripcion": "Mostrar comandos disponibles"},
    {"comando": "status", "descripcion": "Verificar estado del sistema"}
  ],
  "mensajes": {
    "bienvenida": "¡Hola! Soy Pascual-Bot, tu asistente personal.",
    "error": "Lo siento, ha ocurrido un error.",
    "no_autorizado": "No tienes permiso para usar este bot."
  }
}
EOF

    log_info "Archivos de configuración adicionales creados correctamente ✓"
    return 0
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "             PASCUAL-BOT: INSTALACIÓN DE PASCUAL-MAESTRO                    "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env
check_sudo

# Instalar dependencias
install_master_dependencies

# Crear archivos del maestro
create_master_files

# Crear servicio systemd
create_systemd_service

# Crear archivos de configuración
create_config_files

# Registrar fase completada
echo "FASE_7_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Pascual-Maestro instalado y configurado correctamente"
log_info "Para verificar el estado del servicio, ejecuta:"
echo -e "${GREEN}   systemctl status pascual-maestro.service${NC}"
echo ""
log_info "➡️  Siguiente paso: ejecutar ./08-agentes-base-usuario.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0