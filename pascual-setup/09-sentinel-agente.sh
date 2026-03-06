#!/bin/bash
# ============================================================================
# PASCUAL-BOT: Sistema de Agente de IA Local Multi-Usuario
# ============================================================================
# FASE 9: Sentinel (Agente de Seguridad e Infraestructura)
# Autor: Claude
# Fecha: 2026-03-05
# Descripción: Instala el agente Sentinel para monitoreo, alertas y seguridad
# Dependencias: Agentes base (08-agentes-base-usuario.sh)
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
SENTINEL_DIR="$PASCUAL_DIR/sentinel"

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
        log_info "Debes ejecutar primero: ./08-agentes-base-usuario.sh"
        exit 1
    fi

    # Verificar que la fase 8 esté marcada como completada
    source "$PASCUAL_CONFIG/.env"
    if [ "$FASE_8_COMPLETED" != "true" ]; then
        log_error "La fase 8 no se ha completado correctamente"
        log_info "Debes ejecutar primero: ./08-agentes-base-usuario.sh"
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

# Instalar dependencias de Sentinel
install_sentinel_dependencies() {
    log_step "Instalando dependencias para Sentinel..."

    # Activar entorno virtual
    source "$PASCUAL_DIR/venv/bin/activate"

    # Instalar dependencias
    log_info "Instalando paquetes para monitoreo y seguridad..."
    pip install \
        psutil \
        pynvml \
        plotext \
        py-cpuinfo \
        watchdog \
        pyufw \
        python-telegram-bot \
        matplotlib

    log_info "Dependencias de Sentinel instaladas correctamente ✓"
    return 0
}

# Crear directorio y archivos de Sentinel
create_sentinel_files() {
    log_step "Creando archivos de Sentinel..."

    # Crear directorio si no existe
    mkdir -p "$SENTINEL_DIR"/{monitors,alerts,reports,security}

    # Script principal de Sentinel
    cat > "$SENTINEL_DIR/sentinel.py" << 'EOF'
#!/usr/bin/env python3
"""
Pascual-Sentinel: Guardián de seguridad e infraestructura
Monitorea recursos, detecta anomalías, envía alertas y realiza tareas de mantenimiento
"""
import os
import sys
import json
import time
import signal
import logging
import datetime
import argparse
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

# Directorio base de Pascual
PASCUAL_DIR = Path.home() / ".pascual"
CONFIG_DIR = PASCUAL_DIR / "config"
SENTINEL_DIR = PASCUAL_DIR / "sentinel"
LOGS_DIR = PASCUAL_DIR / "shared/logs"

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / "sentinel.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("Pascual-Sentinel")

class PascualSentinel:
    """Agente Sentinel para seguridad e infraestructura"""

    def __init__(self):
        """Inicializar Sentinel"""
        self.running = True
        self.config = self._load_config()
        self.policy = self._load_policy()
        self.last_check = {}
        self.alert_history = []
        logger.info("Pascual-Sentinel inicializado")

    def _load_config(self) -> Dict[str, Any]:
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

    def _load_policy(self) -> Dict[str, Any]:
        """Cargar política de Sentinel"""
        policy_path = CONFIG_DIR / "sentinel_policy.json"
        try:
            with open(policy_path, "r") as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            logger.error(f"Error al cargar política de Sentinel: {e}")
            # Política por defecto
            return {
                "monitoring": {
                    "resources": ["cpu", "ram", "disk", "gpu_temp"],
                    "thresholds": {"disk_warn": 80, "ram_critical": 95}
                },
                "security": {
                    "audit_user_configs": True,
                    "detect_orphaned_files": True
                },
                "jurisdiction": {
                    "user_data_is_private": True,
                    "system_alerts_go_to_all": True
                }
            }

    def _monitor_resources(self) -> Dict[str, Any]:
        """Monitorear CPU, RAM, disco, temperatura"""
        try:
            import psutil

            # Recolectar información básica
            resources = {
                "timestamp": datetime.datetime.now().isoformat(),
                "cpu": {
                    "percent": psutil.cpu_percent(interval=1),
                    "count": psutil.cpu_count(),
                    "freq": psutil.cpu_freq().current if psutil.cpu_freq() else None,
                },
                "memory": {
                    "total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
                    "used_gb": round(psutil.virtual_memory().used / (1024**3), 2),
                    "percent": psutil.virtual_memory().percent
                },
                "disk": {
                    "total_gb": round(psutil.disk_usage('/').total / (1024**3), 2),
                    "used_gb": round(psutil.disk_usage('/').used / (1024**3), 2),
                    "percent": psutil.disk_usage('/').percent
                },
            }

            # Intentar obtener temperatura GPU si está disponible
            try:
                import pynvml
                pynvml.nvmlInit()
                device_count = pynvml.nvmlDeviceGetCount()
                if device_count > 0:
                    handle = pynvml.nvmlDeviceGetHandleByIndex(0)
                    temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
                    resources["gpu"] = {
                        "temp": temp,
                        "name": pynvml.nvmlDeviceGetName(handle).decode('utf-8')
                    }
                pynvml.nvmlShutdown()
            except (ImportError, Exception) as e:
                # GPU monitoring opcional
                pass

            logger.debug(f"Recursos monitoreados: {resources}")
            return resources

        except ImportError:
            logger.error("No se pudo importar psutil")
            return {
                "timestamp": datetime.datetime.now().isoformat(),
                "error": "No se pudo monitorear recursos"
            }
        except Exception as e:
            logger.error(f"Error al monitorear recursos: {e}")
            return {
                "timestamp": datetime.datetime.now().isoformat(),
                "error": str(e)
            }

    def _check_thresholds(self, resources: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Verificar umbrales críticos y generar alertas"""
        alerts = []
        thresholds = self.policy.get("monitoring", {}).get("thresholds", {})

        # Verificar RAM
        ram_percent = resources.get("memory", {}).get("percent")
        if ram_percent and ram_percent >= thresholds.get("ram_critical", 95):
            alerts.append({
                "level": "critical",
                "resource": "memory",
                "message": f"RAM crítica: {ram_percent}% usado"
            })
        elif ram_percent and ram_percent >= thresholds.get("ram_warn", 85):
            alerts.append({
                "level": "warning",
                "resource": "memory",
                "message": f"RAM alta: {ram_percent}% usado"
            })

        # Verificar Disco
        disk_percent = resources.get("disk", {}).get("percent")
        if disk_percent and disk_percent >= thresholds.get("disk_critical", 90):
            alerts.append({
                "level": "critical",
                "resource": "disk",
                "message": f"Disco crítico: {disk_percent}% usado"
            })
        elif disk_percent and disk_percent >= thresholds.get("disk_warn", 80):
            alerts.append({
                "level": "warning",
                "resource": "disk",
                "message": f"Disco alto: {disk_percent}% usado"
            })

        # Verificar CPU
        cpu_percent = resources.get("cpu", {}).get("percent")
        if cpu_percent and cpu_percent >= thresholds.get("cpu_critical", 95):
            alerts.append({
                "level": "critical",
                "resource": "cpu",
                "message": f"CPU crítica: {cpu_percent}% uso"
            })
        elif cpu_percent and cpu_percent >= thresholds.get("cpu_warn", 90):
            alerts.append({
                "level": "warning",
                "resource": "cpu",
                "message": f"CPU alta: {cpu_percent}% uso"
            })

        # Verificar GPU si existe
        if "gpu" in resources:
            gpu_temp = resources["gpu"].get("temp")
            if gpu_temp and gpu_temp >= thresholds.get("gpu_temp_critical", 90):
                alerts.append({
                    "level": "critical",
                    "resource": "gpu",
                    "message": f"GPU temperatura crítica: {gpu_temp}°C"
                })
            elif gpu_temp and gpu_temp >= thresholds.get("gpu_temp_warn", 80):
                alerts.append({
                    "level": "warning",
                    "resource": "gpu",
                    "message": f"GPU temperatura alta: {gpu_temp}°C"
                })

        return alerts

    def _audit_user_configs(self) -> List[Dict[str, Any]]:
        """Auditar configuraciones de usuarios"""
        issues = []

        # Verificar permisos de directorios de usuario
        try:
            users_dir = PASCUAL_DIR / "users"
            for user_dir in users_dir.iterdir():
                if user_dir.is_dir():
                    # Verificar permisos (debe ser 750 o más restrictivo)
                    import stat
                    perms = user_dir.stat().st_mode
                    if perms & (stat.S_IROTH | stat.S_IWOTH | stat.S_IXOTH):
                        issues.append({
                            "level": "warning",
                            "resource": "security",
                            "message": f"Permisos inseguros en {user_dir} (otros pueden acceder)"
                        })
        except Exception as e:
            logger.error(f"Error al auditar permisos: {e}")

        return issues

    def _send_alerts(self, alerts: List[Dict[str, Any]]) -> None:
        """Enviar alertas a canales configurados"""
        if not alerts:
            return

        # Registrar alertas en log
        for alert in alerts:
            if alert["level"] == "critical":
                logger.critical(f"ALERTA CRÍTICA: {alert['message']}")
            else:
                logger.warning(f"ALERTA: {alert['message']}")

        # Guardar en historial
        timestamp = datetime.datetime.now().isoformat()
        for alert in alerts:
            alert["timestamp"] = timestamp
            self.alert_history.append(alert)

        # Limitar historial
        max_history = 100
        if len(self.alert_history) > max_history:
            self.alert_history = self.alert_history[-max_history:]

        # TODO: Enviar alertas a Telegram y Dashboard
        # Por ahora solo guardar en archivo de alertas
        alerts_file = SENTINEL_DIR / "alerts" / "recent_alerts.json"
        try:
            alerts_file.parent.mkdir(exist_ok=True)
            with open(alerts_file, "w") as f:
                json.dump(self.alert_history, f, indent=2)
        except Exception as e:
            logger.error(f"Error al guardar alertas: {e}")

    def _cleanup_cache(self) -> None:
        """Limpiar archivos de caché antiguos"""
        # Implementar política de limpieza
        cleanup_policy = self.policy.get("cleanup", {})
        temp_max_age_days = cleanup_policy.get("temp_files_max_age_days", 7)
        logs_max_age_days = cleanup_policy.get("logs_max_age_days", 30)

        now = datetime.datetime.now()
        temp_cutoff = now - datetime.timedelta(days=temp_max_age_days)
        logs_cutoff = now - datetime.timedelta(days=logs_max_age_days)

        # Limpiar archivos temporales
        try:
            temp_dir = PASCUAL_DIR / "shared" / "temp"
            if temp_dir.exists():
                for file in temp_dir.glob("**/*"):
                    if file.is_file() and datetime.datetime.fromtimestamp(file.stat().st_mtime) < temp_cutoff:
                        file.unlink()
                        logger.debug(f"Eliminado archivo temporal: {file}")
        except Exception as e:
            logger.error(f"Error al limpiar archivos temporales: {e}")

        # Limpiar logs antiguos (pero nunca el actual)
        try:
            current_log = LOGS_DIR / "sentinel.log"
            current_log_path = str(current_log.resolve())

            for file in LOGS_DIR.glob("*.log.*"):
                if str(file.resolve()) != current_log_path and datetime.datetime.fromtimestamp(file.stat().st_mtime) < logs_cutoff:
                    file.unlink()
                    logger.debug(f"Eliminado log antiguo: {file}")
        except Exception as e:
            logger.error(f"Error al limpiar logs antiguos: {e}")

    def run_check(self) -> Dict[str, Any]:
        """Ejecutar una verificación completa"""
        # Monitorear recursos
        resources = self._monitor_resources()

        # Verificar umbrales
        resource_alerts = self._check_thresholds(resources)

        # Auditar configuraciones si está habilitado
        security_alerts = []
        if self.policy.get("security", {}).get("audit_user_configs", False):
            security_alerts = self._audit_user_configs()

        # Combinar alertas
        all_alerts = resource_alerts + security_alerts

        # Enviar alertas si hay
        if all_alerts:
            self._send_alerts(all_alerts)

        # Ejecutar limpieza según programación (por ahora, cada 24 horas)
        cleanup_interval = 24 * 3600  # 24 horas en segundos
        now = time.time()
        last_cleanup = self.last_check.get("cleanup", 0)

        if now - last_cleanup > cleanup_interval:
            self._cleanup_cache()
            self.last_check["cleanup"] = now

        # Guardar resultados para reporting
        results = {
            "timestamp": datetime.datetime.now().isoformat(),
            "resources": resources,
            "alerts": all_alerts,
            "status": "critical" if any(a["level"] == "critical" for a in all_alerts) else
                      "warning" if any(a["level"] == "warning" for a in all_alerts) else "normal"
        }

        return results

    def run_monitoring_loop(self) -> None:
        """Ejecutar bucle principal de monitoreo"""
        check_interval = self.policy.get("monitoring", {}).get("check_interval_sec", 60)

        logger.info(f"Iniciando bucle de monitoreo (intervalo: {check_interval}s)")

        try:
            while self.running:
                # Ejecutar verificación
                results = self.run_check()

                # Guardar resultados en archivo de estado
                try:
                    with open(SENTINEL_DIR / "status.json", "w") as f:
                        json.dump(results, f, indent=2)
                except Exception as e:
                    logger.error(f"Error al guardar estado: {e}")

                # Dormir hasta próxima verificación
                time.sleep(check_interval)

        except KeyboardInterrupt:
            logger.info("Monitoreo interrumpido por usuario")
        except Exception as e:
            logger.error(f"Error en bucle de monitoreo: {e}")
            raise

    def stop(self) -> None:
        """Detener Sentinel"""
        logger.info("Deteniendo Sentinel")
        self.running = False

def signal_handler(sig, frame):
    """Manejador de señales para cierre elegante"""
    logger.info(f"Señal recibida ({sig}), deteniendo Sentinel...")
    sentinel.stop()
    sys.exit(0)

if __name__ == "__main__":
    # Registrar manejadores de señales
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Parsear argumentos
    parser = argparse.ArgumentParser(description='Pascual-Sentinel: Guardián de seguridad e infraestructura')
    parser.add_argument('--debug', action='store_true', help='Activar modo debug')
    parser.add_argument('--cleanup', action='store_true', help='Ejecutar solo limpieza y salir')
    parser.add_argument('--check', action='store_true', help='Ejecutar verificación única y salir')
    args = parser.parse_args()

    # Configurar nivel de logging
    if args.debug:
        logger.setLevel(logging.DEBUG)
        for handler in logger.handlers:
            handler.setLevel(logging.DEBUG)

    # Iniciar Sentinel
    logger.info("Iniciando Pascual-Sentinel...")
    sentinel = PascualSentinel()

    # Modo de ejecución
    if args.cleanup:
        # Ejecutar solo limpieza
        logger.info("Ejecutando limpieza manual...")
        sentinel._cleanup_cache()
        sys.exit(0)
    elif args.check:
        # Ejecutar verificación única
        logger.info("Ejecutando verificación manual...")
        results = sentinel.run_check()
        print(json.dumps(results, indent=2))
        sys.exit(0)
    else:
        # Ejecutar bucle de monitoreo
        sentinel.run_monitoring_loop()
EOF

    # Crear módulo de alertas
    cat > "$SENTINEL_DIR/monitors/resources.py" << 'EOF'
#!/usr/bin/env python3
"""
Módulo de monitoreo de recursos para Sentinel
Monitorea CPU, RAM, disco, GPU y otros recursos del sistema
"""
import psutil
import logging
import datetime
from pathlib import Path
from typing import Dict, Any, List

logger = logging.getLogger("Sentinel-Resources")

class ResourceMonitor:
    """Monitor de recursos del sistema"""

    def __init__(self):
        """Inicializar monitor de recursos"""
        self.history = []
        self.history_limit = 1440  # 24 horas con muestreo cada minuto

    def check_resources(self) -> Dict[str, Any]:
        """Obtener estado actual de recursos"""
        try:
            # Recolectar información básica
            resources = {
                "timestamp": datetime.datetime.now().isoformat(),
                "cpu": {
                    "percent": psutil.cpu_percent(interval=1),
                    "count": psutil.cpu_count(),
                    "freq": psutil.cpu_freq().current if psutil.cpu_freq() else None,
                },
                "memory": {
                    "total_gb": round(psutil.virtual_memory().total / (1024**3), 2),
                    "used_gb": round(psutil.virtual_memory().used / (1024**3), 2),
                    "percent": psutil.virtual_memory().percent
                },
                "disk": {
                    "total_gb": round(psutil.disk_usage('/').total / (1024**3), 2),
                    "used_gb": round(psutil.disk_usage('/').used / (1024**3), 2),
                    "percent": psutil.disk_usage('/').percent
                },
                "swap": {
                    "total_gb": round(psutil.swap_memory().total / (1024**3), 2),
                    "used_gb": round(psutil.swap_memory().used / (1024**3), 2),
                    "percent": psutil.swap_memory().percent
                },
                "network": {
                    "bytes_sent": psutil.net_io_counters().bytes_sent,
                    "bytes_recv": psutil.net_io_counters().bytes_recv
                }
            }

            # Guardar en historial
            self.history.append(resources)

            # Limitar historial
            if len(self.history) > self.history_limit:
                self.history = self.history[-self.history_limit:]

            return resources

        except Exception as e:
            logger.error(f"Error al monitorear recursos: {e}")
            return {
                "timestamp": datetime.datetime.now().isoformat(),
                "error": str(e)
            }

    def get_history(self, limit: int = None) -> List[Dict[str, Any]]:
        """Obtener historial de recursos"""
        if limit:
            return self.history[-limit:]
        return self.history
EOF

    # Crear utilidad de limpieza de caché
    cat > "$SENTINEL_DIR/cleanup.py" << 'EOF'
#!/usr/bin/env python3
"""
Utilidad de limpieza de caché y archivos temporales
Ejecutada por Sentinel según programación o manualmente
"""
import os
import sys
import time
import json
import shutil
import logging
import argparse
import datetime
from pathlib import Path
from typing import Dict, List, Tuple

# Directorio base de Pascual
PASCUAL_DIR = Path.home() / ".pascual"
CONFIG_DIR = PASCUAL_DIR / "config"
SHARED_DIR = PASCUAL_DIR / "shared"
LOGS_DIR = SHARED_DIR / "logs"
CACHE_DIR = SHARED_DIR / "cache"
TEMP_DIR = SHARED_DIR / "temp"

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / "cleanup.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("Pascual-Cleanup")

def load_policy() -> Dict:
    """Cargar política de limpieza"""
    policy_path = CONFIG_DIR / "sentinel_policy.json"
    try:
        with open(policy_path, "r") as f:
            policy = json.load(f)
            return policy.get("cleanup", {})
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Error al cargar política: {e}")
        return {
            "temp_files_max_age_days": 7,
            "logs_max_age_days": 30,
            "cache_max_size_gb": 10
        }

def cleanup_temp_files(max_age_days: int) -> Tuple[int, int]:
    """Limpiar archivos temporales antiguos"""
    if not TEMP_DIR.exists():
        return 0, 0

    deleted_count = 0
    freed_bytes = 0
    cutoff_time = time.time() - (max_age_days * 86400)  # días a segundos

    logger.info(f"Limpiando archivos temporales más antiguos de {max_age_days} días")

    for root, dirs, files in os.walk(TEMP_DIR):
        for file in files:
            file_path = Path(root) / file
            try:
                # Verificar fecha de modificación
                mtime = file_path.stat().st_mtime
                if mtime < cutoff_time:
                    size = file_path.stat().st_size
                    file_path.unlink()
                    deleted_count += 1
                    freed_bytes += size
                    logger.debug(f"Eliminado: {file_path} ({size} bytes)")
            except (FileNotFoundError, PermissionError) as e:
                logger.warning(f"No se pudo eliminar {file_path}: {e}")

    logger.info(f"Archivos temporales eliminados: {deleted_count} ({freed_bytes/1024/1024:.2f} MB)")
    return deleted_count, freed_bytes

def cleanup_logs(max_age_days: int) -> Tuple[int, int]:
    """Limpiar logs antiguos"""
    if not LOGS_DIR.exists():
        return 0, 0

    deleted_count = 0
    freed_bytes = 0
    cutoff_time = time.time() - (max_age_days * 86400)  # días a segundos

    # Lista de archivos de log activos que NO deben eliminarse
    active_logs = [
        "sentinel.log",
        "maestro.log",
        "installer.log"
    ]

    logger.info(f"Limpiando logs más antiguos de {max_age_days} días (excepto logs activos)")

    for root, dirs, files in os.walk(LOGS_DIR):
        for file in files:
            # No eliminar logs activos
            if file in active_logs:
                continue

            file_path = Path(root) / file
            try:
                # Verificar rotación de logs y fecha
                if file.endswith(".log.1") or file.endswith(".log.old") or ".log." in file:
                    mtime = file_path.stat().st_mtime
                    if mtime < cutoff_time:
                        size = file_path.stat().st_size
                        file_path.unlink()
                        deleted_count += 1
                        freed_bytes += size
                        logger.debug(f"Eliminado log: {file_path} ({size} bytes)")
            except (FileNotFoundError, PermissionError) as e:
                logger.warning(f"No se pudo eliminar {file_path}: {e}")

    logger.info(f"Archivos de log eliminados: {deleted_count} ({freed_bytes/1024/1024:.2f} MB)")
    return deleted_count, freed_bytes

def cleanup_cache(max_size_gb: int) -> Tuple[int, int]:
    """Limpiar caché si excede tamaño máximo"""
    if not CACHE_DIR.exists():
        return 0, 0

    # Calcular tamaño actual
    total_size = 0
    file_info = []

    for root, dirs, files in os.walk(CACHE_DIR):
        for file in files:
            file_path = Path(root) / file
            try:
                size = file_path.stat().st_size
                mtime = file_path.stat().st_mtime
                total_size += size
                file_info.append((file_path, size, mtime))
            except (FileNotFoundError, PermissionError):
                continue

    # Convertir a GB
    total_size_gb = total_size / (1024**3)

    # Verificar si excede límite
    if total_size_gb <= max_size_gb:
        logger.info(f"Caché dentro de límites: {total_size_gb:.2f} GB / {max_size_gb} GB")
        return 0, 0

    logger.info(f"Caché excede límite: {total_size_gb:.2f} GB / {max_size_gb} GB")

    # Ordenar por fecha de modificación (más antiguos primero)
    file_info.sort(key=lambda x: x[2])

    # Eliminar hasta estar por debajo del límite
    deleted_count = 0
    freed_bytes = 0
    target_bytes = int((total_size_gb - max_size_gb * 0.9) * (1024**3))  # Objetivo: 90% del máximo

    for file_path, size, _ in file_info:
        try:
            file_path.unlink()
            deleted_count += 1
            freed_bytes += size
            logger.debug(f"Eliminado caché: {file_path} ({size} bytes)")

            # Verificar si ya eliminamos suficiente
            if freed_bytes >= target_bytes:
                break
        except (FileNotFoundError, PermissionError) as e:
            logger.warning(f"No se pudo eliminar {file_path}: {e}")

    logger.info(f"Archivos de caché eliminados: {deleted_count} ({freed_bytes/1024/1024:.2f} MB)")
    return deleted_count, freed_bytes

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Utilidad de limpieza para Pascual-Bot")
    parser.add_argument("--force", action="store_true", help="Forzar limpieza ignorando políticas")
    parser.add_argument("--verbose", action="store_true", help="Modo verboso")
    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    logger.info("Iniciando limpieza de Pascual-Bot")

    # Cargar política
    policy = load_policy()

    # Ejecutar limpieza
    total_deleted = 0
    total_freed = 0

    # Limpiar archivos temporales
    temp_days = 1 if args.force else policy.get("temp_files_max_age_days", 7)
    deleted, freed = cleanup_temp_files(temp_days)
    total_deleted += deleted
    total_freed += freed

    # Limpiar logs antiguos
    log_days = 7 if args.force else policy.get("logs_max_age_days", 30)
    deleted, freed = cleanup_logs(log_days)
    total_deleted += deleted
    total_freed += freed

    # Limpiar caché
    cache_size = policy.get("cache_max_size_gb", 10) // 2 if args.force else policy.get("cache_max_size_gb", 10)
    deleted, freed = cleanup_cache(cache_size)
    total_deleted += deleted
    total_freed += freed

    # Resumen
    logger.info(f"Limpieza completada. Total: {total_deleted} archivos, {total_freed/1024/1024:.2f} MB liberados")
    print(f"Limpieza completada: {total_deleted} archivos eliminados, {total_freed/1024/1024:.2f} MB liberados")

if __name__ == "__main__":
    main()
EOF

    # Crear script para reportes
    cat > "$SENTINEL_DIR/generate_report.py" << 'EOF'
#!/usr/bin/env python3
"""
Generador de reportes para Pascual-Sentinel
Crea reportes de uso de recursos, alertas y estado del sistema
"""
import os
import sys
import json
import logging
import datetime
import argparse
from pathlib import Path
from typing import Dict, List, Any

# Directorio base de Pascual
PASCUAL_DIR = Path.home() / ".pascual"
SENTINEL_DIR = PASCUAL_DIR / "sentinel"
REPORTS_DIR = SENTINEL_DIR / "reports"

# Asegurar que existe el directorio de reportes
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("Sentinel-Report")

def load_status() -> Dict[str, Any]:
    """Cargar datos de status.json"""
    status_path = SENTINEL_DIR / "status.json"
    try:
        if status_path.exists():
            with open(status_path, "r") as f:
                return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Error al cargar status.json: {e}")

    return {}

def load_alerts() -> List[Dict[str, Any]]:
    """Cargar alertas recientes"""
    alerts_path = SENTINEL_DIR / "alerts" / "recent_alerts.json"
    try:
        if alerts_path.exists():
            with open(alerts_path, "r") as f:
                return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Error al cargar alertas: {e}")

    return []

def generate_text_report(days: int = 1) -> str:
    """Generar reporte en formato texto"""
    now = datetime.datetime.now()
    status = load_status()
    alerts = load_alerts()

    # Filtrar alertas por fecha
    cutoff = (now - datetime.timedelta(days=days)).isoformat()
    recent_alerts = [a for a in alerts if a.get("timestamp", "") >= cutoff]

    # Crear reporte
    report = []
    report.append("=" * 80)
    report.append(f"PASCUAL-BOT: REPORTE DE ESTADO - {now.strftime('%Y-%m-%d %H:%M')}")
    report.append("=" * 80)
    report.append("")

    # Estado actual
    report.append("ESTADO ACTUAL DEL SISTEMA")
    report.append("-" * 40)

    if status:
        # Recursos
        resources = status.get("resources", {})
        if "cpu" in resources:
            report.append(f"CPU: {resources['cpu'].get('percent', '?')}% utilización")

        if "memory" in resources:
            mem = resources["memory"]
            report.append(f"Memoria: {mem.get('used_gb', '?')}/{mem.get('total_gb', '?')} GB ({mem.get('percent', '?')}%)")

        if "disk" in resources:
            disk = resources["disk"]
            report.append(f"Disco: {disk.get('used_gb', '?')}/{disk.get('total_gb', '?')} GB ({disk.get('percent', '?')}%)")

        if "gpu" in resources:
            gpu = resources["gpu"]
            report.append(f"GPU: {gpu.get('name', '?')} - Temperatura: {gpu.get('temp', '?')}°C")

        report.append("")
        report.append(f"Estado general: {status.get('status', 'desconocido').upper()}")
    else:
        report.append("No hay datos de estado disponibles")

    report.append("")

    # Alertas recientes
    report.append(f"ALERTAS RECIENTES (últimos {days} días)")
    report.append("-" * 40)

    if recent_alerts:
        # Agrupar por nivel
        critical = [a for a in recent_alerts if a.get("level") == "critical"]
        warnings = [a for a in recent_alerts if a.get("level") == "warning"]

        report.append(f"Total alertas: {len(recent_alerts)} ({len(critical)} críticas, {len(warnings)} advertencias)")
        report.append("")

        # Mostrar críticas
        if critical:
            report.append("ALERTAS CRÍTICAS:")
            for alert in critical:
                timestamp = datetime.datetime.fromisoformat(alert.get("timestamp", "")).strftime("%Y-%m-%d %H:%M")
                report.append(f"- [{timestamp}] {alert.get('message', '?')}")
            report.append("")

        # Mostrar warnings
        if warnings:
            report.append("ADVERTENCIAS:")
            for alert in warnings[:5]:  # Limitar a 5
                timestamp = datetime.datetime.fromisoformat(alert.get("timestamp", "")).strftime("%Y-%m-%d %H:%M")
                report.append(f"- [{timestamp}] {alert.get('message', '?')}")

            if len(warnings) > 5:
                report.append(f"... y {len(warnings) - 5} advertencias más")
    else:
        report.append("No hay alertas recientes")

    report.append("")
    report.append("=" * 80)

    return "\n".join(report)

def generate_json_report(days: int = 1) -> Dict[str, Any]:
    """Generar reporte en formato JSON"""
    now = datetime.datetime.now()
    status = load_status()
    alerts = load_alerts()

    # Filtrar alertas por fecha
    cutoff = (now - datetime.timedelta(days=days)).isoformat()
    recent_alerts = [a for a in alerts if a.get("timestamp", "") >= cutoff]

    # Crear estructura de reporte
    report = {
        "timestamp": now.isoformat(),
        "period_days": days,
        "current_status": status.get("status", "unknown"),
        "resources": status.get("resources", {}),
        "alerts": {
            "total": len(recent_alerts),
            "critical": len([a for a in recent_alerts if a.get("level") == "critical"]),
            "warnings": len([a for a in recent_alerts if a.get("level") == "warning"]),
            "items": recent_alerts
        }
    }

    return report

def save_report(report_text: str, report_json: Dict[str, Any], days: int) -> str:
    """Guardar reporte en archivos"""
    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d")

    # Guardar versión texto
    text_file = REPORTS_DIR / f"report_{date_str}_{days}d.txt"
    with open(text_file, "w") as f:
        f.write(report_text)

    # Guardar versión JSON
    json_file = REPORTS_DIR / f"report_{date_str}_{days}d.json"
    with open(json_file, "w") as f:
        json.dump(report_json, f, indent=2)

    return str(text_file)

def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description="Generador de reportes para Pascual-Sentinel")
    parser.add_argument("--days", "-d", type=int, default=1, help="Días a incluir en el reporte")
    parser.add_argument("--output", "-o", help="Archivo de salida (opcional)")
    parser.add_argument("--json", action="store_true", help="Mostrar salida en JSON")
    args = parser.parse_args()

    # Generar reportes
    report_text = generate_text_report(args.days)
    report_json = generate_json_report(args.days)

    # Guardar reporte
    saved_path = save_report(report_text, report_json, args.days)

    # Mostrar resultado según formato solicitado
    if args.json:
        print(json.dumps(report_json, indent=2))
    else:
        print(report_text)

    print(f"\nReporte guardado en: {saved_path}")

if __name__ == "__main__":
    main()
EOF

    # Hacer ejecutables
    chmod +x "$SENTINEL_DIR/sentinel.py"
    chmod +x "$SENTINEL_DIR/cleanup.py"
    chmod +x "$SENTINEL_DIR/generate_report.py"
    chmod +x "$SENTINEL_DIR/monitors/resources.py"

    log_info "Archivos de Sentinel creados correctamente ✓"
    return 0
}

# Crear servicio systemd para Sentinel
create_sentinel_service() {
    log_step "Creando servicio systemd para Sentinel..."

    # Verificar ruta al intérprete de Python del entorno virtual
    PYTHON_PATH="$PASCUAL_DIR/venv/bin/python3"
    if [ ! -f "$PYTHON_PATH" ]; then
        log_warning "No se encontró Python en el entorno virtual. Usando sistema."
        PYTHON_PATH=$(which python3)
    fi

    # Crear archivo de servicio systemd
    sudo tee /etc/systemd/system/pascual-sentinel.service > /dev/null << EOF
[Unit]
Description=Pascual-Bot Sentinel (Monitoreo y Seguridad)
After=network.target pascual-maestro.service
Wants=pascual-maestro.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$SENTINEL_DIR
ExecStart=$PYTHON_PATH $SENTINEL_DIR/sentinel.py
Restart=always
RestartSec=30
Environment="PYTHONPATH=$PASCUAL_DIR"
Environment="SENTINEL_MODE=service"

[Install]
WantedBy=multi-user.target
EOF

    # Recargar systemd, habilitar y reiniciar servicio
    sudo systemctl daemon-reload
    sudo systemctl enable pascual-sentinel.service
    sudo systemctl restart pascual-sentinel.service

    # Verificar estado
    if sudo systemctl is-active pascual-sentinel.service > /dev/null; then
        log_info "Servicio Pascual-Sentinel iniciado y activo ✓"
    else
        log_warning "El servicio Pascual-Sentinel no pudo iniciarse correctamente"
        sudo systemctl status pascual-sentinel.service --no-pager
    fi

    log_info "Servicio systemd creado: pascual-sentinel.service"
    return 0
}

# Configurar limpieza programada con cron
setup_cron_jobs() {
    log_step "Configurando tareas programadas (cron)..."

    # Crear tarea para limpieza semanal
    CRON_CLEANUP="0 3 * * 0 $PYTHON_PATH $SENTINEL_DIR/cleanup.py >> $PASCUAL_DIR/shared/logs/cron_cleanup.log 2>&1"

    # Crear tarea para reportes diarios
    CRON_REPORT="0 8 * * * $PYTHON_PATH $SENTINEL_DIR/generate_report.py --days 1 >> $PASCUAL_DIR/shared/logs/cron_report.log 2>&1"

    # Añadir a crontab si no existen
    (crontab -l 2>/dev/null | grep -q "cleanup.py") || (crontab -l 2>/dev/null; echo "$CRON_CLEANUP") | crontab -
    (crontab -l 2>/dev/null | grep -q "generate_report.py") || (crontab -l 2>/dev/null; echo "$CRON_REPORT") | crontab -

    log_info "Tareas cron configuradas para limpieza y reportes ✓"
    return 0
}

# ============================================================================
# INICIO DEL SCRIPT
# ============================================================================

# Encabezado
echo "============================================================================"
echo "               PASCUAL-BOT: INSTALACIÓN DE SENTINEL                         "
echo "============================================================================"
echo ""

# Verificar fase anterior y cargar configuración
check_previous_phase
load_env
check_sudo

# Instalar dependencias
install_sentinel_dependencies

# Crear archivos de Sentinel
create_sentinel_files

# Crear servicio systemd
create_sentinel_service

# Configurar tareas cron
setup_cron_jobs

# Registrar fase completada
echo "FASE_9_COMPLETED=true" >> "$PASCUAL_CONFIG/.env"

log_info "✅ Pascual-Sentinel instalado y configurado correctamente"
log_info "Para verificar el estado del servicio, ejecuta:"
echo -e "${GREEN}   systemctl status pascual-sentinel.service${NC}"
echo ""
log_info "Para generar un informe del sistema, ejecuta:"
echo -e "${GREEN}   python3 $SENTINEL_DIR/generate_report.py${NC}"
echo ""
log_info "Para ejecutar limpieza manual, ejecuta:"
echo -e "${GREEN}   python3 $SENTINEL_DIR/cleanup.py${NC}"
echo ""
log_info "➡️  Siguiente paso: ejecutar ./10-dashboard-nextjs.sh"

# Remover trap al finalizar correctamente
trap - EXIT
exit 0