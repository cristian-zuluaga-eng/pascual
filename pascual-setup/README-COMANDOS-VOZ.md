# 🗣️ Comandos de Voz para Pascual-Bot

Este documento detalla los comandos de voz disponibles para interactuar con Pascual-Bot. La interfaz de voz permite un control natural y conversacional de todas las funcionalidades del sistema.

## 🎤 Configuración Inicial

### Wake Word
Para activar Pascual-Bot, utiliza la frase de activación (wake word) configurada para tu usuario:

```
"Oye Pascual..." (usuario predeterminado)
"Hey Asistente..." (usuarios adicionales)
```

La wake word puede personalizarse editando el archivo `~/.pascual/config/routing.json`.

### Configuración por Voz

```
"Oye Pascual, activa mi perfil"
"Oye Pascual, soy [tu nombre]"
"Oye Pascual, guarda que prefiero respuestas en español"
"Oye Pascual, mi zona horaria es Bogotá"
"Oye Pascual, usa voz femenina para las respuestas"
```

## 📋 Comandos Generales

### Consultas Básicas
```
"Oye Pascual, ¿qué hora es?"
"Oye Pascual, ¿qué día es hoy?"
"Oye Pascual, ¿cuál es la temperatura actual?"
"Oye Pascual, resume las noticias de hoy"
```

### Control del Sistema
```
"Oye Pascual, sube el volumen"
"Oye Pascual, baja el volumen"
"Oye Pascual, silencio por favor"
"Oye Pascual, reinicia el servicio de voz"
```

### Ayuda y Soporte
```
"Oye Pascual, ayuda"
"Oye Pascual, ¿qué puedes hacer?"
"Oye Pascual, muestra comandos disponibles"
"Oye Pascual, cómo funcionan las tareas"
```

## 👤 Gestión de Agentes

### Crear y Configurar Agentes
```
"Oye Pascual, crea un agente que me ayude con Notion"
"Oye Pascual, registra un agente financiero para mis inversiones"
"Oye Pascual, crea un agente de calendario para mis reuniones"
"Oye Pascual, configura mi agente de tareas"
```

### Activar/Desactivar Agentes
```
"Oye Pascual, activa el agente financiero"
"Oye Pascual, desactiva el agente de Notion temporalmente"
"Oye Pascual, pausa todos los agentes"
"Oye Pascual, reanuda todos los agentes"
```

### Consultar Agentes Específicos
```
"Oye Pascual, pregunta al agente financiero: ¿cómo van mis acciones?"
"Oye Pascual, qué dice el agente de proyecto sobre los plazos"
"Oye Pascual, dile a mi agente de calendario que muestre mi agenda de hoy"
```

### Modo Implícito (Recomendado)
No es necesario especificar el agente, Pascual detectará automáticamente a quién dirigir la consulta:

```
"¿Cómo van mis acciones hoy?" → Auto-detecta agente financiero
"Añade esta tarea a Notion" → Auto-detecta agente Notion
"Agenda reunión mañana a las 3pm" → Auto-detecta agente calendario
"Recuérdame comprar leche" → Auto-detecta agente de recordatorios
```

## 📚 Memoria e Historial

### Consultar Historial
```
"Oye Pascual, ¿qué hablamos sobre el presupuesto la semana pasada?"
"Oye Pascual, muestra los acuerdos de la reunión del martes"
"Oye Pascual, ¿qué tareas te pedí ayer?"
```

### Gestionar Memoria
```
"Oye Pascual, limpia mi caché de conversaciones antiguas"
"Oye Pascual, exporta mi historial de este mes"
"Oye Pascual, ¿cuánto espacio ocupa mi historial?"
"Oye Pascual, borra la conversación sobre el proyecto Alpha"
```

### Búsqueda Semántica
```
"Oye Pascual, busca donde hablamos de riesgos del proyecto"
"Oye Pascual, ¿mencionamos algo sobre proveedores el mes pasado?"
"Oye Pascual, encuentra referencias a la reunión con Juan"
```

## ✅ Tareas y Workflows

### Gestionar Tareas
```
"Oye Pascual, añade tarea: comprar leche mañana"
"Oye Pascual, recuérdame llamar a Juan el viernes"
"Oye Pascual, crea tarea prioritaria: entregar informe lunes"
"Oye Pascual, marca como completada la tarea de enviar correo"
```

### Consultar Tareas
```
"Oye Pascual, ¿qué tareas tengo hoy?"
"Oye Pascual, muestra tareas pendientes de esta semana"
"Oye Pascual, ¿cuáles son mis tareas prioritarias?"
"Oye Pascual, ¿cuándo debo entregar el informe?"
```

### Ejecutar Workflows
```
"Oye Pascual, ejecuta el workflow de backup semanal"
"Oye Pascual, inicia el proceso de reporte mensual"
"Oye Pascual, prepara el onboarding para nuevo usuario"
```

## 🔒 Sentinel (Seguridad)

### Consultar Estado del Sistema
```
"Oye Pascual, ¿cómo está la salud del sistema?"
"Oye Pascual, ¿hay alertas de seguridad pendientes?"
"Oye Pascual, ¿cuánto espacio libre queda en disco?"
"Oye Pascual, ¿cómo está el uso de CPU?"
```

### Acciones de Sentinel
```
"Oye Pascual, ejecuta limpieza de caché"
"Oye Pascual, genera reporte de actividad de la semana"
"Oye Pascual, ¿quién accedió a mi cuenta hoy?"
"Oye Pascual, bloquea temporalmente el acceso remoto"
```

## 📊 Dashboard

### Visualización de Datos
```
"Oye Pascual, muestra mis tareas en el dashboard"
"Oye Pascual, actualiza el dashboard con mis últimas actividades"
"Oye Pascual, envía el dashboard a mi correo"
```

## 👪 Multi-Usuario

### Cambio de Perfil
```
"Oye Pascual, cambiar a perfil de [nombre]"
"Oye Pascual, cerrar mi sesión"
"Oye Pascual, ¿quién está activo ahora?"
```

### Verificar Aislamiento
```
"Oye Pascual, ¿quién más tiene acceso a mis datos?"
"Oye Pascual, muestra usuarios activos en el sistema"
```

## 🖼️ Procesamiento Visual

### Análisis de Imágenes
```
"Oye Pascual, describe esta imagen"
"Oye Pascual, qué objetos hay en esta foto"
"Oye Pascual, lee el texto de esta captura de pantalla"
```

### Procesamiento de Documentos
```
"Oye Pascual, extrae el texto de este PDF"
"Oye Pascual, resume este documento"
"Oye Pascual, busca la sección sobre presupuestos en este PDF"
```

## 🔄 Integración con Servicios Externos

### Notion
```
"Oye Pascual, añade esta nota a Notion"
"Oye Pascual, busca en mi base de datos de Notion"
"Oye Pascual, crea una nueva página en Notion"
```

### Calendario
```
"Oye Pascual, agenda una reunión mañana a las 3 PM"
"Oye Pascual, muestra mi agenda para hoy"
"Oye Pascual, recuérdame el evento de mañana"
```

## 📝 Consejos para Interacciones por Voz

1. **Sé Claro y Conciso**
   - Habla con naturalidad, pero evita frases demasiado largas o complejas.
   - Articula claramente, especialmente nombres propios o términos técnicos.

2. **Espera la Confirmación**
   - Pascual confirmará cuando esté procesando tu comando.
   - Espera a que termine de responder antes de dar un nuevo comando.

3. **Reformula si No Entiende**
   - Si Pascual no entiende tu comando, intenta reformularlo de manera más simple.
   - Utiliza sinónimos o términos alternativos si es necesario.

4. **Corrige Errores**
   - Si Pascual interpreta mal un comando, di "Corrección" y repite el comando.
   - Puedes decir "Cancela" para detener una acción en curso.

5. **Usa Referencias Temporales Claras**
   - Sé específico con fechas y horas: "mañana a las 3 PM" en lugar de "más tarde".
   - Para referencias relativas, usa términos como "próximo lunes" o "en 3 días".

## 🔄 Actualización de Comandos

Este documento se actualizará regularmente con nuevos comandos y funcionalidades. Puedes consultar la versión más reciente ejecutando:

```
"Oye Pascual, muestra los comandos de voz disponibles"
```

O revisando el archivo en:

```
~/.pascual/docs/comandos_voz.md
```