"use client";

import { ClockIcon } from '@heroicons/react/24/outline';

const timelineEvents = [
  {
    id: '1',
    time: '17:30',
    date: 'Hoy',
    title: 'Reporte diario generado',
    description: 'El agente Atlas completó la generación del reporte de métricas diarias.',
    agent: 'atlas',
    type: 'completed',
  },
  {
    id: '2',
    time: '15:45',
    date: 'Hoy',
    title: 'Nueva conversación iniciada',
    description: 'Carlos M. inició una conversación sobre reportes de ventas.',
    agent: 'system',
    type: 'info',
  },
  {
    id: '3',
    time: '14:20',
    date: 'Hoy',
    title: 'Tarea asignada a Sentinel',
    description: 'QA review del nuevo módulo de alertas.',
    agent: 'sentinel',
    type: 'pending',
  },
  {
    id: '4',
    time: '12:00',
    date: 'Hoy',
    title: 'Backup completado',
    description: 'Backup automático de la base de datos completado exitosamente.',
    agent: 'ops',
    type: 'completed',
  },
  {
    id: '5',
    time: '10:30',
    date: 'Hoy',
    title: 'Nuevo cliente registrado',
    description: 'TechCorp se unió como cliente del plan Enterprise.',
    agent: 'herald',
    type: 'success',
  },
  {
    id: '6',
    time: '09:15',
    date: 'Hoy',
    title: 'Sistema iniciado',
    description: 'Todos los agentes están en línea y operativos.',
    agent: 'system',
    type: 'info',
  },
  {
    id: '7',
    time: '23:45',
    date: 'Ayer',
    title: 'Mantenimiento completado',
    description: 'Actualización de seguridad aplicada a todos los servicios.',
    agent: 'ops',
    type: 'completed',
  },
  {
    id: '8',
    time: '18:00',
    date: 'Ayer',
    title: 'Reporte semanal enviado',
    description: 'Resumen de actividad enviado a todos los stakeholders.',
    agent: 'iris',
    type: 'completed',
  },
];

const getTypeStyles = (type: string) => {
  switch (type) {
    case 'completed':
      return 'border-green-500 bg-green-500/10';
    case 'pending':
      return 'border-yellow-500 bg-yellow-500/10';
    case 'success':
      return 'border-cyan-500 bg-cyan-500/10';
    case 'info':
    default:
      return 'border-[#1e3a5f] bg-[#1e3a5f]/10';
  }
};

const getDotColor = (type: string) => {
  switch (type) {
    case 'completed':
      return 'bg-green-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'success':
      return 'bg-cyan-500';
    case 'info':
    default:
      return 'bg-gray-500';
  }
};

export default function TimelinePage() {
  let currentDate = '';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <ClockIcon className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-white font-display">Línea de Tiempo</h1>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[#1e3a5f]"></div>

        {/* Events */}
        <div className="space-y-4">
          {timelineEvents.map((event, index) => {
            const showDateHeader = event.date !== currentDate;
            currentDate = event.date;

            return (
              <div key={event.id}>
                {showDateHeader && (
                  <div className="flex items-center gap-4 mb-4 ml-10">
                    <span className="text-cyan-400 font-medium">{event.date}</span>
                    <div className="flex-1 h-px bg-[#1e3a5f]/50"></div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Dot */}
                  <div className={`w-10 h-10 rounded-full ${getDotColor(event.type)} flex items-center justify-center flex-shrink-0 relative z-10`}>
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 card p-4 border-l-2 ${getTypeStyles(event.type)}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-white font-medium">{event.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">{event.description}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-600 text-sm">{event.time}</span>
                        {event.agent !== 'system' && (
                          <span className="px-2 py-1 rounded text-xs bg-[#1e3a5f]/30 text-cyan-400">
                            {event.agent}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}