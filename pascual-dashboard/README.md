# Pascual-Bot Dashboard

Panel de control para Pascual-Bot, un sistema de IA local multi-usuario que proporciona visualización de datos, monitoreo del sistema y herramientas de gestión.

## Características Principales

- **Monitoreo de Seguridad**: Visualización del uso de recursos (CPU, RAM, almacenamiento)
- **Condor 360**: Asistente integral de inversiones con análisis de mercado, noticias financieras y alertas
- **Gestión de Agentes**: Configuración y monitoreo de agentes de IA especializados
- **Multi-usuario**: Soporte para múltiples usuarios con aislamiento completo de datos

## Estructura del Proyecto

```
pascual-dashboard/
├── app/                      # Directorio principal de Next.js App Router
│   ├── api/                  # API routes
│   │   ├── condor360/        # API para Condor 360 (inversiones)
│   │   └── system/           # API para monitoreo del sistema
│   ├── condor360/            # Asistente de inversiones
│   ├── dashboard/            # Panel de control principal
│   ├── security/             # Monitoreo de seguridad y recursos
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Página de inicio
├── components/               # Componentes reutilizables
│   ├── charts/               # Componentes de visualización de datos
│   ├── layout/               # Componentes de layout (sidebar, etc.)
│   └── ui/                   # Componentes de UI generales
├── lib/                      # Utilidades y funciones auxiliares
├── public/                   # Archivos estáticos
├── next.config.js            # Configuración de Next.js
├── package.json              # Dependencias y scripts
├── tailwind.config.js        # Configuración de Tailwind CSS
└── tsconfig.json             # Configuración de TypeScript
```

## Requisitos

- Node.js 16+
- npm o yarn
- Pascual-Bot instalado y configurado

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/pascual-bot.git
   cd pascual-bot/pascual-dashboard
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   ```

4. Construir para producción:
   ```bash
   npm run build
   npm start
   ```

## Tecnologías Utilizadas

- **Next.js**: Framework de React para aplicaciones web
- **Tailwind CSS**: Framework de utilidades CSS
- **Recharts**: Librería de gráficos para React
- **SWR**: Librería para fetching de datos con caché

## Integración con Pascual-Bot

El dashboard se comunica con Pascual-Bot a través de API endpoints expuestos por el sistema.
La configuración de conexión se encuentra en el archivo `.env.local` en la raíz del proyecto.

## Seguridad

El dashboard implementa:
- Autenticación de usuarios
- Aislamiento de datos entre usuarios
- HTTPS para comunicación segura
- Protección contra CSRF y XSS

## Licencia

Este proyecto está disponible bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.