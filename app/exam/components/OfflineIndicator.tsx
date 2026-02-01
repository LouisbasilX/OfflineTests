'use client'

import { useState, useEffect } from 'react'

interface OfflineIndicatorProps {
  testCode: string
  lastSave: Date | null
  pendingSyncCount?: number
}

export default function OfflineIndicator({ 
  testCode, 
  lastSave, 
  pendingSyncCount = 0 
}: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [showSyncNotification, setShowSyncNotification] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (pendingSyncCount > 0) {
        setShowSyncNotification(true)
        setTimeout(() => setShowSyncNotification(false), 5000)
      }
    }
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [pendingSyncCount])

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never'
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border ${
        isOnline 
          ? 'bg-green-900/30 border-green-700' 
          : 'bg-red-900/30 border-red-700 animate-pulse'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
        }`}></div>
        <span className={`text-sm ${
          isOnline ? 'text-green-400' : 'text-red-400'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
          {lastSave && isOnline && ` • Saved ${formatTime(lastSave)}`}
          {pendingSyncCount > 0 && ` • ${pendingSyncCount} pending`}
        </span>
      </div>

      {/* Sync Notification */}
      {showSyncNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-blue-300">
                  Back online! Syncing {pendingSyncCount} item{pendingSyncCount !== 1 ? 's' : ''}...
                </p>
                <p className="text-xs text-blue-400/80 mt-1">
                  Your progress is being saved to the server
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}