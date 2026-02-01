'use client'

interface SuspiciousActivityProps {
  timeLogs: Array<{
    questionId: string
    entry: number
    exit?: number
  }>
  isSuspicious: boolean
  suspiciousReasons?: string[]
}

export default function SuspiciousActivity({ 
  timeLogs, 
  isSuspicious,
  suspiciousReasons = []
}: SuspiciousActivityProps) {
  const analyzeTimeLogs = () => {
    const issues = []
    
    if (timeLogs.length === 0) {
      issues.push('No time logs recorded')
      return issues
    }
    
    // Check for unrealistic time differences
    for (let i = 1; i < timeLogs.length; i++) {
      const prev = timeLogs[i - 1]
      const current = timeLogs[i]
      
      if (prev.exit && current.entry) {
        const gap = (current.entry - prev.exit) / 1000 // Convert to seconds
        
        if (gap < 0.5) { // Less than 0.5 seconds between questions
          issues.push(`Question ${i} to ${i + 1}: Unrealistically fast transition (${gap.toFixed(2)}s)`)
        }
        
        if (gap > 300) { // More than 5 minutes gap
          issues.push(`Question ${i} to ${i + 1}: Suspiciously long gap (${(gap / 60).toFixed(1)}min)`)
        }
      }
    }
    
    // Check question durations
    timeLogs.forEach((log, i) => {
      if (log.entry && log.exit) {
        const duration = (log.exit - log.entry) / 1000
        
        if (duration < 1) {
          issues.push(`Question ${i + 1}: Too short (${duration.toFixed(2)}s)`)
        }
        
        if (duration > 600) { // More than 10 minutes on one question
          issues.push(`Question ${i + 1}: Excessive time (${(duration / 60).toFixed(1)}min)`)
        }
      }
    })
    
    return issues
  }

  const issues = [...analyzeTimeLogs(), ...suspiciousReasons]
  
  if (!isSuspicious && issues.length === 0) {
    return (
      <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-medium">No suspicious activity detected</span>
        </div>
        <p className="text-sm text-green-400/80 mt-2">
          Time logs show normal exam behavior
        </p>
      </div>
    )
  }

  return (
    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-400 font-medium">
            Suspicious Activity Detected
          </span>
        </div>
        <span className="px-2 py-1 bg-red-700/50 rounded text-xs text-red-300">
          FLAGGED
        </span>
      </div>
      
      <div className="space-y-2">
        {issues.map((issue, i) => (
          <div key={i} className="flex items-start text-sm">
            <span className="text-red-400 mr-2">•</span>
            <span className="text-red-300">{issue}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-red-700/50">
        <p className="text-xs text-red-400/80">
          This submission has been flagged for manual review by the teacher.
        </p>
      </div>
    </div>
  )
}