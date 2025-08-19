import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// GET /api/properties/search - Advanced property search
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
    const type = searchParams.get('type')
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minArea = searchParams.get('minArea')
    const maxArea = searchParams.get('maxArea')
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build query
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
    
    // Apply filters
    if (type && type !== 'all') {
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
    
    if (minArea) {
      query = query.gte('area', parseFloat(minArea))
    }
    
    if (maxArea) {
      query = query.lte('area', parseFloat(maxArea))
    }
    
    if (bedrooms) {
      query = query.eq('bedrooms', parseInt(bedrooms))
    }
    
    if (bathrooms) {
      query = query.eq('bathrooms', parseInt(bathrooms))
    }
    
    if (featured === 'true') {
      query = query.eq('featured', true)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }
    
    // Apply sorting
    const ascending = sortOrder === 'asc'
    switch (sortBy) {
      case 'price':
        query = query.order('price', { ascending })
        break
      case 'area':
        query = query.order('area', { ascending })
        break
      case 'title':
        query = query.order('title', { ascending })
        break
      case 'created_at':
      default:
        query = query.order('created_at', { ascending })
        break
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data: properties, error, count } = await query
    
    if (error) {
      console.error('Error searching properties:', error)
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
        hasPrevPage: page > 1,
        filters: {
          type,
          city,
          minPrice,
          maxPrice,
          minArea,
          maxArea,
          bedrooms,
          bathrooms,
          featured,
          search,
          sortBy,
          sortOrder
        }
      }
    })
    
  } catch (error) {
    console.error('Error in GET /api/properties/search:', error)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}