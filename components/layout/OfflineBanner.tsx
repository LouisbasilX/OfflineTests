'use client'

import { useEffect, useState } from 'react'

interface OfflineBannerProps {
  showOnlyWhenOffline?: boolean
  showSyncStatus?: boolean
}

export default function OfflineBanner({ 
  showOnlyWhenOffline = true,
  showSyncStatus = true 
}: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (showOnlyWhenOffline) {
        setShow(false)
      }
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setShow(true)
    }

    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setShow(true)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Simulate pending sync count
    const interval = setInterval(() => {
      if (!isOnline) {
        setPendingSync(prev => Math.min(prev + 1, 10))
      }
    }, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [isOnline, showOnlyWhenOffline])

  if (!show) return null

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-40 px-4 py-3 
      ${isOnline 
        ? 'bg-blue-900/30 border-b border-blue-700' 
        : 'bg-red-900/30 border-b border-red-700'
      }
      animate-slide-down
    `}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              isOnline ? 'bg-blue-500' : 'bg-red-500'
            }`}></div>
            <div>
              <p className="font-medium">
                {isOnline ? 'Back Online' : 'You are offline'}
              </p>
              <p className="text-sm opacity-90">
                {isOnline 
                  ? 'Your connection has been restored.' 
                  : 'Changes will be saved locally and synced when online.'
                }
              </p>
            </div>
          </div>
          
          {showSyncStatus && (
            <div className="flex items-center space-x-4">
              {!isOnline && pendingSync > 0 && (
                <div className="text-sm">
                  <span className="text-red-300">{pendingSync} pending</span>
                </div>
              )}
              
              {isOnline && pendingSync > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Syncing {pendingSync} items...</span>
                </div>
              )}
              
              <button
                onClick={() => setShow(false)}
                className="text-sm hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}