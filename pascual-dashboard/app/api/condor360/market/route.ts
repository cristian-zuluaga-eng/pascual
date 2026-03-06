import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for development
    const marketData = {
      timestamp: new Date().toISOString(),
      stockData: [
        { date: '2026-02-26', value: 145.23 },
        { date: '2026-02-27', value: 147.85 },
        { date: '2026-02-28', value: 148.32 },
        { date: '2026-03-01', value: 150.75 },
        { date: '2026-03-02', value: 149.65 },
        { date: '2026-03-03', value: 153.20 },
        { date: '2026-03-04', value: 155.75 },
        { date: '2026-03-05', value: 154.28 }
      ],
      portfolioAllocation: [
        { name: 'Acciones', value: 45 },
        { name: 'Bonos', value: 25 },
        { name: 'Efectivo', value: 15 },
        { name: 'Bienes raíces', value: 10 },
        { name: 'Crypto', value: 5 }
      ],
      marketPerformance: [
        { name: 'COLCAP', value: 1.8 },
        { name: 'S&P 500', value: 2.3 },
        { name: 'NASDAQ', value: 3.2 },
        { name: 'DAX', value: -0.7 },
        { name: 'FTSE', value: 0.5 },
        { name: 'NIKKEI', value: 1.2 }
      ],
      technicalIndicators: {
        rsi: 58.3,
        macd: 'positive',
        movingAverage50: 'above',
        bollingerBands: 'middle',
        volume: 'average'
      },
      keyLevels: {
        support1: 145.20,
        support2: 142.75,
        resistance1: 157.30,
        resistance2: 160.15,
        stopLoss: 141.50
      }
    };

    return NextResponse.json(marketData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json(
      { error: 'Error fetching market data' },
      { status: 500 }
    );
  }
}