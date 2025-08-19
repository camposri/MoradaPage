import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// POST /api/upload - Upload images
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }
    
    const uploadedFiles = []
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }
    
    for (const file of files) {
      if (!file.name) continue
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: `Tipo de arquivo não permitido: ${file.type}` },
          { status: 400 }
        )
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { success: false, message: 'Arquivo muito grande. Máximo 5MB por arquivo.' },
          { status: 400 }
        )
      }
      
      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const extension = path.extname(file.name)
      const filename = `${timestamp}_${randomString}${extension}`
      
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filepath = path.join(uploadDir, filename)
      
      await writeFile(filepath, buffer)
      
      // Return relative URL for the uploaded file
      const fileUrl = `/uploads/${filename}`
      uploadedFiles.push({
        filename,
        url: fileUrl,
        size: file.size,
        type: file.type
      })
    }
    
    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
      data: uploadedFiles
    })
    
  } catch (error) {
    console.error('Error in POST /api/upload:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao fazer upload dos arquivos' },
      { status: 500 }
    )
  }
}

// DELETE /api/upload - Delete uploaded files
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return NextResponse.json(
        { success: false, message: 'Nome do arquivo é obrigatório' },
        { status: 400 }
      )
    }
    
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
    
    // Check if file exists
    if (!existsSync(filepath)) {
      return NextResponse.json(
        { success: false, message: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }
    
    // Delete file
    const { unlink } = await import('fs/promises')
    await unlink(filepath)
    
    return NextResponse.json({
      success: true,
      message: 'Arquivo excluído com sucesso'
    })
    
  } catch (error) {
    console.error('Error in DELETE /api/upload:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao excluir arquivo' },
      { status: 500 }
    )
  }
}