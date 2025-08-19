import { NextRequest, NextResponse } from 'next/server'

// Simple authentication middleware for admin routes
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the request is for admin API routes
  if (pathname.startsWith('/api/admin') || 
      (pathname.startsWith('/api/') && 
       ['PUT', 'DELETE'].includes(request.method) &&
       !pathname.includes('/contact') &&
       !pathname.includes('/visits'))) {
    
    // Check for admin authentication
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token de autenticação necessário' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Simple token validation (in production, use proper JWT validation)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const expectedToken = Buffer.from(`${adminUsername}:${adminPassword}`).toString('base64')
    
    if (token !== expectedToken) {
      return NextResponse.json(
        { success: false, message: 'Token inválido' },
        { status: 403 }
      )
    }
  }
  
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/properties/:path*',
    '/api/contact/:path*',
    '/api/visits/:path*'
  ]
}