// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  title: string
  description: string | null
  goal: string
  createdAt: string
  updatedAt: string
  steps: Step[]
}

interface Step {
  id: string
  content: string
  type: string | null
  createdAt: string
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setError(null)
      const response = await fetch('/api/projects')
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить проекты')
      }
      
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Ошибка при загрузке проектов:', error)
      setError('Не удалось загрузить проекты. Пожалуйста, попробуйте еще раз.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = () => {
    router.push('/projects/new')
  }

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleExportProject = (projectId: string) => {
    window.open(`/api/projects/${projectId}/export`, '_blank')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Загружаем проекты...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Трекер Обучения 🎯
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Отслеживайте свой путь обучения, фиксируйте прогресс и экспортируйте данные для получения AI-инсайтов и рекомендаций.
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{projects.length}</div>
            <div className="text-gray-600">Всего проектов</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {projects.reduce((total, project) => total + project.steps.length, 0)}
            </div>
            <div className="text-gray-600">Всего шагов</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {projects.filter(p => p.steps.length > 0).length}
            </div>
            <div className="text-gray-600">Активных проектов</div>
          </div>
        </div>

        {/* Действия */}
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={handleCreateProject}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span>+</span>
            Создать новый проект
          </button>
          
          {projects.length > 0 && (
            <button 
              onClick={fetchProjects}
              className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors"
            >
              Обновить
            </button>
          )}
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button 
              onClick={fetchProjects}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Попробовать снова
            </button>
          </div>
        )}

        {/* Сетка проектов */}
        {projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {project.title}
                    </h3>
                    <span className="flex-shrink-0 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full ml-2">
                      {project.steps.length} шагов
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Цель:</div>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.goal}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Создан: {formatDate(project.createdAt)}</span>
                    {project.updatedAt !== project.createdAt && (
                      <span>Обновлен: {formatDate(project.updatedAt)}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleViewProject(project.id)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Подробнее
                    </button>
                    <button 
                      onClick={() => handleExportProject(project.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                      title="Экспортировать SQL для анализа ИИ"
                    >
                      Экспорт SQL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Состояние пустого списка */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Пока нет проектов
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Начните свой путь обучения, создав первый проект. Отслеживайте прогресс и получайте AI-рекомендации.
            </p>
            <button 
              onClick={handleCreateProject}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Создать первый проект
            </button>
          </div>
        )}

        {/* Как это работает */}
        {projects.length === 0 && (
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl mb-3">📝</div>
              <h4 className="font-semibold mb-2">Создавайте проекты</h4>
              <p className="text-gray-600 text-sm">
                Определяйте цели обучения и отслеживайте прогресс с помощью структурированных шагов.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">📊</div>
              <h4 className="font-semibold mb-2">Фиксируйте прогресс</h4>
              <p className="text-gray-600 text-sm">
                Добавляйте заметки, уроки и достижения по мере обучения и роста.
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-3">🤖</div>
              <h4 className="font-semibold mb-2">AI-инсайты</h4>
              <p className="text-gray-600 text-sm">
                Экспортируйте данные и получайте персонализированные рекомендации от ИИ.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}