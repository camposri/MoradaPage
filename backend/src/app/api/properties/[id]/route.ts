import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// GET /api/properties/[id] - Get a single property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Propriedade não encontrada' },
          { status: 404 }
        )
      }
      
      console.error('Error fetching property:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar propriedade' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: property
    })
    
  } catch (error) {
    console.error('Error in GET /api/properties/[id]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/properties/[id] - Update a property
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    const body = await request.json()
    
    // Validate required fields
    const { title, property_type, price, area, location } = body
    
    if (!title || !property_type || !price || !area || !location) {
      return NextResponse.json(
        { success: false, message: 'Campos obrigatórios: título, tipo, preço, área e localização' },
        { status: 400 }
      )
    }
    
    // Prepare update data
    const updateData = {
      title: title.trim(),
      description: body.description?.trim() || '',
      property_type,
      price: parseFloat(price),
      area: parseFloat(area),
      bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
      bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
      location: location.trim(),
      images: Array.isArray(body.images) ? body.images : [],
      featured: Boolean(body.featured),
      updated_at: new Date().toISOString()
    }
    
    const { data: property, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Propriedade não encontrada' },
          { status: 404 }
        )
      }
      
      console.error('Error updating property:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao atualizar propriedade' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Propriedade atualizada com sucesso',
      data: property
    })
    
  } catch (error) {
    console.error('Error in PUT /api/properties/[id]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id] - Delete a property
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { id } = params
    
    // First check if property exists
    const { data: existingProperty, error: fetchError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, message: 'Propriedade não encontrada' },
          { status: 404 }
        )
      }
      
      console.error('Error checking property existence:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erro ao verificar propriedade' },
        { status: 500 }
      )
    }
    
    // Delete the property
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Error deleting property:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erro ao excluir propriedade' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Propriedade excluída com sucesso'
    })
    
  } catch (error) {
    console.error('Error in DELETE /api/properties/[id]:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}