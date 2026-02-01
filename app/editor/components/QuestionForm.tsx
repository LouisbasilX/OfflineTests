'use client'

import { useState } from 'react'
import MathToolbar from './MathToolbar'

interface QuestionFormProps {
  question: {
    id: string
    text: string
    options: string[]
    correctAnswer: number
    type: 'text' | 'math'
  }
  index: number
  onUpdate: (field: string, value: any) => void
  onDelete: () => void
}

export default function QuestionForm({ question, index, onUpdate, onDelete }: QuestionFormProps) {
  const [showMathToolbar, setShowMathToolbar] = useState(false)

  const handleInsertMath = (symbol: string) => {
    const newText = question.text + symbol
    onUpdate('text', newText)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Question {index + 1}</h3>
        <div className="flex items-center space-x-3">
          <select
            value={question.type}
            onChange={(e) => onUpdate('type', e.target.value)}
            className="bg-background border border-border rounded px-3 py-1 text-sm"
          >
            <option value="text">Text</option>
            <option value="math">Math</option>
          </select>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-900/30 border border-red-700 rounded text-sm hover:bg-red-900/50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Question Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Question Text</label>
          {question.type === 'math' ? (
            <div className="space-y-2">
              <div className="flex space-x-2 mb-2">
                <button
                  onClick={() => setShowMathToolbar(!showMathToolbar)}
                  className="px-3 py-1 bg-background border border-border rounded text-sm hover:border-accent transition-colors"
                >
                  {showMathToolbar ? 'Hide Toolbar' : 'Show Math Toolbar'}
                </button>
                <button
                  onClick={() => handleInsertMath('$$')}
                  className="px-3 py-1 bg-background border border-border rounded text-sm hover:border-accent transition-colors"
                >
                  Insert Display Math
                </button>
                <button
                  onClick={() => handleInsertMath('$')}
                  className="px-3 py-1 bg-background border border-border rounded text-sm hover:border-accent transition-colors"
                >
                  Insert Inline Math
                </button>
              </div>
              
              {showMathToolbar && <MathToolbar onInsert={handleInsertMath} />}
              
              <textarea
                value={question.text}
                onChange={(e) => onUpdate('text', e.target.value)}
                className="w-full h-40 bg-background border border-border rounded-lg px-4 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter LaTeX math (e.g., \frac{a}{b} = c^{2})"
              />
            </div>
          ) : (
            <textarea
              value={question.text}
              onChange={(e) => onUpdate('text', e.target.value)}
              className="w-full h-32 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter question text..."
            />
          )}
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-2">Options</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options.map((option, optIndex) => (
              <div key={optIndex} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name={`correct-${question.id}`}
                  checked={question.correctAnswer === optIndex}
                  onChange={() => onUpdate('correctAnswer', optIndex)}
                  className="w-4 h-4 text-accent"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...question.options]
                      newOptions[optIndex] = e.target.value
                      onUpdate('options', newOptions)
                    }}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2"
                    placeholder={`Option ${optIndex + 1}`}
                  />
                  {question.correctAnswer === optIndex && (
                    <div className="text-xs text-green-400 mt-1 flex items-center">
                      <span className="mr-1">✓</span> Correct Answer
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        {question.text && (
          <div>
            <label className="block text-sm font-medium mb-2">Preview</label>
            <div className="bg-background border border-border rounded-lg p-4">
              {question.type === 'math' ? (
                <div className="text-center">
                  <div className="text-gray-400 text-sm mb-2">Math Preview:</div>
                  <div className="text-lg">{question.text}</div>
                </div>
              ) : (
                <p>{question.text}</p>
              )}
              
              {question.options.some(opt => opt.trim()) && (
                <div className="mt-4">
                  <div className="text-gray-400 text-sm mb-2">Options Preview:</div>
                  <div className="space-y-2">
                    {question.options.map((opt, idx) => (
                      <div key={idx} className={`p-2 rounded border ${
                        question.correctAnswer === idx 
                          ? 'border-green-500 bg-green-500/10' 
                          : 'border-border'
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center ${
                            question.correctAnswer === idx 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-500'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span>{opt || `Option ${idx + 1}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}