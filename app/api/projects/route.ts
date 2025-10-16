// app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        steps: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, goal } = await request.json()

    if (!title || !goal) {
      return NextResponse.json(
        { error: 'Title and goal are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        goal
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}