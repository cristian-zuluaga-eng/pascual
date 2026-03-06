# Pascual-Bot - Especificaciones del Sistema

> **Arquitectura de Sistema de IA Local y Privada**

---

## Tabla de Contenidos

1. [Contexto y Propósito](#contexto-y-propósito)
2. [Requisitos Arquitectónicos](#requisitos-arquitectónicos)
3. [Fases de Implementación](#fases-de-implementación)
4. [Features del Sistema](#features-del-sistema)
5. [Restricciones y Límites](#restricciones-y-límites)
6. [Criterios de Aceptación](#criterios-de-aceptación)
7. [Entregables](#entregables)
8. [Notas Técnicas](#notas-técnicas)

---

## Contexto y Propósito

### Hardware Objetivo
- **Servidor**: UM790 Pro
- **CPU**: AMD Ryzen 9
- **GPU**: Radeon 780M (integrada)
- **RAM**: 32GB mínimo, 64GB recomendado

### Objetivo Principal
Crear un sistema que funcione como un **"cerebro digital compartido"** para hogar/empresa, donde:
- Cada usuario tiene su propia memoria, preferencias, agentes e historial
- Ningún usuario puede acceder a información de otro usuario
- Se comparten eficientemente los recursos de procesamiento (modelos de IA, GPU, almacenamiento)

### Principios Fundamentales
- ✅ **100% Local**: Sin dependencia de APIs externas
- ✅ **Privacidad Total**: Datos nunca salen del servidor
- ✅ **Multi-Usuario**: Soporte simultáneo con aislamiento completo
- ✅ **Extensible**: Fácil agregar usuarios, agentes y funcionalidades

---

## Requisitos Arquitectónicos

### 1. Aislamiento Multi-Usuario (NO NEGOCIABLE)

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR PASCUAL                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Usuario A   │  │  Usuario B   │  │  Usuario C   │       │
│  │  ──────────  │  │  ──────────  │  │  ──────────  │       │
│  │  • Historial │  │  • Historial │  │  • Historial │       │
│  │  • Agentes   │  │  • Agentes   │  │  • Agentes   │       │
│  │  • Configs   │  │  • Configs   │  │  • Configs   │       │
│  │  • Memoria   │  │  • Memoria   │  │  • Memoria   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│           │                │                │                │
│           └────────────────┼────────────────┘                │
│                            │                                 │
│                    ┌───────▼───────┐                        │
│                    │   RECURSOS    │                        │
│                    │  COMPARTIDOS  │                        │
│                    │  (Solo lectura)│                        │
│                    │  • Modelos IA │                        │
│                    │  • Caché      │                        │
│                    └───────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

**Reglas**:
- Cada usuario tiene su propio espacio de datos físicamente separado
- Conversaciones, tareas, agentes y configuraciones son invisibles entre usuarios
- El sistema valida identidad en cada solicitud
- Agentes especializados requieren permiso explícito para compartirse

### 2. Orquestación en Tres Niveles

```
                        ┌─────────────────┐
                        │  NIVEL 1        │
                        │  Pascual-Maestro│
                        │  (Enrutador)    │
                        └────────┬────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
     │   NIVEL 2      │ │   NIVEL 2      │ │   NIVEL 2      │
     │  Agente Base   │ │  Agente Base   │ │  Agente Base   │
     │  Usuario A     │ │  Usuario B     │ │  Usuario C     │
     └───────┬────────┘ └───────┬────────┘ └───────┬────────┘
             │                  │                  │
    ┌────────┼────────┐        ...                ...
    │        │        │
    ▼        ▼        ▼
┌──────┐ ┌──────┐ ┌──────┐    NIVEL 3
│Doc.  │ │Finan.│ │Calen.│    Agentes
└──────┘ └──────┘ └──────┘    Especializados
```

**Nivel 1 - Maestro**:
- Identifica usuario por canal y credencial
- Dirige solicitud al perfil correcto
- NO almacena datos

**Nivel 2 - Agente Base por Usuario**:
- Conoce contexto, preferencias e historial del usuario
- Decide si responder directo o delegar a especializado

**Nivel 3 - Agentes Especializados**:
- Calendario, Finanzas, Legal, etc.
- Se activan según necesidad del usuario

### 3. Memoria Persistente e Inteligente

| Característica | Descripción |
|----------------|-------------|
| **Almacenamiento** | Todo lo hablado, escrito o procesado se guarda |
| **Búsqueda Semántica** | Por significado, no solo palabras clave |
| **Consulta Contextual** | Agentes consultan historial para respuestas relevantes |
| **Retención Configurable** | Ej: eliminar audio 30 días, mantener texto indefinidamente |

### 4. Interfaces Múltiples Unificadas

```
┌─────────────────────────────────────────────────────────────┐
│                      INTERFACES                              │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│    VOZ      │   TELEGRAM  │    SLACK    │    DASHBOARD      │
│  "Oye       │   Bot con   │  (Opcional) │   Web NextJS      │
│  Pascual"   │  push-talk  │             │   con auth JWT    │
└──────┬──────┴──────┬──────┴──────┬──────┴─────────┬─────────┘
       │             │             │                │
       └─────────────┴──────┬──────┴────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │    BACKEND     │
                   │    UNIFICADO   │
                   │  (Mismo        │
                   │   historial)   │
                   └────────────────┘
```

### 5. Seguridad por Diseño

| Aspecto | Implementación |
|---------|----------------|
| **Datos** | Nada sale del servidor sin configuración explícita |
| **Acceso Remoto** | Solo vía túnel seguro (Tailscale preferido) |
| **Puertos** | Cambio de puertos por defecto (nada estándar) |
| **Autenticación** | JWT con sesiones por usuario |
| **Auditoría** | Logs de quién accedió a qué y cuándo |
| **Monitoreo** | Agente Sentinel detecta anomalías y alerta |

### 6. Extensibilidad sin Ruptura

- ✅ Nuevos usuarios: crear perfil, sin modificar núcleo
- ✅ Nuevos agentes: registrar en perfil, sin reiniciar sistema
- ✅ Nuevos workflows: configuración declarativa (YAML/JSON)
- ✅ Actualizaciones: sin tiempo de inactividad

---

## Fases de Implementación

> ⚠️ **ORDEN OBLIGATORIO**: Cada fase depende de la anterior

### FASE 0 — Preparación del Sistema
```bash
# Script: 00-preparacion-sistema.sh
```
- [ ] Instalar Ubuntu 24.04 LTS
- [ ] Configurar usuario de servicio dedicado (no root)
- [ ] Variables de entorno para GPU AMD: `HSA_OVERRIDE_GFX_VERSION=11.0.0`
- [ ] Firewall básico: denegar todo, permitir solo necesario

### FASE 1 — Estructura de Perfiles
```bash
# Script: 01-estructura-perfiles.sh
```
- [ ] Crear directorio base: `~/.pascual/`
- [ ] Subdirectorios por usuario con permisos separados
- [ ] Recursos compartidos (modelos, caché) con permisos solo lectura
- [ ] Archivo de enrutamiento global (canales → usuarios)

### FASE 2 — Motor de IA
```bash
# Script: 02-dependencias-base.sh
# Script: 03-ollama-roc-amd.sh
# Script: 04-modelos-ia.sh
```
- [ ] Instalar OpenClaw: `curl -fsSL https://openclaw.ai/install.sh | bash`
- [ ] Instalar Ollama como motor unificado
- [ ] Descargar modelos:
  - Llama 3.2 3B (rápido)
  - Qwen2.5 7B (balance)
  - LLaVA 7B (visión)
- [ ] Configurar Ollama para GPU AMD vía ROCm
- [ ] Verificar ejecución en GPU, no CPU

### FASE 3 — Servicios de Voz
```bash
# Script: 05-servicios-voz.sh
```
- [ ] Instalar faster-whisper (transcripción)
- [ ] Instalar Piper TTS (síntesis en español)
- [ ] Instalar Picovoice Porcupine (wake word)
- [ ] Configurar dispositivo audio USB (eMeet M0)
- [ ] Probar flujo: wake word → grabación → transcripción → respuesta

### FASE 4 — Memoria Vectorial
```bash
# Script: 06-memoria-vectorial.sh
```
- [ ] Instalar ChromaDB o LanceDB
- [ ] Descargar modelo embeddings: `paraphrase-multilingual-MiniLM-L12-v2`
- [ ] Crear índice vectorial separado por usuario
- [ ] Implementar búsqueda semántica con filtro por usuario

### FASE 5 — Orquestador Principal
```bash
# Script: 07-pascual-maestro.sh
```
- [ ] Implementar Pascual-Maestro (identifica usuario, enruta)
- [ ] Maestro NO almacena datos
- [ ] Registrar como servicio systemd

### FASE 6 — Agentes Base por Usuario
```bash
# Script: 08-agentes-base-usuario.sh
```
- [ ] Crear agente base por usuario
- [ ] Gestión de contexto y enrutamiento
- [ ] Conoce preferencias, historial, permisos

### FASE 7 — Sentinel (Seguridad)
```bash
# Script: 09-sentinel-agente.sh
```
- [ ] Monitoreo: CPU, RAM, disco, temperatura GPU
- [ ] Detección de anomalías de seguridad
- [ ] Limpieza automática de caché
- [ ] Alertas por Telegram y dashboard
- [ ] Logs estructurados para auditoría

### FASE 8 — Dashboard Web
```bash
# Script: 10-dashboard-nextjs.sh
```
- [ ] NextJS 14+ (App Router, TypeScript, Tailwind)
- [ ] Autenticación JWT con HttpOnly cookies
- [ ] WebSocket para tiempo real
- [ ] Widgets configurables por usuario
- [ ] Aislamiento de datos entre usuarios

### FASE 9 — Workflows Orchestrator
```bash
# Script: 11-workflows-orchestrator.sh
```
- [ ] Motor de flujos multi-paso entre agentes
- [ ] Flujos definidos en YAML (declarativo)
- [ ] Soporte: secuencial, paralelo, condicional, iterativo
- [ ] Auditoría de input/output por paso

### FASE 10 — Acceso Remoto Seguro
```bash
# Script: 12-skills-complementarios.sh
# Script: 13-validacion-final.sh
```
- [ ] Instalar Tailscale en servidor y dispositivos
- [ ] Solo dispositivos autorizados
- [ ] Cambiar puerto del dashboard (no usar 3000)
- [ ] HTTPS automático vía Tailscale
- [ ] Opcional: 2FA para acceso remoto

---

## Features del Sistema

### 🎤 Voz y Audio

| Feature | Descripción |
|---------|-------------|
| Wake Word | Personalizada por usuario ("Oye Pascual", "Hola Asistente") |
| Transcripción | Reuniones completas con diarización (quién dijo qué) |
| TTS | Respuestas naturales en español, acento configurable |
| VAD | Detección automática de fin de habla |

### 💬 Texto y Mensajería

| Feature | Descripción |
|---------|-------------|
| Telegram | Comandos de voz y texto remoto |
| Slack | Opcional |
| TTS Opcional | Solicitar audio en lugar de texto |

### 👁️ Visión y Multi-Modal

| Feature | Descripción |
|---------|-------------|
| Imágenes | Descripción, OCR, detección de objetos |
| PDF | Extracción, resumen, búsqueda semántica |
| Video | Audio + transcripción + análisis de frames |
| Q&A | "¿Qué dice este contrato?", "¿Qué muestra este gráfico?" |

### 🧠 Memoria e Historial

| Feature | Descripción |
|---------|-------------|
| Almacenamiento | Todas las conversaciones |
| Búsqueda Semántica | "¿Qué hablamos sobre presupuestos?" |
| Resúmenes | Automáticos de reuniones largas |
| Exportación | JSON, CSV, PDF con anonimización opcional |
| Citas | Referencias al origen en respuestas |

### 🤖 Agentes Especializados

| Agente | Función |
|--------|---------|
| **Calendario** | Agendar reuniones, recordatorios, consultar disponibilidad |
| **Financiero** | Analizar gastos, interpretar reportes, alertar desviaciones |
| **Proyecto** | Extraer acciones, asignar responsables, seguir plazos |
| **Legal** | Revisar contratos, detectar cláusulas riesgosas |

> 📝 Cada agente se registra en el perfil del usuario, NO es global

### 📊 Dashboard

| Feature | Descripción |
|---------|-------------|
| Tareas | Vista Kanban (pendiente, progreso, completado) |
| Gráficas | Actividad por agente, semana/mes |
| Métricas | RAM, CPU, disco por usuario |
| Seguridad | Panel con alertas de Sentinel |
| Preferencias | Voz, notificaciones, temas por usuario |

### 🛡️ Sentinel (Seguridad)

| Feature | Descripción |
|---------|-------------|
| Monitoreo | Tiempo real de recursos |
| Detección | Intentos de acceso cruzado |
| Alertas | Proactivas antes de fallos (disco 80%, RAM 90%) |
| Limpieza | Automática de caché y logs |
| Backup | Automático de configuraciones críticas |
| Auditoría | Quién accedió a qué y cuándo |

### ⚙️ Workflows Orquestados

| Feature | Descripción |
|---------|-------------|
| Predefinidos | "onboarding_usuario", "backup_semanal", "reporte_mensual" |
| Personalizables | Via YAML por usuario |
| Reintentos | Automáticos con backoff exponencial |
| Compensación | Rollback si paso posterior falla |
| Aprobación | Notificación cuando requiere humano |

### 🔐 Acceso Remoto Seguro

| Feature | Descripción |
|---------|-------------|
| Tailscale | Autenticación obligatoria |
| Puerto | No estándar (ej: 38472) |
| HTTPS | Forzado para conexiones remotas |
| Rate Limiting | Prevención de fuerza bruta |
| 2FA | Opcional con TOTP (Google Authenticator) |
| Lista Blanca | Dispositivos autorizados |

---

## Restricciones y Límites

### ❌ PROHIBIDO

| Restricción | Razón |
|-------------|-------|
| APIs externas de IA | Privacidad, dependencia |
| Datos en la nube | Todo debe ser local |
| Acceso cruzado entre usuarios | Ni por error ni por diseño |
| Puertos estándar expuestos | 22, 80, 443, 3000 |
| Agentes sin validación | Requieren permisos del dueño |
| Eliminar historial sin confirmación | Protección de datos |

---

## Criterios de Aceptación

### ✅ El sistema funciona cuando:

| Criterio | Verificación |
|----------|--------------|
| Multi-usuario | Dos usuarios hablan simultáneamente sin mezclar conversaciones |
| Historial preciso | Usuario A recibe respuestas con citas al origen |
| Aislamiento | Usuario A NO puede ver datos de Usuario B |
| Wake word | Detectada consistentemente desde ~2-3 metros |
| Latencia voz | Respuesta en <3 segundos para consultas comunes |
| Dashboard RT | Actualizaciones en <500ms |
| Sentinel | Alerta antes de disco lleno o RAM saturada |
| Acceso remoto | Funciona desde cualquier lugar vía Tailscale |
| Resiliencia | Reiniciar servidor no pierde configuraciones |
| Escalabilidad | Añadir usuario en <15 minutos sin modificar núcleo |

---

## Entregables

### Archivos Requeridos

```
pascual-setup/
├── 00-preparacion-sistema.sh
├── 01-estructura-perfiles.sh
├── 02-dependencias-base.sh
├── 03-ollama-roc-amd.sh
├── 04-modelos-ia.sh
├── 05-servicios-voz.sh
├── 06-memoria-vectorial.sh
├── 07-pascual-maestro.sh
├── 08-agentes-base-usuario.sh
├── 09-sentinel-agente.sh
├── 10-dashboard-nextjs.sh
├── 11-workflows-orchestrator.sh
├── 12-skills-complementarios.sh
├── 13-validacion-final.sh
├── rollback/
│   ├── rollback-phase-1.sh
│   ├── rollback-phase-3.sh
│   ├── rollback-phase-7.sh
│   ├── rollback-phase-9.sh
│   └── rollback-complete.sh
├── README.md
├── README-COMANDOS-VOZ.md
└── LICENSE
```

### Documentación

1. **README principal** con instrucciones paso a paso
2. **README de comandos de voz** con ejemplos de uso diario
3. **Templates de configuración**:
   - `routing.json`
   - `sentinel_policy.json`
   - `workflows/*.yaml`
4. **Dashboard NextJS** funcional con autenticación y tiempo real
5. **Sistema de rollback** para cada fase
6. **Guía de extensión**: cómo añadir usuarios, agentes y workflows

---

## Notas Técnicas

### Recomendaciones de Implementación

| Aspecto | Recomendación |
|---------|---------------|
| Fase inicial | Priorizar simplicidad, complejizar después |
| Scripts | Verificar fase anterior antes de ejecutar |
| Logs | Estructurados (JSON) para análisis por Sentinel |
| RAM | 32GB mínimo, 64GB para escalar |
| Código | Comentado en español |
| Secretos | Archivos separados, permisos 600 |

### Variables de Entorno Críticas

```bash
# GPU AMD
export HSA_OVERRIDE_GFX_VERSION=11.0.0

# Rutas base
export PASCUAL_DIR="$HOME/.pascual"
export PASCUAL_CONFIG="$PASCUAL_DIR/config"
export PASCUAL_LOG="$PASCUAL_DIR/shared/logs"

# Puertos (no estándar)
export DASHBOARD_PORT=38472
export OLLAMA_PORT=11434
```

### Estructura de Directorios

```
~/.pascual/
├── config/
│   ├── .env
│   ├── routing.json
│   └── sentinel_policy.json
├── shared/
│   ├── models/
│   ├── cache/
│   └── logs/
├── users/
│   ├── usuario_a/
│   │   ├── memory/
│   │   ├── agents/
│   │   ├── history/
│   │   └── config/
│   └── usuario_b/
│       └── ...
├── sentinel/
│   ├── status.json
│   └── alerts/
└── dashboard/
    └── (NextJS app)
```

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-03-05 | Especificación inicial completa |

---

> **Autor**: Claude (Arquitecto de Sistemas)
> **Proyecto**: Pascual-Bot
> **Licencia**: MIT