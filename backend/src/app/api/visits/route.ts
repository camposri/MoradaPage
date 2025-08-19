import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// GET /api/visits - List all visits (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const propertyId = searchParams.get('property_id')
    const search = searchParams.get('search')
    
    // Build query with property details
    let query = supabase
      .from('visits')
      .select(`
        *,
        properties (
          id,
          title,
          type,
          price,
          location,
          main_image
        )
      `, { count: 'exact' })
      .order('visit_date', { ascending: true })
    
    // Apply filters
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      query = query.eq('status', status)
    }
    
    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,message.ilike.%${search}%`)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data: visits, error, count } = await query
    
    if (error) {
      console.error('Error fetching visits:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar visitas' },
        { status: 500 }
      )
    }
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    return NextResponse.json({
      success: true,
      data: visits || [],
      pagination: {
        total: count || 0,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/visits:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/visits - Schedule a new visit
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await request.json()
    
    // Validate required fields
    const { property_id, name, email, phone, visit_date, visit_time } = body
    
    if (!property_id || !name || !email || !phone || !visit_date || !visit_time) {
      return NextResponse.json(
        { success: false, message: 'Campos obrigatórios: property_id, name, email, phone, visit_date, visit_time' },
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
    
    // Validate visit date (must be in the future)
    const visitDateTime = new Date(`${visit_date}T${visit_time}:00`)
    const now = new Date()
    
    if (visitDateTime <= now) {
      return NextResponse.json(
        { success: false, message: 'Data e hora da visita devem ser no futuro' },
        { status: 400 }
      )
    }
    
    // Check if property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title')
      .eq('id', property_id)
      .single()
    
    if (propertyError) {
      if (propertyError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Propriedade não encontrada' },
          { status: 404 }
        )
      }
      
      console.error('Error checking property:', propertyError)
      return NextResponse.json(
        { success: false, message: 'Erro ao verificar propriedade' },
        { status: 500 }
      )
    }
    
    // Check for conflicting visits (same property, same date/time)
    const { data: conflictingVisit, error: conflictError } = await supabase
      .from('visits')
      .select('id')
      .eq('property_id', property_id)
      .eq('visit_date', visit_date)
      .eq('visit_time', visit_time)
      .in('status', ['pending', 'confirmed'])
      .single()
    
    if (conflictError && conflictError.code !== 'PGRST116') {
      console.error('Error checking for conflicts:', conflictError)
      return NextResponse.json(
        { success: false, message: 'Erro ao verificar disponibilidade' },
        { status: 500 }
      )
    }
    
    if (conflictingVisit) {
      return NextResponse.json(
        { success: false, message: 'Já existe uma visita agendada para este horário' },
        { status: 409 }
      )
    }
    
    // Prepare visit data
    const visitData = {
      property_id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      visit_date,
      visit_time,
      message: body.message?.trim() || null,
      status: 'pending'
    }
    
    const { data: visit, error } = await supabase
      .from('visits')
      .insert([visitData])
      .select(`
        *,
        properties (
          id,
          title,
          type,
          location
        )
      `)
      .single()
    
    if (error) {
      console.error('Error creating visit:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao agendar visita' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Visita agendada com sucesso! Entraremos em contato para confirmar.',
      data: visit
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error in POST /api/visits:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}