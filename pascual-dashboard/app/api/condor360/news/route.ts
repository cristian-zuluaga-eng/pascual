import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const sentiment = url.searchParams.get('sentiment'); // 'positive', 'negative', 'neutral'

    // Mock data for development
    const allNews = [
      {
        id: 1,
        title: 'Banco Central de Colombia mantiene tasas de interés',
        source: 'El Tiempo',
        date: '05/03/2026',
        publishedAt: '2026-03-05T15:30:00Z',
        summary: 'El Banco de la República decidió mantener la tasa de interés en 7.75% por tercer mes consecutivo, en línea con las expectativas del mercado.',
        sentiment: 'neutral',
        url: 'https://example.com/news/1',
        relevance: 0.85
      },
      {
        id: 2,
        title: 'Ecopetrol reporta ganancias por encima de lo esperado',
        source: 'Portafolio',
        date: '04/03/2026',
        publishedAt: '2026-03-04T18:45:00Z',
        summary: 'La petrolera colombiana reportó un aumento del 15% en sus beneficios trimestrales, superando las estimaciones de los analistas gracias al aumento en la producción y los precios estables del petróleo.',
        sentiment: 'positive',
        url: 'https://example.com/news/2',
        relevance: 0.92
      },
      {
        id: 3,
        title: 'Inflación en Colombia alcanza el 4.2% anual en febrero',
        source: 'La República',
        date: '03/03/2026',
        publishedAt: '2026-03-03T12:15:00Z',
        summary: 'El DANE reportó que la inflación anual se situó en 4.2%, ligeramente por debajo del 4.3% registrado en enero, mostrando una tendencia a la baja.',
        sentiment: 'positive',
        url: 'https://example.com/news/3',
        relevance: 0.88
      },
      {
        id: 4,
        title: 'Mercados internacionales caen tras anuncios de la Fed',
        source: 'Bloomberg',
        date: '02/03/2026',
        publishedAt: '2026-03-02T20:30:00Z',
        summary: 'Los principales índices bursátiles cayeron después de que la Reserva Federal señalara posibles aumentos en las tasas de interés para contener la inflación persistente.',
        sentiment: 'negative',
        url: 'https://example.com/news/4',
        relevance: 0.90
      },
      {
        id: 5,
        title: 'Nuevas regulaciones para criptomonedas en Colombia',
        source: 'Dinero',
        date: '01/03/2026',
        publishedAt: '2026-03-01T14:20:00Z',
        summary: 'El gobierno presentó un proyecto de ley para regular el mercado de criptomonedas, estableciendo requisitos de registro para intercambios y normas de protección al consumidor.',
        sentiment: 'neutral',
        url: 'https://example.com/news/5',
        relevance: 0.75
      },
      {
        id: 6,
        title: 'Grupo Aval expande operaciones en Centroamérica',
        source: 'El Espectador',
        date: '28/02/2026',
        publishedAt: '2026-02-28T16:45:00Z',
        summary: 'El conglomerado financiero colombiano anunció la adquisición de un banco regional en Panamá, fortaleciendo su presencia en Centroamérica.',
        sentiment: 'positive',
        url: 'https://example.com/news/6',
        relevance: 0.82
      },
      {
        id: 7,
        title: 'Escasez de semiconductores afecta producción automotriz',
        source: 'Semana',
        date: '27/02/2026',
        publishedAt: '2026-02-27T10:15:00Z',
        summary: 'Fabricantes de automóviles en Colombia reportan retrasos en la producción debido a la persistente escasez global de semiconductores.',
        sentiment: 'negative',
        url: 'https://example.com/news/7',
        relevance: 0.70
      },
      {
        id: 8,
        title: 'Colombia firma acuerdo comercial con Corea del Sur',
        source: 'Reuters',
        date: '26/02/2026',
        publishedAt: '2026-02-26T13:30:00Z',
        summary: 'El nuevo acuerdo bilateral busca aumentar el intercambio comercial entre ambos países y facilitar inversiones en sectores estratégicos.',
        sentiment: 'positive',
        url: 'https://example.com/news/8',
        relevance: 0.85
      }
    ];

    // Apply filters if provided
    let filteredNews = [...allNews];

    if (sentiment) {
      filteredNews = filteredNews.filter(news => news.sentiment === sentiment);
    }

    // Apply pagination
    const paginatedNews = filteredNews.slice(offset, offset + limit);

    // Return paginated results with metadata
    return NextResponse.json({
      news: paginatedNews,
      total: filteredNews.length,
      limit,
      offset,
      hasMore: offset + limit < filteredNews.length
    });
  } catch (error) {
    console.error('Error fetching financial news:', error);
    return NextResponse.json(
      { error: 'Error fetching financial news' },
      { status: 500 }
    );
  }
}