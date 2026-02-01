'use client'

interface ScoreCalculatorProps {
  questions: Array<{
    id: string
    maxScore: number
    score?: number
  }>
}

export default function ScoreCalculator({ questions }: ScoreCalculatorProps) {
  const calculateTotal = () => {
    const scored = questions.filter(q => q.score !== undefined)
    const totalScored = scored.reduce((sum, q) => sum + (q.score || 0), 0)
    const totalPossible = scored.reduce((sum, q) => sum + q.maxScore, 0)
    const percentage = totalPossible > 0 ? (totalScored / totalPossible) * 100 : 0
    
    return {
      scored: scored.length,
      total: questions.length,
      totalScored,
      totalPossible,
      percentage: Math.round(percentage)
    }
  }

  const stats = calculateTotal()

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A', color: 'text-green-400' }
    if (percentage >= 80) return { grade: 'B', color: 'text-blue-400' }
    if (percentage >= 70) return { grade: 'C', color: 'text-yellow-400' }
    if (percentage >= 60) return { grade: 'D', color: 'text-orange-400' }
    return { grade: 'F', color: 'text-red-400' }
  }

  const grade = getGrade(stats.percentage)

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-xl font-semibold mb-6">Score Calculator</h3>
      
      <div className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-accent">
              {stats.scored}/{stats.total} questions graded
            </span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(stats.scored / stats.total) * 100}%` }}
            />
          </div>
        </div>

        {/* Score Display */}
        <div className="text-center">
          <div className={`text-5xl font-bold mb-2 ${grade.color}`}>
            {stats.percentage}%
          </div>
          <div className="text-2xl font-semibold mb-4">{grade.grade}</div>
          <div className="text-gray-400">
            {stats.totalScored} / {stats.totalPossible} points
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Questions Graded</span>
            <span className="font-mono">{stats.scored}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Remaining</span>
            <span className="font-mono">{stats.total - stats.scored}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Average Score</span>
            <span className="font-mono">
              {stats.scored > 0 ? (stats.totalScored / stats.scored).toFixed(1) : '0.0'} / 5
            </span>
          </div>
        </div>

        {/* Grade Legend */}
        <div className="pt-4 border-t border-border">
          <h4 className="font-semibold mb-2">Grading Scale</h4>
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            <div className="p-2 bg-green-900/30 rounded">A: 90-100%</div>
            <div className="p-2 bg-blue-900/30 rounded">B: 80-89%</div>
            <div className="p-2 bg-yellow-900/30 rounded">C: 70-79%</div>
            <div className="p-2 bg-orange-900/30 rounded">D: 60-69%</div>
            <div className="p-2 bg-red-900/30 rounded">F: 0-59%</div>
          </div>
        </div>
      </div>
    </div>
  )
}