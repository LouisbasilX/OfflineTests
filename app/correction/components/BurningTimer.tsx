'use client'

import { useState, useEffect } from 'react'

interface BurningTimerProps {
  initialSeconds: number
  onExpire: () => void
}

export default function BurningTimer({ initialSeconds, onExpire }: BurningTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [isCritical, setIsCritical] = useState(false)

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire()
      return
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const newTime = prev - 1
        
        if (newTime <= 60) {
          setIsCritical(true)
        }
        
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [secondsLeft, onExpire])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`
    }
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
  }

  const percentage = (secondsLeft / initialSeconds) * 100

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className={`mr-2 ${isCritical ? 'animate-burning' : 'text-accent'}`}>
          ⏰
        </span>
        Correction Timer
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={`font-mono text-xl font-bold ${
              isCritical ? 'text-red-400 animate-pulse' : 'text-accent'
            }`}>
              {formatTime(secondsLeft)}
            </span>
            <span className="text-sm text-gray-400">
              {isCritical ? 'HURRY! Timer expires soon' : 'Time remaining'}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                isCritical ? 'bg-gradient-to-r from-red-500 to-yellow-500' : 'bg-accent'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        
        {/* Status indicators */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={`p-2 rounded-lg ${
            secondsLeft > 7200 ? 'bg-green-900/30 border border-green-700' : 
            secondsLeft > 3600 ? 'bg-yellow-900/30 border border-yellow-700' :
            'bg-red-900/30 border border-red-700'
          }`}>
            <div className="text-sm">Status</div>
            <div className={`text-xs mt-1 ${
              secondsLeft > 7200 ? 'text-green-400' : 
              secondsLeft > 3600 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {secondsLeft > 7200 ? 'Plenty of time' : 
               secondsLeft > 3600 ? 'Moderate' : 'Critical'}
            </div>
          </div>
          
          <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-700">
            <div className="text-sm">Expires In</div>
            <div className="text-xs text-blue-400 mt-1">
              {Math.ceil(secondsLeft / 3600)} hour{Math.ceil(secondsLeft / 3600) !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="p-2 rounded-lg bg-purple-900/30 border border-purple-700">
            <div className="text-sm">Auto-Save</div>
            <div className="text-xs text-purple-400 mt-1">Every 30s</div>
          </div>
        </div>
        
        {/* Warning message */}
        {isCritical && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg animate-pulse">
            <div className="flex items-center">
              <span className="text-red-400 mr-2">⚠</span>
              <span className="text-sm text-red-300">
                Timer expires soon! Corrections will be deleted automatically.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}