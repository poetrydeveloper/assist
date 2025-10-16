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

    const step = await prisma.step.update({
      where: { id },
      data: { aiResponse }
    })

    return NextResponse.json(step)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update step' },
      { status: 500 }
    )
  }
}