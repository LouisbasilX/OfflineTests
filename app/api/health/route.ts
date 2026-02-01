import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check database connection (in production, you'd check Supabase)
    const isDatabaseHealthy = true // Replace with actual check
    
    // Check environment variables
    const envVars = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV || 'development',
    }
    
    const allEnvVarsSet = Object.values(envVars).every(Boolean)
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: isDatabaseHealthy ? 'healthy' : 'unhealthy',
        environment: allEnvVarsSet ? 'configured' : 'misconfigured',
        api: 'operational',
      },
      version: '1.0.0',
    }
    
    return NextResponse.json(health, {
      status: isDatabaseHealthy && allEnvVarsSet ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}