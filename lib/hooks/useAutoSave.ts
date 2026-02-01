import { useCallback, useEffect, useRef } from 'react'

interface UseAutoSaveOptions {
  data: any
  onSave: (data: any) => Promise<void>
  interval?: number
}

export function useAutoSave({ data, onSave, interval = 5000 }: UseAutoSaveOptions) {
  const lastSavedRef = useRef<string>('')
  const timeoutRef = useRef<NodeJS.Timeout>()

  const save = useCallback(async () => {
    const currentData = JSON.stringify(data)
    
    if (currentData !== lastSavedRef.current) {
      try {
        await onSave(data)
        lastSavedRef.current = currentData
        console.log('Auto-save successful')
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }
  }, [data, onSave])

  useEffect(() => {
    timeoutRef.current = setInterval(save, interval)
    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current)
      }
    }
  }, [save, interval])

  return { lastSaved: lastSavedRef.current }
}