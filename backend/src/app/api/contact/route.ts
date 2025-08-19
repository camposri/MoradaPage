import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// GET /api/contact - List all contacts (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    // Build query
    let query = supabase
      .from('contacts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (status && ['read', 'unread'].includes(status)) {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%`)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data: contacts, error, count } = await query
    
    if (error) {
      console.error('Error fetching contacts:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar contatos' },
        { status: 500 }
      )
    }
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    return NextResponse.json({
      success: true,
      data: contacts || [],
      pagination: {
        total: count || 0,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/contact:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/contact - Create a new contact message
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await request.json()
    
    // Validate required fields
    const { name, email, message } = body
    
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Campos obrigatórios: nome, email e mensagem' },
        { status: 400 }
      )
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email inválido' },
        { status: 400 }
      )
    }
    
    // Prepare contact data
    const contactData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      subject: body.subject?.trim() || null,
      message: message.trim(),
      status: 'unread'
    }
    
    const { data: contact, error } = await supabase
      .from('contacts')
      .insert([contactData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating contact:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao enviar mensagem' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      data: contact
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error in POST /api/contact:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}