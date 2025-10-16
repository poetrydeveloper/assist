// app/projects/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewProject() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const project = await response.json()
        router.push('/') // Возвращаемся на главную
      } else {
        alert('Ошибка при создании проекта')
      }
    } catch (error) {
      console.error('Не удалось создать проект:', error)
      alert('Не удалось создать проект')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <span>←</span>
          Назад
        </button>
        
        <h1 className="text-3xl font-bold mb-8">Создать новый проект</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название проекта *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: Изучение Next.js, Курс по Unity..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Краткое описание вашего проекта..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цель обучения *
            </label>
            <input
              type="text"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например: Создать полноценное приложение, Завершить прототип игры..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Четко сформулируйте, чего вы хотите достичь в этом проекте
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-semibold disabled:opacity-50 transition-colors"
            >
              {loading ? 'Создание...' : 'Создать проект'}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>

        {/* Подсказки */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Примеры целей</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Освоить основы React за 2 недели</li>
              <li>• Создать игру на Unity за месяц</li>
              <li>• Изучить Python для анализа данных</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">🎯 Советы</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Ставьте конкретные измеримые цели</li>
              <li>• Разбивайте большие цели на этапы</li>
              <li>• Регулярно добавляйте шаги прогресса</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}