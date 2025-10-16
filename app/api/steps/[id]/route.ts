// app/api/steps/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { aiResponse } = await request.json()

    // Проверяем существование шага перед обновлением
    const existingStep = await prisma.step.findUnique({
      where: { id }
    })

    if (!existingStep) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    const step = await prisma.step.update({
      where: { id },
      data: { aiResponse }
    })

    return NextResponse.json(step)
  } catch (error) {
    console.error('Update step error:', error)
    return NextResponse.json(
      { error: 'Failed to update step' },
      { status: 500 }
    )
  }
}

// ДОБАВЛЯЕМ DELETE МЕТОД
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Проверяем существование шага
    const step = await prisma.step.findUnique({
      where: { id }
    })

    if (!step) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    // Удаляем шаг
    await prisma.step.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Step deleted successfully',
      deletedStep: step 
    })
  } catch (error) {
    console.error('Delete step error:', error)
    return NextResponse.json(
      { error: 'Failed to delete step' },
      { status: 500 }
    )
  }
}