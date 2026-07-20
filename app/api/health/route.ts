import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as health`;
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      responseTime: `${duration}ms`,
      environment: process.env.NODE_ENV,
    }, { status: 200 });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('HEALTH_CHECK_ERROR:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
      responseTime: `${duration}ms`,
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : 'Database connection failed',
    }, { status: 503 });
  }
}
