import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// GET /api/visits/[id] - Get a single visit by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    
    const { data: visit, error } = await supabase
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
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Visita não encontrada' },
          { status: 404 }
        )
      }
      
      console.error('Error fetching visit:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar visita' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: visit
    })
    
  } catch (error) {
    console.error('Error in GET /api/visits/[id]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/visits/[id] - Update visit (status, reschedule)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    const body = await request.json()
    
    // Get current visit data
    const { data: currentVisit, error: fetchError } = await supabase
      .from('visits')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Visita não encontrada' },
          { status: 404 }
        )
      }
      
      console.error('Error fetching visit:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar visita' },
        { status: 500 }
      )
    }
    
    const updateData: any = {}
    
    // Handle status update
    if (body.status) {
      if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(body.status)) {
        return NextResponse.json(
          { success: false, message: 'Status inválido' },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }
    
    // Handle rescheduling
    if (body.visit_date || body.visit_time) {
      const newDate = body.visit_date || currentVisit.visit_date
      const newTime = body.visit_time || currentVisit.visit_time
      
      // Validate new date/time is in the future
      const visitDateTime = new Date(`${newDate}T${newTime}:00`)
      const now = new Date()
      
      if (visitDateTime <= now) {
        return NextResponse.json(
          { success: false, message: 'Nova data e hora devem ser no futuro' },
          { status: 400 }
        )
      }
      
      // Check for conflicts (excluding current visit)
      const { data: conflictingVisit, error: conflictError } = await supabase
        .from('visits')
        .select('id')
        .eq('property_id', currentVisit.property_id)
        .eq('visit_date', newDate)
        .eq('visit_time', newTime)
        .neq('id', id)
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
      
      updateData.visit_date = newDate
      updateData.visit_time = newTime
    }
    
    // Handle admin notes
    if (body.admin_notes !== undefined) {
      updateData.admin_notes = body.admin_notes?.trim() || null
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nenhum campo para atualizar' },
        { status: 400 }
      )
    }
    
    const { data: visit, error } = await supabase
      .from('visits')
      .update(updateData)
      .eq('id', id)
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
      `)
      .single()
    
    if (error) {
      console.error('Error updating visit:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao atualizar visita' },
        { status: 500 }
      )
    }
    
    let message = 'Visita atualizada com sucesso'
    if (body.status === 'confirmed') {
      message = 'Visita confirmada com sucesso'
    } else if (body.status === 'cancelled') {
      message = 'Visita cancelada com sucesso'
    } else if (body.visit_date || body.visit_time) {
      message = 'Visita reagendada com sucesso'
    }
    
    return NextResponse.json({
      success: true,
      message,
      data: visit
    })
    
  } catch (error) {
    console.error('Error in PUT /api/visits/[id]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/visits/[id] - Delete a visit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    
    // First check if visit exists
    const { data: existingVisit, error: fetchError } = await supabase
      .from('visits')
      .select('id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Visita não encontrada' },
          { status: 404 }
        )
      }
      
      console.error('Error checking visit existence:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erro ao verificar visita' },
        { status: 500 }
      )
    }
    
    // Delete the visit
    const { error: deleteError } = await supabase
      .from('visits')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Error deleting visit:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erro ao excluir visita' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Visita excluída com sucesso'
    })
    
  } catch (error) {
    console.error('Error in DELETE /api/visits/[id]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}