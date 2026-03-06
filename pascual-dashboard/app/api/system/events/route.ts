import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const severity = url.searchParams.get('severity'); // 'low', 'medium', 'high'
    const type = url.searchParams.get('type'); // 'alert', 'warning', 'info'

    // Mock data for development
    const allEvents = [
      { id: 1, type: 'alert', message: 'Pico de uso de CPU detectado', timestamp: '2026-03-05T14:23:12Z', severity: 'medium' },
      { id: 2, type: 'info', message: 'Respaldo automático completado', timestamp: '2026-03-05T12:00:00Z', severity: 'low' },
      { id: 3, type: 'warning', message: 'Uso de disco superior al 80%', timestamp: '2026-03-05T09:45:33Z', severity: 'high' },
      { id: 4, type: 'info', message: 'Actualizaciones de seguridad instaladas', timestamp: '2026-03-04T22:15:00Z', severity: 'low' },
      { id: 5, type: 'alert', message: 'Intento de acceso fallido', timestamp: '2026-03-04T18:27:45Z', severity: 'high' },
      { id: 6, type: 'info', message: 'Reporte diario generado', timestamp: '2026-03-04T12:00:00Z', severity: 'low' },
      { id: 7, type: 'warning', message: 'Uso elevado de memoria', timestamp: '2026-03-04T10:12:33Z', severity: 'medium' },
      { id: 8, type: 'info', message: 'Proceso de limpieza de archivos completado', timestamp: '2026-03-03T23:15:00Z', severity: 'low' },
      { id: 9, type: 'alert', message: 'Reinicio inesperado de servicio', timestamp: '2026-03-03T17:45:22Z', severity: 'high' },
      { id: 10, type: 'warning', message: 'Múltiples intentos de autenticación fallidos', timestamp: '2026-03-03T14:30:45Z', severity: 'medium' }
    ];

    // Apply filters if provided
    let filteredEvents = [...allEvents];

    if (severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === severity);
    }

    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }

    // Apply pagination
    const paginatedEvents = filteredEvents.slice(offset, offset + limit);

    // Return paginated results with metadata
    return NextResponse.json({
      events: paginatedEvents,
      total: filteredEvents.length,
      limit,
      offset,
      hasMore: offset + limit < filteredEvents.length
    });
  } catch (error) {
    console.error('Error fetching system events:', error);
    return NextResponse.json(
      { error: 'Error fetching system events' },
      { status: 500 }
    );
  }
}