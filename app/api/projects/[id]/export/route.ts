// app/api/projects/[id]/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    const sqlContent = generateSQL(project)

    return new NextResponse(sqlContent, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="project-${project.id}.sql"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to export project' },
      { status: 500 }
    )
  }
}

function generateSQL(project: any): string {
  const timestamp = new Date().toISOString()
  let sql = `-- Learning Tracker Export\n`
  sql += `-- Project: ${project.title}\n`
  sql += `-- Export Date: ${timestamp}\n`
  sql += `-- Total Steps: ${project.steps.length}\n\n`

  // ДОБАВЛЯЕМ ПРОМТ ДЛЯ ИИ
  sql += generateAIPrompt(project)
  sql += `\n\n`

  // Вставка проекта
  sql += `-- Project data\n`
  sql += `INSERT INTO projects (id, createdAt, updatedAt, title, description, goal) VALUES (\n`
  sql += `  '${project.id}',\n`
  sql += `  '${project.createdAt.toISOString()}',\n`
  sql += `  '${project.updatedAt.toISOString()}',\n`
  sql += `  '${escapeSQL(project.title)}',\n`
  sql += `  ${project.description ? `'${escapeSQL(project.description)}'` : 'NULL'},\n`
  sql += `  '${escapeSQL(project.goal)}'\n`
  sql += `);\n\n`

  // Вставка шагов
  if (project.steps.length > 0) {
    sql += `-- Steps data\n`
    project.steps.forEach((step: any, index: number) => {
      sql += `INSERT INTO steps (id, createdAt, projectId, content, aiResponse, type) VALUES (\n`
      sql += `  '${step.id}',\n`
      sql += `  '${step.createdAt.toISOString()}',\n`
      sql += `  '${step.projectId}',\n`
      sql += `  '${escapeSQL(step.content)}',\n`
      sql += `  ${step.aiResponse ? `'${escapeSQL(step.aiResponse)}'` : 'NULL'},\n`
      sql += `  ${step.type ? `'${escapeSQL(step.type)}'` : 'NULL'}\n`
      sql += `)${index === project.steps.length - 1 ? ';' : ';'}\n`
    })
  }

  return sql
}

function generateAIPrompt(project: any): string {
  return `-- 🎯 ИНСТРУКЦИЯ ДЛЯ ИИ-ПОМОЩНИКА (DeepSeek/ChatGPT)
--
-- ЦЕЛЬ: Ты - опытный наставник, который помогает в обучении и проектной работе.
-- Пользователь ведет этот учебный проект и хочет получить экспертные рекомендации.
--
-- ЧТО НУЖНО ДЕЛАТЬ:
--
-- 1. 📊 ПРОАНАЛИЗИРУЙ ПРОЕКТ:
--    - Изучи цель проекта: "${project.goal}"
--    - Пойми контекст: ${project.description || 'без дополнительного описания'}
--    - Оцени текущий прогресс (${project.steps.length} шагов)
--
-- 2. 🔍 ПРОАНАЛИЗИРУЙ КАЖДЫЙ ШАГ:
--    - Оцени что было сделано в каждом шаге
--    - Если у тебя есть компетенция по теме - дай экспертную оценку
--    - Отметь что сделано хорошо, а что можно улучшить
--
-- 3. ❓ ЗАДАЙ УТОЧНЯЮЩИЕ ВОПРОСЫ:
--    - "Все ли было понятно в этом шаге?"
--    - "Какие вопросы возникли?"
--    - "Нужны ли дополнительные объяснения?"
--
-- 4. 🎁 ПРЕДЛОЖИ ПОМОЩЬ:
--    - Шпаргалки и краткие руководства
--    - Решения типовых проблем
--    - Следующие рекомендуемые шаги
--    - Дополнительные ресурсы для изучения
--
-- 5. 💡 ДАЙ РЕКОМЕНДАЦИИ:
--    - Что изучать дальше (логичная последовательность)
--    - Практические задания для закрепления
--    - Советы по эффективному обучению
--
-- ФОРМАТ ОТВЕТА:
-- Будь дружелюбным, поддерживающим наставником. Структурируй ответ:
-- - Краткий анализ прогресса
-- - Ответы на конкретные вопросы (если есть)
-- - Рекомендации по следующим шагам
-- - Шпаргалки/советы по теме
-- - Вопросы для рефлексии
--
-- ПОСЛЕ ТВОЕГО ОТВЕТА пользователь может:
-- 1. Задать уточняющие вопросы
-- 2. Попросить дополнить шпаргалку
-- 3. Добавить твой ответ как AI-комментарий к шагу
--
-- 🔽 НИЖЕ ДАННЫЕ ПРОЕКТА ДЛЯ АНАЛИЗА 🔽
`
}

function escapeSQL(str: string): string {
  return str.replace(/'/g, "''").replace(/\n/g, '\\n')
}