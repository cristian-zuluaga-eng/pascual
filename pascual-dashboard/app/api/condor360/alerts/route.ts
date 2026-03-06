import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const type = url.searchParams.get('type'); // 'opportunity', 'warning', 'info'
    const priority = url.searchParams.get('priority'); // 'high', 'medium', 'low'

    // Mock data for development
    const allAlerts = [
      {
        id: 1,
        type: 'opportunity',
        title: 'Oportunidad de compra: Tecnología',
        description: 'Sector tecnológico muestra señales técnicas de sobrevendido, posible oportunidad de entrada',
        timestamp: '2026-03-05T09:35:00Z',
        priority: 'medium',
        relatedTickers: ['MSFT', 'GOOGL', 'AAPL'],
        actionable: true
      },
      {
        id: 2,
        type: 'warning',
        title: 'Advertencia: Alta volatilidad',
        description: 'Incremento significativo en la volatilidad del mercado, considere revisar stop-loss',
        timestamp: '2026-03-05T11:20:00Z',
        priority: 'high',
        relatedTickers: [],
        actionable: true
      },
      {
        id: 3,
        type: 'info',
        title: 'Rebalanceo recomendado',
        description: 'Su asignación de activos se ha desviado más de 5% de los objetivos, considere rebalancear',
        timestamp: '2026-03-04T15:45:00Z',
        priority: 'low',
        relatedTickers: [],
        actionable: true
      },
      {
        id: 4,
        type: 'opportunity',
        title: 'Dividendos próximos',
        description: '3 acciones en su cartera anunciarán dividendos esta semana',
        timestamp: '2026-03-04T14:10:00Z',
        priority: 'medium',
        relatedTickers: ['ECOPETL', 'GRUPOSURA', 'BCOLOMBIA'],
        actionable: false
      },
      {
        id: 5,
        type: 'warning',
        title: 'Advertencia: Resultados trimestrales',
        description: 'Empresa XYZ reportará resultados por debajo de lo esperado según estimaciones preliminares',
        timestamp: '2026-03-03T16:25:00Z',
        priority: 'medium',
        relatedTickers: ['XYZ'],
        actionable: true
      },
      {
        id: 6,
        type: 'info',
        title: 'Actualización económica',
        description: 'Datos de empleo se publicarán mañana, posible impacto en mercados financieros',
        timestamp: '2026-03-03T10:15:00Z',
        priority: 'low',
        relatedTickers: [],
        actionable: false
      },
      {
        id: 7,
        type: 'opportunity',
        title: 'Oportunidad de compra: Energías renovables',
        description: 'Sector de energías renovables muestra soporte técnico fuerte tras corrección reciente',
        timestamp: '2026-03-02T13:40:00Z',
        priority: 'high',
        relatedTickers: ['ISAGEN', 'CELSIA'],
        actionable: true
      },
      {
        id: 8,
        type: 'warning',
        title: 'Riesgo político emergente',
        description: 'Creciente incertidumbre regulatoria en el sector financiero podría impactar valoraciones',
        timestamp: '2026-03-02T09:30:00Z',
        priority: 'high',
        relatedTickers: ['BCOLOMBIA', 'GRUPOAVAL', 'GRUPOSURA'],
        actionable: false
      }
    ];

    // Apply filters if provided
    let filteredAlerts = [...allAlerts];

    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }

    if (priority) {
      filteredAlerts = filteredAlerts.filter(alert => alert.priority === priority);
    }

    // Apply pagination
    const paginatedAlerts = filteredAlerts.slice(offset, offset + limit);

    // Return paginated results with metadata
    return NextResponse.json({
      alerts: paginatedAlerts,
      total: filteredAlerts.length,
      limit,
      offset,
      hasMore: offset + limit < filteredAlerts.length
    });
  } catch (error) {
    console.error('Error fetching investment alerts:', error);
    return NextResponse.json(
      { error: 'Error fetching investment alerts' },
      { status: 500 }
    );
  }
}