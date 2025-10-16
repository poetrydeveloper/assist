// app/api/projects/[id]/steps/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ДОБАВЛЯЕМ AWAIT ДЛЯ PARAMS
    const { id } = await params
    const { content, type, aiResponse } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Проверяем существование проекта
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const step = await prisma.step.create({
      data: {
        content,
        type: type || 'note',
        aiResponse,
        projectId: id
      }
    })

    return NextResponse.json(step)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create step' },
      { status: 500 }
    )
  }
}