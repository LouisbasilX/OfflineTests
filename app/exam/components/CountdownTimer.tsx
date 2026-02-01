'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  duration: number
  onExpire: () => void
  warningThreshold?: number
  showProgress?: boolean
}

export default function CountdownTimer({ 
  duration, 
  onExpire,
  warningThreshold = 300,
  showProgress = true
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isWarning, setIsWarning] = useState(false)
  const [isCritical, setIsCritical] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        
        if (newTime <= 60) {
          setIsCritical(true)
        } else if (newTime <= warningThreshold) {
          setIsWarning(true)
        }
        
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onExpire, warningThreshold])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((duration - timeLeft) / duration) * 100

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Circular progress */}
        {showProgress && (
          <div className="w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#1e293b"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 - (progress * 283) / 100}
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        )}
        
        {/* Time display */}
        <div className={showProgress ? "absolute inset-0 flex flex-col items-center justify-center" : ""}>
          <div className={`${showProgress ? 'text-2xl' : 'text-3xl'} font-mono font-bold ${
            isCritical ? 'text-red-400 animate-pulse' : 
            isWarning ? 'text-yellow-400' : 'text-accent'
          }`}>
            {formatTime(timeLeft)}
          </div>
          {showProgress && (
            <div className="text-xs text-gray-400">
              {isCritical ? 'HURRY!' : isWarning ? 'Warning' : 'Time remaining'}
            </div>
          )}
        </div>
      </div>

      {/* Time breakdown for long durations */}
      {duration > 3600 && !showProgress && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          {Math.floor(timeLeft / 3600)}h {Math.floor((timeLeft % 3600) / 60)}m remaining
        </div>
      )}

      {/* Status indicator */}
      <div className={`mt-2 px-2 py-1 rounded text-xs ${
        isCritical ? 'bg-red-900/30 text-red-400' :
        isWarning ? 'bg-yellow-900/30 text-yellow-400' :
        'bg-blue-900/30 text-blue-400'
      }`}>
        {isCritical ? 'Time almost up!' :
         isWarning ? 'Less than 5 minutes' :
         'Time remaining'}
      </div>
    </div>
  )
}