'use client'

import { useState } from 'react'

interface Question {
  id: string
  text: string
  studentAnswer: string
  correctAnswer: string
  options: string[]
}

interface GradingPanelProps {
  questions: Question[]
  onScoreUpdate: (questionId: string, score: number, feedback: string) => void
}

export default function GradingPanel({ questions, onScoreUpdate }: GradingPanelProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})

  const handleScoreChange = (questionId: string, score: number) => {
    setScores(prev => ({ ...prev, [questionId]: score }))
    onScoreUpdate(questionId, score, feedbacks[questionId] || '')
  }

  const handleFeedbackChange = (questionId: string, feedback: string) => {
    setFeedbacks(prev => ({ ...prev, [questionId]: feedback }))
    onScoreUpdate(questionId, scores[questionId] || 0, feedback)
  }

  const currentQuestionData = questions[currentQuestion]

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-6">Grading Panel</h3>
      
      {/* Question navigation */}
      <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestion(index)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border ${
              currentQuestion === index
                ? 'border-accent bg-accent/10'
                : scores[q.id] !== undefined
                ? 'border-green-500 bg-green-500/10'
                : 'border-border'
            }`}
          >
            Q{index + 1}
            {scores[q.id] !== undefined && (
              <span className="ml-2 text-xs text-green-400">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Current question */}
      {currentQuestionData && (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Question {currentQuestion + 1}</h4>
            <div className="bg-background border border-border rounded-lg p-4">
              <div dangerouslySetInnerHTML={{ __html: currentQuestionData.text }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student's Answer */}
            <div>
              <h5 className="font-semibold mb-2 text-gray-400">Student's Answer</h5>
              <div className="bg-background border border-yellow-700/50 rounded-lg p-4">
                <p className="text-yellow-300">{currentQuestionData.studentAnswer}</p>
              </div>
            </div>

            {/* Correct Answer */}
            <div>
              <h5 className="font-semibold mb-2 text-gray-400">Correct Answer</h5>
              <div className="bg-background border border-green-700/50 rounded-lg p-4">
                <p className="text-green-300">{currentQuestionData.correctAnswer}</p>
              </div>
            </div>
          </div>

          {/* Scoring */}
          <div>
            <h5 className="font-semibold mb-2">Score</h5>
            <div className="flex space-x-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleScoreChange(currentQuestionData.id, score)}
                  className={`flex-1 py-2 rounded-lg border ${
                    scores[currentQuestionData.id] === score
                      ? 'border-accent bg-accent/20 text-accent'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <h5 className="font-semibold mb-2">Feedback</h5>
            <textarea
              value={feedbacks[currentQuestionData.id] || ''}
              onChange={(e) => handleFeedbackChange(currentQuestionData.id, e.target.value)}
              className="w-full h-32 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Provide feedback for the student..."
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 border-t border-border">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            
            <button
              onClick={() => setCurrentQuestion(prev => 
                Math.min(questions.length - 1, prev + 1)
              )}
              disabled={currentQuestion === questions.length - 1}
              className="px-6 py-2 border border-border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}