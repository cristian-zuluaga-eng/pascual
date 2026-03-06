#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local
# ============================================================================
# FASE 7: Agente Base
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instala y configura el agente base que maneja las solicitudes
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
AGENT_DIR="$PASCUAL_DIR/core/base_agent"

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

# Instalar dependencias
install_dependencies() {
    log_step "Instalando dependencias del Agente Base..."

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

    log_info "Dependencias instaladas correctamente ✓"
    return 0
}

# Crear directorio y archivos del maestro
create_master_files() {
    log_step "Creando archivos del maestro..."

    # Crear directorio si no existe
    mkdir -p "$MASTER_DIR"

    # Crear archivo principal del maestro
    cat > "$MASTER_DIR/pascual.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Maestro: Orquestador central
Servicio principal que gestiona solicitudes y canales de comunicación
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
CORE_DIR = PASCUAL_DIR / "core"

class PascualMaestro:
    """Orquestador central que gestiona solicitudes"""

    def __init__(self):
        """Inicializar orquestador central"""
        self.canales = self._load_canales()
        self.telegram_handlers = {}
        self.voice_handlers = {}
        self.running = True
        logger.info(f"Pascual-Maestro inicializado")

    def _load_canales(self) -> Dict[str, Any]:
        """Cargar configuración de canales"""
        canales_path = CONFIG_DIR / "canales.json"
        try:
            with open(canales_path, "r") as f:
                canales = json.load(f)
            logger.info(f"Configuración de canales cargada")
            return canales
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.error(f"Error al cargar configuración de canales: {e}")
            return {"canales_activos": {}, "prioridad_canales": []}

    def procesar_comando(self, texto: str, canal: str) -> str:
        """Procesar comando recibido desde cualquier canal"""
        # Registrar el comando en el historial
        self._registrar_comando(texto, canal)

        # TODO: Aquí iría la lógica de procesamiento que llamaría al agente base
        # Por ahora, retornar un mensaje placeholder
        logger.info(f"Comando recibido ({canal}): {texto[:50]}{'...' if len(texto) > 50 else ''}")
        return f"Comando recibido: {texto}"

    def _registrar_comando(self, texto: str, canal: str) -> None:
        """Registrar comando en el historial"""
        history_dir = CORE_DIR / "data"
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
        print("Escribe comandos para interactuar con Pascual")
        print("Ctrl+C para salir")
        print("==================================\n")

        try:
            while self.running:
                try:
                    entrada = input("> ")
                    if not entrada:
                        continue

                    # Procesar comando
                    respuesta = self.procesar_comando(entrada.strip(), "cli")
                    print(f"[RESPUESTA] {respuesta}")
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
    parser = argparse.ArgumentParser(description='Pascual-Maestro: Orquestador central')
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
CORE_DIR = PASCUAL_DIR / "core"
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

def load_core_config() -> Dict[str, Any]:
    """Cargar configuración central"""
    config_path = CORE_DIR / "config.json"
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Error al cargar configuración: {e}")
        return {}

def save_core_config(config: Dict[str, Any]) -> bool:
    """Guardar configuración central"""
    config_path = CORE_DIR / "config.json"
    try:
        with open(config_path, "w") as f:
            json.dump(config, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error al guardar configuración: {e}")
        return False

if __name__ == "__main__":
    # Pruebas básicas
    print("Configuración de Pascual-Bot:")
    print(f"- Directorio base: {PASCUAL_DIR}")
    env_vars = load_env()
    print(f"- Variables de entorno: {len(env_vars)} cargadas")
    config = load_core_config()
    print(f"- Configuración cargada: {len(config)} elementos")
EOF

    # Hacer ejecutables
    chmod +x "$MASTER_DIR/pascual.py"
    chmod +x "$MASTER_DIR/config.py"

    log_info "Archivos del maestro creados en $MASTER_DIR"
    return 0
}

# Crear agente base
create_base_agent() {
    log_step "Creando agente base para Pascual"

    # Crear directorio si no existe
    mkdir -p "$AGENT_DIR"

    # Crear configuración del agente base
    cat > "$AGENT_DIR/config.json" << EOF
{
  "agent_id": "pascual_base_agent",
  "version": "1.0",
  "routing_rules": {
    "llm_direct_triggers": ["¿qué", "¿cuándo", "¿quién", "¿dónde", "¿cómo", "resume", "traduce", "explica"],
    "base_agent_triggers": ["mi", "mis", "yo", "me", "agenda", "tarea", "añade", "recuérdame"],
    "specialist_handoff": {
      "notion": ["notion", "base de datos", "página", "tabla"],
      "calendar": ["reunión", "evento", "calendario", "cita", "recordatorio"],
      "finance": ["gasto", "presupuesto", "inversión", "finanzas", "dinero"]
    }
  },
  "permissions": {
    "allowed_agents": [],
    "require_confirmation_for": ["notion_write", "calendar_write", "email_send"],
    "max_context_messages": 50
  },
  "memory": {
    "memory_enabled": true,
    "max_history_items": 500,
    "use_semantic_search": true,
    "use_local_db_only": true
  },
  "preferences": {
    "politeness_level": "medium",
    "verbosity": "balanced",
    "personality": "helpful"
  }
}
EOF

    # Crear script principal del agente
    cat > "$AGENT_DIR/agent.py" << 'EOF'
#!/usr/bin/env python3
"""
Agente Base: Gestiona contexto y decide enrutamiento

Este agente conoce el contexto e historial del usuario y decide:
1. Resolver directamente con LLM
2. Usar memoria para resolver con contexto
3. Delegar a agente especializado
"""
import os
import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple

# Directorio base de Pascual
PASCUAL_DIR = Path.home() / ".pascual"
CORE_DIR = PASCUAL_DIR / "core"
CONFIG_DIR = PASCUAL_DIR / "config"
LOGS_DIR = PASCUAL_DIR / "shared" / "logs"

# Configurar logging específico para este agente
def setup_logging():
    log_path = LOGS_DIR / "base_agent.log"
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_path),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger("BaseAgent")

class BaseAgent:
    """Agente base para Pascual"""

    def __init__(self):
        """Inicializar agente base"""
        self.logger = setup_logging()
        self.config = self._load_config()
        self.history = []
        self.logger.info("Agente base inicializado")

    def _load_config(self) -> Dict[str, Any]:
        """Cargar configuración del agente base"""
        config_path = CORE_DIR / "base_agent" / "config.json"
        try:
            with open(config_path, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.logger.error(f"Error al cargar configuración: {e}")
            return {}

    def _load_core_config(self) -> Dict[str, Any]:
        """Cargar configuración principal"""
        config_path = CORE_DIR / "config.json"
        try:
            with open(config_path, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.logger.error(f"Error al cargar configuración principal: {e}")
            return {}

    def _should_use_direct_llm(self, texto: str) -> bool:
        """Determinar si debe usar LLM directamente"""
        # Verificar triggers de LLM directo
        llm_triggers = self.config.get("routing_rules", {}).get("llm_direct_triggers", [])
        for trigger in llm_triggers:
            if trigger in texto.lower():
                return True
        return False

    def _should_use_base_agent(self, texto: str) -> bool:
        """Determinar si debe usar agente base (lógica interna)"""
        # Verificar triggers del agente base
        base_triggers = self.config.get("routing_rules", {}).get("base_agent_triggers", [])
        for trigger in base_triggers:
            if trigger in texto.lower():
                return True
        return False

    def _detect_specialist_agent(self, texto: str) -> Optional[str]:
        """Detectar qué agente especializado usar"""
        # Verificar triggers de agentes especialistas
        specialist_handoff = self.config.get("routing_rules", {}).get("specialist_handoff", {})

        for agent_name, triggers in specialist_handoff.items():
            for trigger in triggers:
                if trigger in texto.lower():
                    return agent_name

        return None

    def procesar_comando(self, texto: str, contexto: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Decidir: LLM directo, resolver con contexto, o delegar a especialista

        Retorna un diccionario con:
        - accion: "llm_directo", "base_agent", "especialista", "error"
        - destino: Nombre del especialista si corresponde
        - respuesta: Texto de respuesta o error
        """
        self.logger.info(f"Procesando comando: {texto[:50]}{'...' if len(texto) > 50 else ''}")

        try:
            # Registrar en historial (esto sería más elaborado en producción)
            self._registrar_comando(texto, contexto)

            # Determinar flujo de acción
            if self._should_use_direct_llm(texto):
                # Usar LLM directo
                return {
                    "accion": "llm_directo",
                    "respuesta": self._respuesta_placeholder(texto, "llm")
                }

            elif self._should_use_base_agent(texto):
                # Procesar con agente base
                return {
                    "accion": "base_agent",
                    "respuesta": self._respuesta_placeholder(texto, "base")
                }

            else:
                # Intentar detectar especialista
                especialista = self._detect_specialist_agent(texto)
                if especialista:
                    return {
                        "accion": "especialista",
                        "destino": especialista,
                        "respuesta": self._respuesta_placeholder(texto, especialista)
                    }
                else:
                    # Por defecto usar LLM con contexto
                    return {
                        "accion": "llm_directo",
                        "respuesta": self._respuesta_placeholder(texto, "llm_contexto")
                    }

        except Exception as e:
            self.logger.error(f"Error al procesar comando: {e}")
            return {
                "accion": "error",
                "respuesta": f"Error al procesar comando: {e}"
            }

    def _registrar_comando(self, texto: str, contexto: Optional[Dict[str, Any]] = None) -> None:
        """Registrar comando en el historial"""
        # En una implementación real, esto iría a ChromaDB/LanceDB
        pass

    def _respuesta_placeholder(self, texto: str, modo: str) -> str:
        """Generar respuesta placeholder (para desarrollo)"""
        return f"[Modo: {modo}] Respuesta simulada para: '{texto[:30]}...'"

    def obtener_historial(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Obtener historial reciente"""
        # En una implementación real, esto vendría de ChromaDB/LanceDB
        return []

# Función principal para ejecutar comandos
def procesar_comando(texto: str, contexto: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Función de punto de entrada para procesar comandos"""
    agente = BaseAgent()
    return agente.procesar_comando(texto, contexto)

if __name__ == "__main__":
    # Código para pruebas
    if len(sys.argv) < 2:
        print("Uso: python agent.py <texto>")
        sys.exit(1)

    texto = sys.argv[1]
    resultado = procesar_comando(texto)
    print(json.dumps(resultado, indent=2))
EOF

    # Crear helpers para el agente
    cat > "$AGENT_DIR/memory.py" << 'EOF'
#!/usr/bin/env python3
"""
Módulo de Memoria para Agente Base
Gestiona acceso a la base de datos vectorial y búsqueda semántica
"""
import os
import json
from pathlib import Path
from typing import List, Dict, Any, Optional

class AgentMemory:
    """Gestiona la memoria del agente"""

    def __init__(self):
        """Inicializar memoria del agente"""
        self.pascual_dir = Path.home() / ".pascual"
        self.core_dir = self.pascual_dir / "core"
        self.vector_dir = self.core_dir / "vector_index"

    def guardar_interaccion(self, texto: str, respuesta: str, metadata: Dict[str, Any] = None) -> bool:
        """Guardar interacción en memoria vectorial"""
        # Este es un placeholder - en la implementación real usaría ChromaDB
        return True

    def buscar_relevante(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Buscar interacciones relevantes por similitud semántica"""
        # Este es un placeholder - en la implementación real haría búsqueda vectorial
        return []

    def get_recent_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Obtener historial reciente por tiempo"""
        # Este es un placeholder - en la implementación real buscaría en la base de datos
        return []
EOF

    # Hacer ejecutables
    chmod +x "$AGENT_DIR/agent.py"
    chmod +x "$AGENT_DIR/memory.py"

    log_info "Agente base creado correctamente ✓"
    return 0
}

# Registrar agente en configuración del maestro
register_base_agent() {
    log_step "Registrando agente base en configuración del maestro..."

    # Crear archivo de registro de agentes
    local agents_file="$MASTER_DIR/agents_registry.json"

    # Inicializar archivo de registro si no existe
    if [ ! -f "$agents_file" ]; then
        cat > "$agents_file" << EOF
{
  "base_agent": "",
  "specialist_agents": {}
}
EOF
    fi

    # Verificar que el agente base exista
    if [ -d "$AGENT_DIR" ]; then
        # Actualizar el registro JSON (usando archivos temporales por compatibilidad)
        temp_file=$(mktemp)
        jq --arg path "$AGENT_DIR/agent.py" \
           '.base_agent = $path' "$agents_file" > "$temp_file"
        mv "$temp_file" "$agents_file"

        log_info "Registrado agente base correctamente"
    else
        log_warning "No se pudo registrar agente - directorio no encontrado"
    fi

    log_info "Registro de agentes actualizado ✓"
    return 0
}

# Crear servicio systemd
create_systemd_service() {
    log_step "Creando servicio systemd para Pascual..."

    # Verificar ruta al intérprete de Python del entorno virtual
    PYTHON_PATH="$PASCUAL_DIR/venv/bin/python3"
    if [ ! -f "$PYTHON_PATH" ]; then
        log_warning "No se encontró Python en el entorno virtual. Usando sistema."
        PYTHON_PATH=$(which python3)
    fi

    # Crear archivo de servicio systemd
    sudo tee /etc/systemd/system/pascual-maestro.service > /dev/null << EOF
[Unit]
Description=Pascual-Bot Maestro (Orquestador Central)
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

# Crear script de prueba de agentes
create_test_agent_script() {
    log_step "Creando script de prueba de agente..."

    # Crear script en directorio utils
    mkdir -p "$PASCUAL_DIR/utils"

    cat > "$PASCUAL_DIR/utils/test_agent.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Utilidad para probar el agente base
"""
import os
import sys
import json
import argparse
from pathlib import Path

# Directorio base de Pascual
PASCUAL_DIR = Path.home() / ".pascual"

def test_agent_command(comando):
    """Probar comando en el agente base"""
    # Verificar que existe el agente base
    agent_script = PASCUAL_DIR / "core" / "base_agent" / "agent.py"
    if not agent_script.exists():
        print(f"Error: Agente base no encontrado")
        return False

    print(f"Probando agente base de Pascual")
    print(f"Comando: {comando}")
    print("-" * 60)

    # Importar y ejecutar el agente base
    try:
        # Cambiar al directorio del agente para importación relativa
        sys.path.append(str(agent_script.parent))
        os.chdir(str(agent_script.parent))

        # Importar dinámicamente
        import importlib.util
        spec = importlib.util.spec_from_file_location("agent", agent_script)
        agent = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(agent)

        # Ejecutar procesamiento
        resultado = agent.procesar_comando(comando)

        # Mostrar resultado
        print("\nResultado:")
        print(json.dumps(resultado, indent=2))
        return True

    except Exception as e:
        print(f"Error al ejecutar agente: {e}")
        return False

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Herramienta de prueba del agente base")
    parser.add_argument("--comando", "-c", help="Comando a probar en el agente")

    args = parser.parse_args()

    # Verificar parámetros
    if not args.comando:
        print("Falta el parámetro comando. Ejemplo de uso:")
        print("  python test_agent.py --comando \"¿Qué hora es?\"")
        return

    # Ejecutar prueba
    test_agent_command(args.comando)

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutable
    chmod +x "$PASCUAL_DIR/utils/test_agent.py"

    log_info "Script de prueba de agente creado en $PASCUAL_DIR/utils/test_agent.py"
    return 0
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "             PASCUAL-BOT: INSTALACIÓN DEL AGENTE BASE                     "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env
check_sudo

# Instalar dependencias
install_dependencies

# Crear archivos del maestro
create_master_files

# Crear agente base
create_base_agent

# Registrar agente base
register_base_agent

# Crear servicio systemd
create_systemd_service

# Crear script de prueba
create_test_agent_script

# Registrar fase completada
echo "FASE_7_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Agente base instalado y configurado correctamente"
log_info "Para verificar el estado del servicio, ejecuta:"
echo -e "${GREEN}   systemctl status pascual-maestro.service${NC}"
echo ""
log_info "Para probar el agente, ejecuta:"
echo -e "${GREEN}   python3 $PASCUAL_DIR/utils/test_agent.py --comando \"¿Qué hora es?\"${NC}"
echo ""
log_info "➡️  Siguiente paso: ejecutar ./08-dashboard-nextjs.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0