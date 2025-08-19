import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// GET /api/properties - List all properties with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    
    // Build query
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (type) {
      query = query.eq('property_type', type)
    }
    
    if (city) {
      query = query.ilike('location', `%${city}%`)
    }
    
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice))
    }
    
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice))
    }
    
    if (featured === 'true') {
      query = query.eq('featured', true)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data: properties, error, count } = await query
    
    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao buscar propriedades' },
        { status: 500 }
      )
    }
    
    const totalPages = Math.ceil((count || 0) / limit)
    
    return NextResponse.json({
      success: true,
      data: {
        properties: properties || [],
        total: count || 0,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/properties:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST /api/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await request.json()
    
    // Validate required fields
    const { title, description, property_type, price, area, location } = body
    
    if (!title || !property_type || !price || !area || !location) {
      return NextResponse.json(
        { success: false, message: 'Campos obrigatórios: título, tipo, preço, área e localização' },
        { status: 400 }
      )
    }
    
    // Prepare property data
    const propertyData = {
      title: title.trim(),
      description: description?.trim() || '',
      property_type,
      price: parseFloat(price),
      area: parseFloat(area),
      bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
      bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
      location: location.trim(),
      images: Array.isArray(body.images) ? body.images : [],
      featured: Boolean(body.featured)
    }
    
    const { data: property, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating property:', error)
      return NextResponse.json(
        { success: false, message: 'Erro ao criar propriedade' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Propriedade criada com sucesso',
      data: property
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error in POST /api/properties:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}