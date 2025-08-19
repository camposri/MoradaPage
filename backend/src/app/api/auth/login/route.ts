import { NextRequest, NextResponse } from 'next/server'

// POST /api/auth/login - Admin login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username e password são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    // Validate credentials
    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Credenciais inválidas' },
        { status: 401 }
      )
    }
    
    // Generate simple token (in production, use proper JWT)
    const token = Buffer.from(`${username}:${password}`).toString('base64')
    
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          username,
          role: 'admin'
        }
      }
    })
    
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}