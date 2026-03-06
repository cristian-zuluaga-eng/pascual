#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 8: Agentes Base por Usuario
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Crea los agentes base para cada usuario y configura enrutamiento
# Dependencias: Pascual-Maestro (07-pascual-maestro.sh)
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

# Verificar que la fase anterior se haya ejecutado
check_previous_phase() {
    if [ ! -f "$PASCUAL_CONFIG/.env" ]; then
        log_error "No se encontró el archivo de configuración de Pascual-Bot"
        log_info "Debes ejecutar primero: ./07-pascual-maestro.sh"
        exit 1
    fi

    # Verificar que la fase 7 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_7_COMPLETED" != "true" ]; then
        log_error "La fase 7 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./07-pascual-maestro.sh"
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
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-8.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# Obtener lista de usuarios
get_users() {
    # Verificar si jq está instalado
    if command -v jq &> /dev/null; then
        # Usar jq para extraer usuarios de routing.json
        USERS_JSON=$(jq -r '.usuarios_registrados[]' "$PASCUAL_CONFIG/routing.json" 2>/dev/null)
        if [ -n "$USERS_JSON" ]; then
            echo "$USERS_JSON"
            return 0
        fi
    fi

    # Alternativa si jq no está disponible o falla
    # Buscar directorios de usuario
    for user_dir in "$PASCUAL_DIR/users"/*; do
        if [ -d "$user_dir" ]; then
            basename "$user_dir"
        fi
    done
}

# Crear agente base para un usuario
create_base_agent() {
    local usuario=$1
    log_step "Creando agente base para usuario: $usuario"

    # Directorio base del agente
    local agent_dir="$PASCUAL_DIR/users/$usuario/base_agent"
    mkdir -p "$agent_dir"

    # Crear configuración del agente base
    cat > "$agent_dir/config.json" << EOF
{
  "agent_id": "${usuario}_base_agent",
  "owner": "$usuario",
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
    cat > "$agent_dir/agent.py" << 'EOF'
#!/usr/bin/env python3
"""
Agente Base de Usuario: Gestiona contexto y decide enrutamiento

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

# Configurar logging específico para este agente
def setup_logging(usuario):
    log_path = Path.home() / ".pascual" / "users" / usuario / "logs" / "base_agent.log"
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_path),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(f"BaseAgent[{usuario}]")

class BaseAgent:
    """Agente base para un usuario específico"""

    def __init__(self, usuario: str):
        """Inicializar agente base"""
        self.usuario = usuario
        self.logger = setup_logging(usuario)
        self.user_dir = Path.home() / ".pascual" / "users" / usuario
        self.config = self._load_config()
        self.history = []
        self.logger.info(f"Agente base para usuario {usuario} inicializado")

    def _load_config(self) -> Dict[str, Any]:
        """Cargar configuración del agente base"""
        config_path = self.user_dir / "base_agent" / "config.json"
        try:
            with open(config_path, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.logger.error(f"Error al cargar configuración: {e}")
            return {}

    def _load_user_config(self) -> Dict[str, Any]:
        """Cargar configuración del usuario"""
        config_path = self.user_dir / "config.json"
        try:
            with open(config_path, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            self.logger.error(f"Error al cargar configuración de usuario: {e}")
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
def procesar_comando(usuario: str, texto: str, contexto: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Función de punto de entrada para procesar comandos"""
    agente = BaseAgent(usuario)
    return agente.procesar_comando(texto, contexto)

if __name__ == "__main__":
    # Código para pruebas
    if len(sys.argv) < 3:
        print("Uso: python agent.py <usuario> <texto>")
        sys.exit(1)

    usuario = sys.argv[1]
    texto = sys.argv[2]
    resultado = procesar_comando(usuario, texto)
    print(json.dumps(resultado, indent=2))
EOF

    # Crear helpers para el agente
    cat > "$agent_dir/memory.py" << 'EOF'
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

    def __init__(self, usuario: str):
        """Inicializar memoria del agente"""
        self.usuario = usuario
        self.user_dir = Path.home() / ".pascual" / "users" / usuario
        self.vector_dir = self.user_dir / "vector_index"

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
    chmod +x "$agent_dir/agent.py"
    chmod +x "$agent_dir/memory.py"

    log_info "Agente base creado para usuario: $usuario ✓"
    return 0
}

# Registrar agentes en configuración del maestro
register_base_agents() {
    log_step "Registrando agentes base en configuración del maestro..."

    # Crear archivo de registro de agentes
    local agents_file="$PASCUAL_DIR/master/agents_registry.json"

    # Inicializar archivo de registro si no existe
    if [ ! -f "$agents_file" ]; then
        cat > "$agents_file" << EOF
{
  "base_agents": {},
  "specialist_agents": {}
}
EOF
    fi

    # Obtener usuarios y registrar sus agentes base
    for usuario in $(get_users); do
        # Verificar que el agente base exista
        if [ -d "$PASCUAL_DIR/users/$usuario/base_agent" ]; then
            # Actualizar el registro JSON (usando archivos temporales por compatibilidad)
            temp_file=$(mktemp)
            jq --arg usuario "$usuario" --arg path "$PASCUAL_DIR/users/$usuario/base_agent/agent.py" \
               '.base_agents[$usuario] = $path' "$agents_file" > "$temp_file"
            mv "$temp_file" "$agents_file"

            log_info "Registrado agente base para: $usuario"
        else
            log_warning "No se pudo registrar agente para $usuario - directorio no encontrado"
        fi
    done

    log_info "Registro de agentes actualizado ✓"
    return 0
}

# Crear script de prueba de agentes
create_test_agent_script() {
    log_step "Creando script de prueba de agentes..."

    # Crear script en directorio utils
    mkdir -p "$PASCUAL_DIR/utils"

    cat > "$PASCUAL_DIR/utils/test_agent.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Utilidad para probar agentes base de usuario
"""
import os
import sys
import json
import argparse
from pathlib import Path

# Directorio base de Pascual
PASCUAL_DIR = Path.home() / ".pascual"

def get_users():
    """Obtener lista de usuarios registrados"""
    routing_file = PASCUAL_DIR / "config" / "routing.json"
    try:
        with open(routing_file, "r") as f:
            routing = json.load(f)
            return routing.get("usuarios_registrados", [])
    except (FileNotFoundError, json.JSONDecodeError):
        # Alternativa: buscar directorios
        return [d.name for d in (PASCUAL_DIR / "users").iterdir() if d.is_dir()]

def test_agent_command(usuario, comando):
    """Probar comando en el agente base del usuario"""
    # Verificar que el usuario existe
    if not (PASCUAL_DIR / "users" / usuario).exists():
        print(f"Error: Usuario '{usuario}' no encontrado")
        return False

    # Verificar que existe el agente base
    agent_script = PASCUAL_DIR / "users" / usuario / "base_agent" / "agent.py"
    if not agent_script.exists():
        print(f"Error: Agente base no encontrado para usuario '{usuario}'")
        return False

    print(f"Probando agente base para usuario: {usuario}")
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
        resultado = agent.procesar_comando(usuario, comando)

        # Mostrar resultado
        print("\nResultado:")
        print(json.dumps(resultado, indent=2))
        return True

    except Exception as e:
        print(f"Error al ejecutar agente: {e}")
        return False

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Herramienta de prueba de agentes base")
    parser.add_argument("--usuario", "-u", help="Usuario cuyo agente probar")
    parser.add_argument("--comando", "-c", help="Comando a probar en el agente")
    parser.add_argument("--list", "-l", action="store_true", help="Listar usuarios disponibles")

    args = parser.parse_args()

    # Listar usuarios
    if args.list:
        usuarios = get_users()
        print("Usuarios disponibles:")
        for usuario in usuarios:
            print(f"  - {usuario}")
        return

    # Verificar parámetros
    if not args.usuario or not args.comando:
        usuarios = get_users()
        if usuarios:
            print("Faltan parámetros. Ejemplo de uso:")
            print(f"  python test_agent.py --usuario {usuarios[0]} --comando \"¿Qué hora es?\"")
        else:
            print("Faltan parámetros y no hay usuarios disponibles")
        return

    # Ejecutar prueba
    test_agent_command(args.usuario, args.comando)

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutable
    chmod +x "$PASCUAL_DIR/utils/test_agent.py"

    log_info "Script de prueba de agentes creado en $PASCUAL_DIR/utils/test_agent.py"
    return 0
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "             PASCUAL-BOT: CREACIÓN DE AGENTES BASE POR USUARIO              "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env

# Obtener lista de usuarios
USUARIOS=$(get_users)
log_info "Usuarios detectados: $USUARIOS"

# Crear agentes base para cada usuario
for usuario in $USUARIOS; do
    create_base_agent "$usuario"
done

# Registrar agentes en configuración del maestro
register_base_agents

# Crear script de prueba
create_test_agent_script

# Registrar fase completada
echo "FASE_8_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Agentes base creados correctamente"
log_info "Para probar un agente, ejecuta:"
echo -e "${GREEN}   python3 $PASCUAL_DIR/utils/test_agent.py --usuario <nombre_usuario> --comando \"¿Qué hora es?\"${NC}"
echo ""
log_info "➡️  Siguiente paso: ejecutar ./09-sentinel-agente.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0