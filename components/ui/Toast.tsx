'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration, onClose])
  
  const typeClasses = {
    success: 'bg-green-900/30 border-green-700 text-green-400',
    error: 'bg-red-900/30 border-red-700 text-red-400',
    warning: 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
    info: 'bg-blue-900/30 border-blue-700 text-blue-400'
  }
  
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border ${typeClasses[type]} shadow-lg`}>
        <span className="font-bold">{icons[type]}</span>
        <span className="text-sm">{message}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}