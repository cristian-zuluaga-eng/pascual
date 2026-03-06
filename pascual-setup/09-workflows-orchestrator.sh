#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local
# ============================================================================
# FASE 9: Workflows Orchestrator (SDD)
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instala el motor para flujos multi-paso entre agentes
# Dependencias: Dashboard (08-dashboard-nextjs.sh)
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
WORKFLOWS_DIR="$PASCUAL_DIR/workflows"

# Verificar que la fase anterior se haya ejecutado
check_previous_phase() {
    if [ ! -f "$PASCUAL_CONFIG/.env" ]; then
        log_error "No se encontró el archivo de configuración de Pascual-Bot"
        log_info "Debes ejecutar primero: ./08-dashboard-nextjs.sh"
        exit 1
    fi

    # Verificar que la fase 8 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_8_COMPLETED" != "true" ]; then
        log_error "La fase 8 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./08-dashboard-nextjs.sh"
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
        log_info "Para hacer rollback, ejecute: ./rollback/rollback-phase-9.sh"
    fi
}

# Registrar función de limpieza para ejecución en caso de error
trap cleanup EXIT

# Instalar dependencias del orquestador
install_orchestrator_dependencies() {
    log_step "Instalando dependencias para Workflows Orchestrator..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Instalar dependencias
    pip install \
        pyyaml \
        jsonschema \
        networkx \
        graphviz \
        ratelimiter \
        tenacity \
        schedule \
        pydantic

    log_info "Dependencias instaladas correctamente ✓"
    return 0
}

# Crear directorios del orquestador
create_orchestrator_directories() {
    log_step "Creando estructura de directorios para Workflows..."

    # Crear directorios si no existen
    mkdir -p "$WORKFLOWS_DIR"/{definitions,executions,logs,schemas,templates}

    log_info "Estructura de directorios creada ✓"
    return 0
}

# Crear archivos principales del orquestador
create_orchestrator_files() {
    log_step "Creando archivos del Orchestrator..."

    # Crear script principal
    cat > "$WORKFLOWS_DIR/orchestrator.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Bot: Workflows Orchestrator (SDD)
Motor para flujos multi-paso entre agentes
"""
import os
import sys
import yaml
import json
import uuid
import logging
import datetime
import argparse
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple, Set, Union
import importlib.util

# Directorio base de Pascual
PASCUAL_DIR = Path.home() / ".pascual"
WORKFLOWS_DIR = PASCUAL_DIR / "workflows"
LOGS_DIR = WORKFLOWS_DIR / "logs"

# Configurar logging
LOGS_DIR.mkdir(exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / "orchestrator.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("Pascual-Orchestrator")

class WorkflowStep:
    """Representa un paso en un workflow"""

    def __init__(self, step_id: str, step_config: Dict[str, Any]):
        self.id = step_id
        self.agent = step_config.get("agent", "")
        self.action = step_config.get("action", "")
        self.timeout = self._parse_timeout(step_config.get("timeout", "30s"))
        self.retry = step_config.get("retry", 1)
        self.depends_on = step_config.get("depends_on", [])
        self.parameters = step_config.get("parameters", {})
        self.condition = step_config.get("condition", None)
        self.on_error = step_config.get("on_error", "fail")
        self.status = "pending"  # pending, running, completed, failed, skipped
        self.result = None
        self.error = None
        self.start_time = None
        self.end_time = None

    def _parse_timeout(self, timeout_str: str) -> int:
        """Convierte string de timeout (ej: '30s', '5m') a segundos"""
        if isinstance(timeout_str, (int, float)):
            return int(timeout_str)

        try:
            value = int(timeout_str[:-1])
            unit = timeout_str[-1].lower()

            if unit == 's':
                return value
            elif unit == 'm':
                return value * 60
            elif unit == 'h':
                return value * 3600
            else:
                return 30  # valor por defecto
        except (ValueError, IndexError):
            return 30  # valor por defecto

    def to_dict(self) -> Dict[str, Any]:
        """Convierte el paso a diccionario para serialización"""
        return {
            "id": self.id,
            "agent": self.agent,
            "action": self.action,
            "timeout": self.timeout,
            "retry": self.retry,
            "depends_on": self.depends_on,
            "parameters": self.parameters,
            "condition": self.condition,
            "on_error": self.on_error,
            "status": self.status,
            "result": self.result,
            "error": self.error,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
        }

class Workflow:
    """Representa un flujo de trabajo definido en YAML"""

    def __init__(self, workflow_id: str, definition: Dict[str, Any]):
        self.id = workflow_id
        self.version = definition.get("workflow", {}).get("version", "1.0")
        self.description = definition.get("workflow", {}).get("description", "")
        self.steps = self._parse_steps(definition.get("workflow", {}).get("steps", []))
        self.on_error = definition.get("workflow", {}).get("on_error", {})
        self.metadata = definition.get("workflow", {}).get("metadata", {})

        # Ejecutión
        self.execution_id = str(uuid.uuid4())
        self.status = "pending"  # pending, running, completed, failed, cancelled
        self.start_time = None
        self.end_time = None
        self.execution_context = {}

    def _parse_steps(self, steps_config: List[Dict[str, Any]]) -> Dict[str, WorkflowStep]:
        """Convierte la configuración de pasos en objetos WorkflowStep"""
        steps = {}
        for step_config in steps_config:
            step_id = step_config.get("id")
            if step_id:
                steps[step_id] = WorkflowStep(step_id, step_config)
        return steps

    def get_executable_steps(self) -> List[WorkflowStep]:
        """Obtiene los pasos que pueden ser ejecutados (dependencias completas)"""
        executable = []

        for step_id, step in self.steps.items():
            # Si el paso ya está en ejecución o completado, saltarlo
            if step.status in ["running", "completed", "skipped", "failed"]:
                continue

            # Verificar dependencias
            dependencies_met = True
            for dep_id in step.depends_on:
                if dep_id not in self.steps:
                    logger.warning(f"Dependencia {dep_id} no encontrada para paso {step_id}")
                    dependencies_met = False
                    break

                dep_step = self.steps[dep_id]
                if dep_step.status != "completed":
                    dependencies_met = False
                    break

            if dependencies_met:
                executable.append(step)

        return executable

    def all_steps_completed(self) -> bool:
        """Verifica si todos los pasos han sido completados o saltados"""
        for step in self.steps.values():
            if step.status not in ["completed", "skipped", "failed"]:
                return False
        return True

    def to_dict(self) -> Dict[str, Any]:
        """Convierte el workflow a diccionario para serialización"""
        return {
            "id": self.id,
            "execution_id": self.execution_id,
            "version": self.version,
            "description": self.description,
            "steps": {step_id: step.to_dict() for step_id, step in self.steps.items()},
            "status": self.status,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "execution_context": self.execution_context,
        }

class WorkflowOrchestrator:
    """Motor de orquestación de workflows"""

    def __init__(self):
        """Inicializar orquestador"""
        self.definitions_path = WORKFLOWS_DIR / "definitions"
        self.executions_path = WORKFLOWS_DIR / "executions"
        self.templates_path = WORKFLOWS_DIR / "templates"
        self.schemas_path = WORKFLOWS_DIR / "schemas"

        # Crear directorios si no existen
        self.executions_path.mkdir(exist_ok=True)

    def list_workflows(self) -> List[Dict[str, Any]]:
        """Listar workflows disponibles"""
        workflows = []

        # Buscar definiciones YAML
        for yaml_file in self.definitions_path.glob("*.yaml"):
            try:
                with open(yaml_file, "r") as f:
                    definition = yaml.safe_load(f)

                workflow_info = {
                    "id": yaml_file.stem,
                    "file": yaml_file.name,
                    "version": definition.get("workflow", {}).get("version", "1.0"),
                    "description": definition.get("workflow", {}).get("description", ""),
                    "steps_count": len(definition.get("workflow", {}).get("steps", [])),
                }
                workflows.append(workflow_info)
            except Exception as e:
                logger.error(f"Error al leer workflow {yaml_file}: {e}")

        return workflows

    def load_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Cargar definición de workflow desde archivo YAML"""
        yaml_path = self.definitions_path / f"{workflow_id}.yaml"

        if not yaml_path.exists():
            logger.error(f"Workflow no encontrado: {workflow_id}")
            return None

        try:
            with open(yaml_path, "r") as f:
                return yaml.safe_load(f)
        except Exception as e:
            logger.error(f"Error al cargar workflow {workflow_id}: {e}")
            return None

    def ejecutar(self, workflow_id: str, params: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """
        Ejecutar workflow completo

        Retorna el ID de ejecución si se inicia correctamente
        """
        # Cargar definición
        definition = self.load_workflow(workflow_id)
        if not definition:
            return None

        # Crear objeto workflow
        workflow = Workflow(workflow_id, definition)
        workflow.execution_context = {
            "initiated_at": datetime.datetime.now().isoformat(),
            **(params or {})
        }

        # Registrar inicio
        workflow.start_time = datetime.datetime.now()
        workflow.status = "running"

        # Guardar estado inicial
        execution_file = self.executions_path / f"{workflow.execution_id}.json"
        with open(execution_file, "w") as f:
            json.dump(workflow.to_dict(), f, indent=2)

        logger.info(f"Iniciado workflow {workflow_id} (ejecución {workflow.execution_id})")

        # En un sistema real, se iniciaría un proceso separado o tarea en segundo plano
        # Por ahora, simular ejecución simple
        self._simular_ejecucion(workflow)

        return workflow.execution_id

    def _simular_ejecucion(self, workflow: Workflow) -> None:
        """
        Simula la ejecución de un workflow (para desarrollo)

        En producción, esto sería un motor de ejecución real con paralelismo,
        manejo de errores, compensación, etc.
        """
        logger.info(f"Simulando ejecución de workflow {workflow.id}")

        # Simular ejecución de pasos
        for step_id, step in workflow.steps.items():
            step.start_time = datetime.datetime.now()
            step.status = "running"
            logger.info(f"Ejecutando paso {step_id}: {step.agent}.{step.action}")

            # Simular latencia
            import time
            time.sleep(1)

            # Simular resultado exitoso
            step.status = "completed"
            step.result = {"success": True, "message": "Paso simulado completado"}
            step.end_time = datetime.datetime.now()

        # Completar workflow
        workflow.status = "completed"
        workflow.end_time = datetime.datetime.now()

        # Guardar estado final
        execution_file = self.executions_path / f"{workflow.execution_id}.json"
        with open(execution_file, "w") as f:
            json.dump(workflow.to_dict(), f, indent=2)

        logger.info(f"Workflow {workflow.id} completado (simulación)")

    def get_execution_status(self, execution_id: str) -> Optional[Dict[str, Any]]:
        """Obtener estado de una ejecución"""
        execution_file = self.executions_path / f"{execution_id}.json"

        if not execution_file.exists():
            logger.error(f"Ejecución no encontrada: {execution_id}")
            return None

        try:
            with open(execution_file, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error al cargar ejecución {execution_id}: {e}")
            return None

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Pascual-Bot Workflow Orchestrator")
    parser.add_argument("--list", action="store_true", help="Listar workflows disponibles")
    parser.add_argument("--execute", type=str, help="ID del workflow a ejecutar")
    parser.add_argument("--params", type=str, help="Parámetros para el workflow (JSON)")
    parser.add_argument("--status", type=str, help="ID de ejecución para ver estado")

    args = parser.parse_args()
    orchestrator = WorkflowOrchestrator()

    if args.list:
        workflows = orchestrator.list_workflows()
        print("\nWorkflows disponibles:\n")
        for wf in workflows:
            print(f"- {wf['id']}: {wf['description']} (v{wf['version']})")

    elif args.execute:
        params = {}
        if args.params:
            try:
                params = json.loads(args.params)
            except json.JSONDecodeError:
                print("Error: Los parámetros deben ser un JSON válido")
                return

        execution_id = orchestrator.ejecutar(args.execute, params)
        if execution_id:
            print(f"\nWorkflow iniciado: {args.execute}")
            print(f"ID de ejecución: {execution_id}")
        else:
            print(f"Error al iniciar workflow {args.execute}")

    elif args.status:
        status = orchestrator.get_execution_status(args.status)
        if status:
            print(f"\nEstado de ejecución {args.status}:")
            print(f"Workflow: {status['id']} (v{status['version']})")
            print(f"Estado: {status['status']}")
            print(f"Inicio: {status['start_time']}")
            print(f"Fin: {status['end_time'] or 'En progreso'}")
            print("\nPasos:")
            for step_id, step in status['steps'].items():
                print(f"- {step_id}: {step['status']} ({step['agent']}.{step['action']})")
        else:
            print(f"No se encontró la ejecución {args.status}")

    else:
        parser.print_help()

if __name__ == "__main__":
    main()
EOF

    # Crear módulo para ejecutar agentes
    cat > "$WORKFLOWS_DIR/agent_executor.py" << 'EOF'
#!/usr/bin/env python3
"""
Módulo para ejecutar agentes como parte de workflows
"""
import os
import sys
import json
import logging
import importlib.util
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional, List

# Directorio base de Pascual
PASCUAL_DIR = Path.home() / ".pascual"
logger = logging.getLogger("AgentExecutor")

class AgentExecutor:
    """Ejecuta agentes para workflows"""

    def __init__(self):
        """Inicializar ejecutor"""
        self.master_dir = PASCUAL_DIR / "master"
        self.registry_path = self.master_dir / "agents_registry.json"
        self.agents_registry = self._load_registry()

    def _load_registry(self) -> Dict[str, Any]:
        """Cargar registro de agentes"""
        try:
            if self.registry_path.exists():
                with open(self.registry_path, "r") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error al cargar registro de agentes: {e}")

        return {"base_agent": "", "specialist_agents": {}}

    def execute_agent(self, agent_type: str, agent_name: str, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecutar un agente específico"""
        if agent_type == "base":
            return self._execute_base_agent(action, params)
        elif agent_type == "specialist":
            return self._execute_specialist_agent(agent_name, action, params)
        else:
            return {"success": False, "error": f"Tipo de agente desconocido: {agent_type}"}

    def _execute_base_agent(self, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecutar agente base"""
        # Verificar que existe el agente base
        agent_path = self.agents_registry.get("base_agent", "")
        if not agent_path:
            return {"success": False, "error": "Agente base no configurado en el registro"}

        agent_path = Path(agent_path)
        if not agent_path.exists():
            return {"success": False, "error": f"Archivo de agente no encontrado: {agent_path}"}

        try:
            # Este es un placeholder - en producción usaríamos importlib para cargar el módulo
            # y ejecutar la función correspondiente
            cmd = [sys.executable, str(agent_path), action, json.dumps(params)]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return {"success": True, "output": result.stdout}
        except subprocess.SubprocessError as e:
            return {"success": False, "error": f"Error al ejecutar agente: {str(e)}"}

    def _execute_specialist_agent(self, agent_name: str, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecutar agente especialista"""
        # Verificar que el agente especialista existe
        specialist_agents = self.agents_registry.get("specialist_agents", {})
        if agent_name not in specialist_agents:
            return {"success": False, "error": f"Agente especialista {agent_name} no encontrado en el registro"}

        agent_path = Path(specialist_agents[agent_name])
        if not agent_path.exists():
            return {"success": False, "error": f"Archivo de agente no encontrado: {agent_path}"}

        try:
            # Este es un placeholder - en producción usaríamos importlib para cargar el módulo
            # y ejecutar la función correspondiente
            cmd = [sys.executable, str(agent_path), action, json.dumps(params)]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return {"success": True, "output": result.stdout}
        except subprocess.SubprocessError as e:
            return {"success": False, "error": f"Error al ejecutar agente: {str(e)}"}
EOF

    # Hacer ejecutables
    chmod +x "$WORKFLOWS_DIR/orchestrator.py"
    chmod +x "$WORKFLOWS_DIR/agent_executor.py"

    log_info "Archivos principales del Orchestrator creados ✓"
    return 0
}

# Crear templates de workflows
create_workflow_templates() {
    log_step "Creando templates de workflows..."

    # Template para onboarding
    cat > "$WORKFLOWS_DIR/templates/onboarding.yaml" << 'EOF'
workflow:
  id: "onboarding"
  version: "1.0"
  description: "Configura nuevo usuario con preferencias y agentes básicos"

  metadata:
    author: "Pascual-Bot"
    category: "sistema"
    tags: ["onboarding", "configuración"]

  steps:
    - id: "welcome_message"
      agent: "base_agent"
      action: "send_welcome"
      timeout: 30s
      retry: 2
      parameters:
        template: "welcome"

    - id: "setup_default_agents"
      agent: "agent_registry"
      action: "assign_defaults"
      depends_on: ["welcome_message"]
      parameters:
        agents: ["calendar", "tasks"]

    - id: "create_initial_task"
      agent: "tasks_agent"
      action: "create_task"
      depends_on: ["setup_default_agents"]
      parameters:
        title: "Completar configuración de perfil"
        description: "Personaliza tu perfil con tus preferencias"
        due_date: "+7d"

  on_error:
    strategy: "notify_and_rollback"
EOF

    # Template para backup semanal
    cat > "$WORKFLOWS_DIR/templates/backup_semanal.yaml" << 'EOF'
workflow:
  id: "backup_semanal"
  version: "1.0"
  description: "Realiza backup de configuraciones y datos"

  metadata:
    author: "Pascual-Bot"
    category: "mantenimiento"
    tags: ["backup", "seguridad", "datos"]
    schedule: "weekly"

  steps:
    - id: "check_disk_space"
      agent: "system"
      action: "check_resources"
      timeout: 30s
      parameters:
        resource_type: "disk"
        min_free_percent: 20

    - id: "create_backup_dir"
      agent: "system"
      action: "create_directory"
      depends_on: ["check_disk_space"]
      parameters:
        path: "${PASCUAL_DIR}/shared/backups/${timestamp}"

    - id: "backup_configs"
      agent: "system"
      action: "copy_files"
      depends_on: ["create_backup_dir"]
      parameters:
        source: "${PASCUAL_DIR}/config"
        destination: "${PASCUAL_DIR}/shared/backups/${timestamp}/config"

    - id: "backup_core"
      agent: "system"
      action: "copy_files"
      depends_on: ["create_backup_dir"]
      parameters:
        source: "${PASCUAL_DIR}/core"
        destination: "${PASCUAL_DIR}/shared/backups/${timestamp}/core"

    - id: "compress_backup"
      agent: "system"
      action: "compress"
      depends_on: ["backup_configs", "backup_core"]
      parameters:
        source: "${PASCUAL_DIR}/shared/backups/${timestamp}"
        destination: "${PASCUAL_DIR}/shared/backups/backup_${date}.tar.gz"

    - id: "cleanup_temp"
      agent: "system"
      action: "delete_directory"
      depends_on: ["compress_backup"]
      parameters:
        path: "${PASCUAL_DIR}/shared/backups/${timestamp}"

  on_error:
    strategy: "notify_admin"
EOF

    # Template para reporte mensual
    cat > "$WORKFLOWS_DIR/templates/reporte_mensual.yaml" << 'EOF'
workflow:
  id: "reporte_mensual"
  version: "1.0"
  description: "Genera y envía un reporte mensual de uso del sistema"

  metadata:
    author: "Pascual-Bot"
    category: "informes"
    tags: ["reporte", "métricas", "mensual"]
    schedule: "monthly"

  steps:
    - id: "collect_metrics"
      agent: "monitoring"
      action: "collect_metrics"
      timeout: 60s
      parameters:
        period: "last_month"
        metrics: ["system_usage", "activity", "resources"]

    - id: "generate_charts"
      agent: "reporting"
      action: "generate_charts"
      depends_on: ["collect_metrics"]
      parameters:
        metrics: "${collect_metrics.result.metrics}"
        output_dir: "${PASCUAL_DIR}/shared/reports/${year}-${month}"

    - id: "generate_html_report"
      agent: "reporting"
      action: "generate_html"
      depends_on: ["generate_charts"]
      parameters:
        template: "monthly_report"
        data: "${collect_metrics.result.metrics}"
        charts: "${generate_charts.result.charts}"
        output_file: "${PASCUAL_DIR}/shared/reports/${year}-${month}/report.html"

    - id: "notify_admin"
      agent: "notification"
      action: "send_notification"
      depends_on: ["generate_html_report"]
      parameters:
        channel: "dashboard"
        message: "Reporte mensual generado: ${generate_html_report.result.path}"

  on_error:
    strategy: "retry_once_then_notify"
EOF

    log_info "Templates de workflows creados ✓"
    return 0
}

# Crear definición de schema JSON para workflows
create_workflow_schema() {
    log_step "Creando schema para validación de workflows..."

    # Crear schema JSON para validación
    cat > "$WORKFLOWS_DIR/schemas/workflow_schema.json" << 'EOF'
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Pascual-Bot Workflow Schema",
  "description": "Esquema para validar definiciones de workflows",
  "type": "object",
  "required": ["workflow"],
  "properties": {
    "workflow": {
      "type": "object",
      "required": ["id", "version", "steps"],
      "properties": {
        "id": {
          "type": "string",
          "description": "Identificador único del workflow"
        },
        "version": {
          "type": "string",
          "description": "Versión del workflow"
        },
        "description": {
          "type": "string",
          "description": "Descripción del propósito del workflow"
        },
        "metadata": {
          "type": "object",
          "description": "Metadatos adicionales",
          "properties": {
            "author": {"type": "string"},
            "category": {"type": "string"},
            "tags": {
              "type": "array",
              "items": {"type": "string"}
            }
          }
        },
        "steps": {
          "type": "array",
          "description": "Pasos del workflow",
          "minItems": 1,
          "items": {
            "type": "object",
            "required": ["id", "agent", "action"],
            "properties": {
              "id": {
                "type": "string",
                "description": "Identificador único del paso"
              },
              "agent": {
                "type": "string",
                "description": "Agente que ejecutará el paso"
              },
              "action": {
                "type": "string",
                "description": "Acción a ejecutar"
              },
              "timeout": {
                "type": "string",
                "description": "Tiempo máximo de ejecución (e.g., '30s', '5m')"
              },
              "retry": {
                "type": "integer",
                "description": "Número de reintentos en caso de fallo",
                "minimum": 0
              },
              "depends_on": {
                "type": "array",
                "description": "IDs de pasos de los que depende",
                "items": {"type": "string"}
              },
              "parameters": {
                "type": "object",
                "description": "Parámetros para la acción"
              },
              "condition": {
                "type": "string",
                "description": "Condición para ejecutar el paso (expresión)"
              },
              "on_error": {
                "type": "string",
                "description": "Estrategia en caso de error",
                "enum": ["fail", "skip", "retry", "compensate"]
              }
            }
          }
        },
        "on_error": {
          "type": "object",
          "description": "Configuración global de manejo de errores",
          "properties": {
            "strategy": {
              "type": "string",
              "enum": ["fail_fast", "continue", "notify_and_rollback", "retry_once_then_notify"]
            }
          }
        }
      }
    }
  }
}
EOF

    log_info "Schema de validación creado ✓"
    return 0
}

# Crear workflows iniciales
create_initial_workflows() {
    log_step "Creando workflows iniciales..."

    # Crear directorio para definiciones si no existe
    mkdir -p "$WORKFLOWS_DIR/definitions"

    # Copiar templates como workflows iniciales
    cp "$WORKFLOWS_DIR/templates/onboarding.yaml" "$WORKFLOWS_DIR/definitions/"
    cp "$WORKFLOWS_DIR/templates/backup_semanal.yaml" "$WORKFLOWS_DIR/definitions/"

    log_info "Workflows iniciales creados ✓"
    return 0
}

# Crear utilidad para validar workflows
create_validator_tool() {
    log_step "Creando utilidad para validar workflows..."

    # Crear script de validación
    cat > "$WORKFLOWS_DIR/validate_workflow.py" << 'EOF'
#!/usr/bin/env python3
"""
Utilidad para validar definiciones de workflows
"""
import os
import sys
import yaml
import json
import jsonschema
import argparse
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple

# Directorio base de Pascual
PASCUAL_DIR = Path.home() / ".pascual"
WORKFLOWS_DIR = PASCUAL_DIR / "workflows"

def load_schema() -> Dict[str, Any]:
    """Cargar schema JSON para validación"""
    schema_path = WORKFLOWS_DIR / "schemas" / "workflow_schema.json"

    try:
        with open(schema_path, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error al cargar schema: {e}")
        sys.exit(1)

def validate_workflow(workflow_file: Path) -> Tuple[bool, List[str]]:
    """Validar workflow contra schema JSON"""
    # Cargar schema
    schema = load_schema()

    # Cargar workflow
    try:
        with open(workflow_file, "r") as f:
            workflow = yaml.safe_load(f)
    except Exception as e:
        return False, [f"Error al cargar workflow: {e}"]

    # Validar estructura
    try:
        jsonschema.validate(instance=workflow, schema=schema)
    except jsonschema.exceptions.ValidationError as e:
        return False, [f"Error de validación: {e}"]

    # Validaciones adicionales
    errors = []

    # Verificar IDs de pasos únicos
    step_ids = set()
    for step in workflow.get("workflow", {}).get("steps", []):
        step_id = step.get("id")
        if step_id in step_ids:
            errors.append(f"ID de paso duplicado: {step_id}")
        step_ids.add(step_id)

    # Verificar dependencias válidas
    for step in workflow.get("workflow", {}).get("steps", []):
        for dep_id in step.get("depends_on", []):
            if dep_id not in step_ids:
                errors.append(f"Dependencia inválida: {dep_id} en paso {step.get('id')}")

    # Verificar ciclos en dependencias
    # (Implementación básica - para una completa usaríamos networkx)
    try:
        topo_sort(workflow.get("workflow", {}).get("steps", []))
    except ValueError as e:
        errors.append(f"Ciclo de dependencias detectado: {e}")

    return len(errors) == 0, errors

def topo_sort(steps: List[Dict[str, Any]]) -> List[str]:
    """Ordenamiento topológico para detectar ciclos"""
    # Construir grafo de dependencias
    graph = {step["id"]: set(step.get("depends_on", [])) for step in steps}

    # Conjunto de nodos visitados en el recorrido actual
    visited = set()
    # Conjunto de nodos completados
    temp = set()
    # Resultado ordenado
    result = []

    def visit(node):
        if node in temp:
            return
        if node in visited:
            raise ValueError(f"Ciclo detectado en paso {node}")

        visited.add(node)

        for dep in graph.get(node, set()):
            visit(dep)

        temp.add(node)
        result.append(node)

    # Visitar cada nodo
    for node in graph:
        if node not in temp:
            visit(node)

    return result

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Validador de definiciones de workflows")
    parser.add_argument("workflow", nargs="?", help="Archivo YAML del workflow a validar")
    parser.add_argument("--all", action="store_true", help="Validar todos los workflows")

    args = parser.parse_args()

    if args.all:
        # Validar todos los workflows en la carpeta definitions
        definitions_dir = WORKFLOWS_DIR / "definitions"
        if not definitions_dir.exists():
            print(f"Error: Directorio de definiciones no encontrado: {definitions_dir}")
            sys.exit(1)

        yaml_files = list(definitions_dir.glob("*.yaml"))
        if not yaml_files:
            print("No se encontraron archivos YAML de workflows")
            sys.exit(0)

        all_valid = True
        for yaml_file in yaml_files:
            print(f"\nValidando {yaml_file.name}...")
            valid, errors = validate_workflow(yaml_file)

            if valid:
                print(f"✅ {yaml_file.name}: Válido")
            else:
                all_valid = False
                print(f"❌ {yaml_file.name}: Inválido")
                for error in errors:
                    print(f"  - {error}")

        if all_valid:
            print("\nTodos los workflows son válidos ✅")
            sys.exit(0)
        else:
            print("\nAlgunos workflows tienen errores ❌")
            sys.exit(1)

    elif args.workflow:
        # Validar un workflow específico
        workflow_path = Path(args.workflow)
        if not workflow_path.exists():
            print(f"Error: Archivo no encontrado: {workflow_path}")
            sys.exit(1)

        valid, errors = validate_workflow(workflow_path)

        if valid:
            print(f"✅ {workflow_path.name}: Workflow válido")
            sys.exit(0)
        else:
            print(f"❌ {workflow_path.name}: Workflow inválido")
            for error in errors:
                print(f"  - {error}")
            sys.exit(1)

    else:
        parser.print_help()
        sys.exit(0)

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutable
    chmod +x "$WORKFLOWS_DIR/validate_workflow.py"

    log_info "Utilidad de validación creada ✓"
    return 0
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "             PASCUAL-BOT: INSTALACIÓN DE WORKFLOWS ORCHESTRATOR             "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env

# Instalar dependencias del orquestador
install_orchestrator_dependencies

# Crear directorios del orquestador
create_orchestrator_directories

# Crear archivos principales del orquestador
create_orchestrator_files

# Crear templates de workflows
create_workflow_templates

# Crear schema de validación
create_workflow_schema

# Crear workflows iniciales
create_initial_workflows

# Crear utilidad de validación
create_validator_tool

# Registrar fase completada
echo "FASE_9_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Workflows Orchestrator instalado correctamente"
log_info "Para listar workflows disponibles, ejecuta:"
echo -e "${GREEN}   python3 $WORKFLOWS_DIR/orchestrator.py --list${NC}"
echo ""
log_info "Para validar workflows, ejecuta:"
echo -e "${GREEN}   python3 $WORKFLOWS_DIR/validate_workflow.py --all${NC}"
echo ""
log_info "➡️  Siguiente paso: ejecutar ./10-skills-complementarios.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0