import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      checks: {
        database: await checkDatabase(),
        external_apis: await checkExternalAPIs(),
      },
    };

    // Determine overall health
    const isHealthy = Object.values(healthStatus.checks).every(check => check.status === 'healthy');
    
    return NextResponse.json(
      healthStatus,
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

async function checkDatabase(): Promise<{ status: string; responseTime?: number }> {
  try {
    const start = Date.now();
    
    // Add your database health check here
    // For Firebase, you might check Firestore connectivity
    // const db = getFirestore();
    // await db.collection('health').limit(1).get();
    
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
    };
  }
}

async function checkExternalAPIs(): Promise<{ status: string; services?: Record<string, string> }> {
  const services: Record<string, string> = {};
  
  try {
    // Check OpenAI API
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        services.openai = response.ok ? 'healthy' : 'unhealthy';
      } catch {
        services.openai = 'unhealthy';
      }
    }
    
    // Check Google AI API
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`, {
          signal: AbortSignal.timeout(5000),
        });
        services.google_ai = response.ok ? 'healthy' : 'unhealthy';
      } catch {
        services.google_ai = 'unhealthy';
      }
    }
    
    const allHealthy = Object.values(services).every(status => status === 'healthy');
    
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      services,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      services,
    };
  }
}