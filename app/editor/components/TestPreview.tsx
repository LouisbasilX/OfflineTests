'use client'

interface TestPreviewProps {
  questions: Array<{
    text: string
    options: string[]
    correctAnswer: number
    type: 'text' | 'math'
  }>
  duration: number
  testCode: string
}

export default function TestPreview({ questions, duration, testCode }: TestPreviewProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : ''}`
    }
    return `${mins} minute${mins > 1 ? 's' : ''}`
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-6">Test Preview</h3>
      
      <div className="space-y-6">
        {/* Test Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="text-sm text-gray-400">Test Code</div>
            <div className="text-2xl font-mono font-bold text-accent mt-1">{testCode}</div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="text-sm text-gray-400">Duration</div>
            <div className="text-2xl font-bold mt-1">{formatDuration(duration)}</div>
          </div>
        </div>

        {/* Questions Summary */}
        <div>
          <h4 className="font-semibold mb-3">Questions ({questions.length})</h4>
          <div className="space-y-3">
            {questions.map((q, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">Question {index + 1}</div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    q.type === 'math' 
                      ? 'bg-purple-900/30 text-purple-400' 
                      : 'bg-blue-900/30 text-blue-400'
                  }`}>
                    {q.type === 'math' ? 'Math' : 'Text'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {q.text || 'No question text yet'}
                </div>
                
                <div className="text-xs text-gray-400">
                  Correct: Option {String.fromCharCode(65 + q.correctAnswer)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="pt-4 border-t border-border">
          <h4 className="font-semibold mb-3">Statistics</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{questions.length}</div>
              <div className="text-xs text-gray-400 mt-1">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {questions.filter(q => q.text.trim()).length}
              </div>
              <div className="text-xs text-gray-400 mt-1">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {questions.filter(q => q.options.some(opt => opt.trim())).length}
              </div>
              <div className="text-xs text-gray-400 mt-1">With Options</div>
            </div>
          </div>
        </div>

        {/* Preview Tips */}
        <div className="p-4 bg-background border border-border rounded-lg">
          <h5 className="font-semibold text-sm mb-2">Preview Notes:</h5>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Students will see questions in this order</li>
            <li>• Math questions render with KaTeX</li>
            <li>• Timer starts when student enters test code</li>
            <li>• All data is encrypted before leaving browser</li>
          </ul>
        </div>
      </div>
    </div>
  )
}