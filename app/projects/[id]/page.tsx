// app/projects/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Project {
  id: string
  title: string
  description: string | null
  goal: string
  steps: Step[]
}

interface Step {
  id: string
  content: string
  type: string | null
  aiResponse: string | null
  createdAt: string
}

export default function ProjectDetail() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [newStep, setNewStep] = useState('')
  const [addingStep, setAddingStep] = useState(false)
  const [editingStepId, setEditingStepId] = useState<string | null>(null)
  const [aiResponse, setAiResponse] = useState('')
  const [savingAiResponse, setSavingAiResponse] = useState(false)

  const projectId = params.id as string

  useEffect(() => {
    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  const fetchProject = async () => {
    try {
      console.log('🔄 Загружаем проект:', projectId)
      const response = await fetch(`/api/projects/${projectId}`)
      
      if (!response.ok) {
        throw new Error('Проект не найден')
      }
      
      const data = await response.json()
      console.log('📦 Получен проект:', data)
      setProject(data)
    } catch (error) {
      console.error('❌ Ошибка загрузки проекта:', error)
    } finally {
      setLoading(false)
    }
  }

  const addStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStep.trim()) return

    setAddingStep(true)
    try {
      console.log('📝 Добавляем шаг:', newStep)
      const response = await fetch(`/api/projects/${projectId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newStep,
          type: 'note'
        }),
      })

      if (response.ok) {
        const newStepData = await response.json()
        console.log('✅ Шаг добавлен:', newStepData)
        setNewStep('')
        fetchProject() // Обновляем данные проекта
      } else {
        console.error('❌ Ошибка добавления шага')
      }
    } catch (error) {
      console.error('❌ Не удалось добавить шаг:', error)
    } finally {
      setAddingStep(false)
    }
  }

  const exportSQL = () => {
    window.open(`/api/projects/${projectId}/export`, '_blank')
  }

  const saveAiResponse = async (stepId: string) => {
    if (!aiResponse.trim()) return

    setSavingAiResponse(true)
    try {
      const response = await fetch(`/api/steps/${stepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aiResponse: aiResponse.trim()
        }),
      })

      if (response.ok) {
        setEditingStepId(null)
        setAiResponse('')
        fetchProject() // Обновляем данные
      }
    } catch (error) {
      console.error('❌ Не удалось сохранить ответ ИИ:', error)
    } finally {
      setSavingAiResponse(false)
    }
  }

  const startEditingAiResponse = (step: Step) => {
    setEditingStepId(step.id)
    setAiResponse(step.aiResponse || '')
  }

  const cancelEditing = () => {
    setEditingStepId(null)
    setAiResponse('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Загружаем проект...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Проект не найден</h2>
            <button 
              onClick={() => router.push('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              На главную
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Кнопка назад */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <span>←</span>
          Назад к проектам
        </button>

        {/* Заголовок проекта */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
            {project.description && (
              <p className="text-gray-600 text-lg mb-3 whitespace-pre-wrap">{project.description}</p>
            )}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-1">🎯 Цель обучения:</h3>
              <p className="text-blue-800">{project.goal}</p>
            </div>
          </div>
          <button
            onClick={exportSQL}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Экспорт SQL
          </button>
        </div>

        {/* Форма добавления шага */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">📝 Добавить шаг прогресса</h2>
          <form onSubmit={addStep}>
            <textarea
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="Что вы узнали? Какой прогресс сделали? Какие уроки прошли?"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex justify-between items-center">
              <button
                type="submit"
                disabled={addingStep || !newStep.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {addingStep ? 'Добавляем...' : 'Добавить шаг'}
              </button>
              <span className="text-sm text-gray-500">
                {newStep.length}/1000 символов
              </span>
            </div>
          </form>
        </div>

        {/* Список шагов */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">📊 Хронология прогресса</h2>
            <p className="text-gray-600 text-sm mt-1">
              Всего шагов: {project.steps.length}
            </p>
          </div>
          
          {project.steps.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Пока нет шагов</h3>
              <p className="text-gray-600 mb-6">
                Добавьте первый шаг вашего обучения! Фиксируйте прогресс, чтобы видеть свой рост.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {project.steps.map((step, index) => (
                <div key={step.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {step.type || 'заметка'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(step.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed mb-4">
                        {step.content}
                      </p>

                      {/* БЛОК AI-ОТВЕТА */}
                      {step.aiResponse ? (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 text-green-800 font-semibold">
                              <span>🤖</span>
                              <span>AI Рекомендация</span>
                            </div>
                            <button
                              onClick={() => startEditingAiResponse(step)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              ✏️ Редактировать
                            </button>
                          </div>
                          <p className="text-green-700 whitespace-pre-wrap text-sm">
                            {step.aiResponse}
                          </p>
                        </div>
                      ) : editingStepId === step.id ? (
                        // ФОРМА ДОБАВЛЕНИЯ AI-ОТВЕТА
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2">
                            🤖 Добавить ответ ИИ
                          </h4>
                          <textarea
                            value={aiResponse}
                            onChange={(e) => setAiResponse(e.target.value)}
                            placeholder="Вставьте сюда ответ от ИИ-помощника..."
                            className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                            rows={6}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveAiResponse(step.id)}
                              disabled={savingAiResponse || !aiResponse.trim()}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                            >
                              {savingAiResponse ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                            >
                              Отмена
                            </button>
                          </div>
                        </div>
                      ) : (
                        // КНОПКА ДОБАВЛЕНИЯ AI-ОТВЕТА
                        <div className="mt-4">
                          <button
                            onClick={() => startEditingAiResponse(step)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            <span>🤖</span>
                            <span>Добавить ответ ИИ</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ИНСТРУКЦИЯ ДЛЯ ПОЛЬЗОВАТЕЛЯ */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">🎯 Как работать с ИИ:</h3>
          <ol className="text-yellow-800 text-sm space-y-2 list-decimal list-inside">
            <li>Нажмите "Экспорт SQL" и скопируйте весь текст</li>
            <li>Отправьте ИИ (DeepSeek/ChatGPT) и получите рекомендации</li>
            <li>Вернитесь сюда, нажмите "Добавить ответ ИИ" к нужному шагу</li>
            <li>Вставьте ответ ИИ и сохраните - он будет привязан к шагу</li>
          </ol>
        </div>
      </div>
    </div>
  )
}