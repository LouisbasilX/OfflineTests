'use client'

import { useEffect, useState } from 'react'

interface TabMonitorProps {
  onTabChange?: (isVisible: boolean) => void
  maxWarnings?: number
}

export default function TabMonitor({ 
  onTabChange, 
  maxWarnings = 3 
}: TabMonitorProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [warnings, setWarnings] = useState<string[]>([])
  const [warningCount, setWarningCount] = useState(0)

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden
      setIsVisible(visible)
      
      if (!visible) {
        const warning = `Tab switch detected at ${new Date().toLocaleTimeString()}`
        setWarnings(prev => [warning, ...prev.slice(0, 4)])
        setWarningCount(prev => prev + 1)
      }
      
      onTabChange?.(visible)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [onTabChange])

  const getSeverity = () => {
    if (warningCount >= maxWarnings) return 'critical'
    if (warningCount > 0) return 'warning'
    return 'normal'
  }

  const severity = getSeverity()
  
  const severityClasses = {
    normal: 'bg-green-900/30 border-green-700 text-green-400',
    warning: 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
    critical: 'bg-red-900/30 border-red-700 text-red-400 animate-pulse'
  }

  return (
    <div className={`px-3 py-2 rounded-lg border ${severityClasses[severity]}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isVisible ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`} />
        <span className="text-sm">
          {isVisible ? 'Focused' : 'Tab Hidden'} 
          {warningCount > 0 && ` • ${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
        </span>
      </div>
      
      {warnings.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="text-xs space-y-1">
            {warnings.slice(0, 2).map((warning, i) => (
              <div key={i} className="flex items-center">
                <span className="text-red-400 mr-2">⚠</span>
                <span>{warning}</span>
              </div>
            ))}
            {warnings.length > 2 && (
              <div className="text-gray-400">
                +{warnings.length - 2} more warnings
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}