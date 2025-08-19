import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// GET /api/contact/[id] - Get a single contact by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    
    const { data: contact, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Contato não encontrado' },
          { status: 404 }
        )
      }
      
      console.error('Error fetching contact:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar contato' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: contact
    })
    
  } catch (error) {
    console.error('Error in GET /api/contact/[id]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/contact/[id] - Update contact status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    const body = await request.json()
    
    // Validate status
    const { status } = body
    if (!status || !['read', 'unread'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Status inválido. Use "read" ou "unread"' },
        { status: 400 }
      )
    }
    
    const { data: contact, error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Contato não encontrado' },
          { status: 404 }
        )
      }
      
      console.error('Error updating contact:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao atualizar contato' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Status do contato atualizado com sucesso',
      data: contact
    })
    
  } catch (error) {
    console.error('Error in PUT /api/contact/[id]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/contact/[id] - Delete a contact
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    
    // First check if contact exists
    const { data: existingContact, error: fetchError } = await supabase
      .from('contacts')
      .select('id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Contato não encontrado' },
          { status: 404 }
        )
      }
      
      console.error('Error checking contact existence:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erro ao verificar contato' },
        { status: 500 }
      )
    }
    
    // Delete the contact
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Error deleting contact:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erro ao excluir contato' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Contato excluído com sucesso'
    })
    
  } catch (error) {
    console.error('Error in DELETE /api/contact/[id]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}