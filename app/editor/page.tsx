'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { encryptData, generateTestCode } from '@/lib/encryption'
import 'katex/dist/katex.min.css'

const KaTeXBlock = dynamic(() => import('./components/KaTeXBlock'), { ssr: false })

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  type: 'text' | 'math';
}

export default function EditorPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: '', options: ['', '', '', ''], correctAnswer: 0, type: 'text' }
  ])
  const [testCode, setTestCode] = useState(generateTestCode())
  const [duration, setDuration] = useState(60)
  const [allowCorrections, setAllowCorrections] = useState(false)
  const [loading, setLoading] = useState(false)

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        id: Date.now().toString(), 
        text: '', 
        options: ['', '', '', ''], 
        correctAnswer: 0, 
        type: 'text' 
      }
    ])
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const createTest = async () => {
    if (!testCode || testCode.length !== 6) {
      alert('Please generate a valid 6-digit test code')
      return
    }

    setLoading(true)
    try {
      const testData = {
        questions,
        duration,
        createdAt: new Date().toISOString(),
        allowCorrections,
        metadata: { version: '1.0' }
      }

      const encrypted = await encryptData(testData, testCode)
      
      const response = await fetch('/api/test/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCode,
          encryptedTestData: encrypted,
          durationMinutes: duration,
          allowCorrections,
          teacher_id: '00000000-0000-0000-0000-000000000000' // Replace with actual teacher ID from auth
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        alert(`Test created successfully! Test Code: ${testCode}`)
        router.push(`/exam/${testCode}`)
      } else {
        alert(`Error: ${result.message || 'Failed to create test'}`)
      }
    } catch (error) {
      console.error('Error creating test:', error)
      alert('Failed to create test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateNewCode = () => {
    setTestCode(generateTestCode())
  }

  return (
    <div className="min-h-screen bg-background text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-accent">Test Editor</h1>
          <p className="text-gray-400">Create secure, offline-first exams</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Test Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    6-Digit Test Code
                    <button 
                      onClick={generateNewCode}
                      className="ml-2 text-xs text-accent hover:underline"
                    >
                      Generate New
                    </button>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 font-mono text-center focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2"
                    min="1"
                    max="240"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allowCorrections"
                    checked={allowCorrections}
                    onChange={(e) => setAllowCorrections(e.target.checked)}
                    className="w-4 h-4 text-accent rounded focus:ring-accent"
                  />
                  <label htmlFor="allowCorrections" className="text-sm">
                    Enable correction room (3-hour limit)
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={createTest}
              disabled={loading || questions.some(q => !q.text.trim())}
              className="w-full bg-accent text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create & Encrypt Test'}
            </button>
          </div>

          {/* Questions Editor */}
          <div className="lg:col-span-2 space-y-6">
            {questions.map((q, index) => (
              <div key={q.id} className="bg-surface border border-border rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value as 'text' | 'math')}
                    className="bg-background border border-border rounded px-3 py-1 text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="math">Math (KaTeX)</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Question</label>
                    {q.type === 'math' ? (
                      <KaTeXBlock
                        value={q.text}
                        onChange={(value) => updateQuestion(q.id, 'text', value)}
                      />
                    ) : (
                      <textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                        className="w-full h-32 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter question text..."
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {q.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctAnswer === optIndex}
                          onChange={() => updateQuestion(q.id, 'correctAnswer', optIndex)}
                          className="w-4 h-4 text-accent"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...q.options]
                            newOptions[optIndex] = e.target.value
                            updateQuestion(q.id, 'options', newOptions)
                          }}
                          className="flex-1 bg-background border border-border rounded-lg px-4 py-2"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full border-2 border-dashed border-border rounded-xl py-4 hover:border-accent transition-colors"
            >
              + Add Question
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}