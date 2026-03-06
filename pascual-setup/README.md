# 🤖 Pascual-Bot: Sistema de IA Local Multi-Usuario

Pascual-Bot es un sistema de asistente de IA local y privado, diseñado para funcionar 100% en hardware local, manteniendo total privacidad y soportando múltiples usuarios simultáneos con aislamiento completo de datos.

![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

## 🌟 Características Principales

- **100% Local y Privado**: Funciona completamente en tu hardware, sin enviar datos a servicios externos
- **Multi-Usuario con Aislamiento Total**: Cada usuario tiene su propio espacio de datos físicamente separado
- **IA Avanzada**: Utiliza modelos como Llama 3.2, Qwen2.5 y LLaVA para diferentes tareas
- **Interfaces Múltiples**: Interacción por voz (tipo Alexa), mensajería (Telegram) y dashboard web
- **Seguridad por Diseño**: Monitoreo proactivo y protección de datos con Sentinel
- **Memoria Persistente**: Recuerda conversaciones y prefiere las interacciones anteriores
- **Agentes Especializados**: Agentes dedicados para tareas específicas (Notion, Calendario, etc.)

## 🖥️ Arquitectura

```
ENTRADA (Usuario)
    ├─ Voz (Wake Word "Oye Pascual...")
    ├─ Telegram
    └─ Dashboard Web
           ↓
    PASCUAL-MAESTRO (Orquestador)
           ├─ Identifica usuario
           ├─ Enruta a perfil correcto
           └─ Delega a Base Agent
                ├─ Agentes Especializados
                ├─ Memoria Vectorial (ChromaDB)
                └─ Modelos IA (Ollama)
           ↓
    SENTINEL (Guardián)
           ├─ Monitoreo de recursos
           ├─ Seguridad y auditoría
           └─ Alertas proactivas
```

## 🛠️ Requisitos del Sistema

### Hardware Recomendado
- **CPU**: AMD Ryzen 9 7940HS o similar (8+ núcleos)
- **GPU**: AMD Radeon 780M o compatible con ROCm
- **RAM**: 32GB mínimo, 64GB recomendado
- **Almacenamiento**: 100GB+ de espacio libre (SSD recomendado)
- **Audio**: eMeet M0 Speakerphone o dispositivo de audio USB similar

### Software
- **OS**: Ubuntu 24.04 LTS (recomendado)
- **Python**: 3.10+ (instalado durante el proceso)
- **Node.js**: v18+ (instalado durante el proceso)
- **GPU Drivers**: ROCm para AMD (configurados durante el proceso)

## 📋 Preparación

Antes de iniciar la instalación, asegúrate de tener:

1. Un sistema Ubuntu 24.04 LTS limpio o con espacio suficiente
2. Conexión a Internet estable
3. Dispositivo de audio USB conectado (opcional para comandos de voz)
4. Acceso root/sudo para instalar dependencias

## 🚀 Instalación

La instalación de Pascual-Bot está dividida en fases secuenciales. Cada fase se encarga de un componente específico del sistema.

### Preparación Inicial

```bash
# Clonar el repositorio (si no lo has hecho ya)
git clone https://github.com/usuario/pascual-bot.git
cd pascual-bot/pascual-setup

# Otorgar permisos de ejecución a todos los scripts
chmod +x *.sh
chmod +x rollback/*.sh
```

### Fases de Instalación

Ejecuta los scripts en orden secuencial:

#### FASE 0: Preparación del Sistema (Manual)
```bash
./00-preparacion-sistema.sh
```
Sigue las instrucciones para configurar Ubuntu correctamente.

#### FASE 1: Estructura de Perfiles
```bash
./01-estructura-perfiles.sh
```
Crea la estructura de directorios con aislamiento multi-usuario.

#### FASE 2: Dependencias Base
```bash
./02-dependencias-base.sh
```
Instala paquetes y herramientas necesarias.

#### FASE 3: Ollama + AMD ROCm
```bash
./03-ollama-roc-amd.sh
```
Instala el motor de IA local Ollama con soporte para GPU AMD.

#### FASE 4: Modelos de IA
```bash
./04-modelos-ia.sh
```
Descarga modelos de IA (Llama 3.2, Qwen2.5, LLaVA).

#### FASE 5: Servicios de Voz
```bash
./05-servicios-voz.sh
```
Configura transcripción, síntesis de voz y wake word.

#### FASE 6: Memoria Vectorial
```bash
./06-memoria-vectorial.sh
```
Instala ChromaDB y modelos de embeddings.

#### FASE 7: Pascual-Maestro
```bash
./07-pascual-maestro.sh
```
Instala el orquestador central.

#### FASE 8: Agentes Base por Usuario
```bash
./08-agentes-base-usuario.sh
```
Configura agentes base para cada usuario.

#### FASE 9: Sentinel (Seguridad)
```bash
./09-sentinel-agente.sh
```
Instala el sistema de monitoreo y seguridad.

#### FASE 10: Dashboard Web
```bash
./10-dashboard-nextjs.sh
```
Instala interfaz web con NextJS.

#### FASE 11: Workflows Orchestrator
```bash
./11-workflows-orchestrator.sh
```
Configura motor de flujos de trabajo.

#### FASE 12: Skills Complementarios
```bash
./12-skills-complementarios.sh
```
Instala habilidades adicionales (OCR, PDF, visión).

## 🧪 Validación y Pruebas

Después de completar la instalación, verifica que todo funcione correctamente:

### Verificar Servicios
```bash
# Comprobar estado de servicios principales
systemctl status pascual-maestro.service
systemctl status pascual-sentinel.service

# Ver logs
journalctl -u pascual-maestro.service -f
```

### Probar Reconocimiento de Voz
```bash
# Ejecutar script de prueba de voz
python3 ~/.pascual/master/test-voice.py
```

### Acceder al Dashboard Web
```bash
# Iniciar dashboard en modo desarrollo
cd ~/.pascual/dashboard && npm run dev

# Acceder desde navegador
# http://localhost:38472
```

## 🎭 Uso Básico

### Interacción por Voz
- Usa la wake word "Oye Pascual" seguida de tu comando
- Consulta el [README-COMANDOS-VOZ.md](./README-COMANDOS-VOZ.md) para más detalles

### Dashboard Web
- Accede a `http://localhost:38472` (puerto configurable)
- Inicia sesión con las credenciales de usuario

### Telegram (opcional)
- Configura tu bot de Telegram en `~/.pascual/config/telegram_config.json`
- Actualiza tu `chat_id` en `~/.pascual/config/routing.json`

## 🔧 Configuración Avanzada

### Añadir Nuevos Usuarios
```bash
# Editar archivo de enrutamiento
nano ~/.pascual/config/routing.json

# Crear estructura para el nuevo usuario
mkdir -p ~/.pascual/users/nuevo_usuario/{config,agents,tasks,data,logs,sandbox,vector_index}
chmod 750 ~/.pascual/users/nuevo_usuario
```

### Configurar API Keys (Opcionales)
Edita el archivo de variables de entorno:
```bash
nano ~/.pascual/config/.env
```

Configura las siguientes variables según necesites:
```
PICOVOICE_ACCESS_KEY="tu-clave-aquí"  # Para wake word
TELEGRAM_BOT_TOKEN="tu-token-aquí"    # Para integración Telegram
NOTION_API_KEY="tu-clave-aquí"        # Para integración Notion
```

## ⚠️ Solución de Problemas

### Servicios Caídos
```bash
# Reiniciar servicios
sudo systemctl restart pascual-maestro.service
sudo systemctl restart pascual-sentinel.service
```

### Problemas de Permisos
```bash
# Verificar y restaurar permisos
chmod 750 ~/.pascual/users/*
chmod 755 ~/.pascual/shared
chmod 644 ~/.pascual/config/*.json
chmod 600 ~/.pascual/config/.env
```

### Rollback (Revertir Instalación)
Si necesitas revertir una fase específica:
```bash
# Rollback de una fase específica
./rollback/rollback-phase-1.sh  # Ejemplo: revertir estructura de perfiles

# Rollback completo (elimina toda la instalación)
./rollback/rollback-complete.sh
```

## 📄 Licencia

Este proyecto está disponible bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Proyecto Ollama por el motor de IA local
- Equipos detrás de Llama 3.2, Qwen2.5 y LLaVA
- Comunidad de IA local y privada

---

Por cualquier problema o sugerencia, por favor abre un issue en el repositorio. ¡Disfruta tu asistente de IA personal y privado!