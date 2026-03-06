import { NextResponse } from 'next/server';

// In a real implementation, this would fetch data from the Sentinel service
export async function GET() {
  try {
    // Mock data for development
    const systemStatus = {
      timestamp: new Date().toISOString(),
      status: 'active',
      cpu: {
        usage: 14.3,
        cores: 8,
        temperature: 45.2
      },
      memory: {
        total: 32768, // MB
        used: 8192,   // MB
        free: 24576,  // MB
        usage: 25.0
      },
      disk: {
        total: 524288, // MB
        used: 245760,  // MB
        free: 278528,  // MB
        usage: 46.9
      },
      network: {
        upload: 0.8, // Mbps
        download: 1.2 // Mbps
      },
      uptime: {
        system: 302400, // seconds (3.5 days)
        pascual: 259200  // seconds (3 days)
      }
    };

    return NextResponse.json(systemStatus);
  } catch (error) {
    console.error('Error fetching system status:', error);
    return NextResponse.json(
      { error: 'Error fetching system status' },
      { status: 500 }
    );
  }
}