'use client'

interface QuestionNavProps {
  questions: any[]
  currentQuestion: number
  answers: number[]
  onQuestionSelect: (index: number) => void
  showStatus?: boolean
}

export default function QuestionNav({ 
  questions, 
  currentQuestion, 
  answers, 
  onQuestionSelect,
  showStatus = true 
}: QuestionNavProps) {
  const getQuestionStatus = (index: number) => {
    if (answers[index] !== undefined && answers[index] !== -1) {
      return 'answered'
    }
    if (index === currentQuestion) {
      return 'current'
    }
    return 'unanswered'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500 border-green-500'
      case 'current': return 'bg-accent border-accent'
      default: return 'bg-transparent border-border'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'answered': return 'Answered'
      case 'current': return 'Current'
      default: return 'Unanswered'
    }
  }

  const answeredCount = answers.filter(a => a !== undefined && a !== -1).length
  const totalQuestions = questions.length

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold">Question Navigation</h3>
        {showStatus && (
          <div className="text-sm text-gray-400">
            {answeredCount}/{totalQuestions} answered
          </div>
        )}
      </div>

      {/* Question grid */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {questions.map((_, index) => {
          const status = getQuestionStatus(index)
          return (
            <button
              key={index}
              onClick={() => onQuestionSelect(index)}
              className={`relative h-12 rounded-lg border-2 ${getStatusColor(status)} flex items-center justify-center transition-all hover:scale-105`}
            >
              <span className={`font-medium ${
                status === 'answered' ? 'text-white' :
                status === 'current' ? 'text-white' : 'text-gray-300'
              }`}>
                {index + 1}
              </span>
              
              {/* Current question indicator */}
              {status === 'current' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* Status legend */}
      {showStatus && (
        <div className="pt-6 border-t border-border">
          <h4 className="text-sm font-medium mb-3">Status Legend</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-400">Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Current</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-border rounded-full"></div>
              <span className="text-xs text-gray-400">Unanswered</span>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}