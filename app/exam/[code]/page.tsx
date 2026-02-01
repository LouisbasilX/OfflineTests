'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { decryptData, encryptData } from '@/lib/encryption'
import { IDBManager } from '@/lib/indexedDB'
import CountdownTimer from '../components/CountdownTimer'
import OfflineIndicator from '../components/OfflineIndicator'

interface Question {
  id: string
  text: string
  options: string[]
}

interface TimeLog {
  questionId: string
  entry: number
  exit?: number
}

const idb = new IDBManager()

export default function ExamPage() {
  const params = useParams()
  const router = useRouter()
  const testCode = params.code as string
  
  const [testData, setTestData] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [fullscreen, setFullscreen] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  const [isOffline, setIsOffline] = useState(false)
  const [lastSave, setLastSave] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize test
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true)
        // Try to fetch from API
        const response = await fetch(`/api/test/fetch?code=${testCode}`)
        if (!response.ok) throw new Error('Test not found')
        
        const data = await response.json()
        if (!data.success) throw new Error(data.message)
        
        const decrypted = await decryptData(data.encrypted_test_data, testCode)
        
        setTestData(decrypted)
        setTimeLeft(decrypted.duration * 60)
        setAnswers(new Array(decrypted.questions.length).fill(-1))
        
        // Initialize time logs
        setTimeLogs(decrypted.questions.map((q: any) => ({
          questionId: q.id,
          entry: performance.now()
        })))
        
        // Cache test data
        await idb.cacheTest(testCode, decrypted, new Date(Date.now() + 24 * 60 * 60 * 1000))
        
        // Load from IndexedDB if exists
        const saved = await idb.getExamState(testCode)
        if (saved) {
          setAnswers(saved.answers)
          setCurrentQuestion(saved.currentQuestion)
          setTimeLogs(saved.timeLogs)
        }
      } catch (error) {
        console.error('Error initializing test:', error)
        // Try loading from cache
        const cached = await idb.getCachedTest(testCode)
        if (cached) {
          setTestData(cached)
          setTimeLeft(cached.duration * 60)
          setAnswers(new Array(cached.questions.length).fill(-1))
        } else {
          alert('Test not found or expired')
          router.push('/')
        }
      } finally {
        setLoading(false)
      }
    }
    
    initialize()
    
    // Offline detection
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)
    
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [testCode, router])

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!testData) return
    
    const interval = setInterval(async () => {
      await idb.saveExamState(testCode, {
        answers,
        currentQuestion,
        timeLogs,
        lastUpdated: new Date()
      })
      setLastSave(new Date())
    }, 5000)
    
    return () => clearInterval(interval)
  }, [testData, answers, currentQuestion, timeLogs, testCode])

  // Tab visibility monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const warning = `Tab switch detected at ${new Date().toLocaleTimeString()}`
        setWarnings(prev => [...prev, warning])
        
        // Update time log for current question
        setTimeLogs(prev => {
          const newLogs = [...prev]
          if (newLogs[currentQuestion]) {
            newLogs[currentQuestion] = {
              ...newLogs[currentQuestion],
              exit: performance.now()
            }
          }
          return newLogs
        })
      } else {
        // Re-enter - update time log for current question
        setTimeLogs(prev => {
          const newLogs = [...prev]
          newLogs[currentQuestion] = {
            questionId: testData?.questions[currentQuestion]?.id || '',
            entry: performance.now()
          }
          return newLogs
        })
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentQuestion, testData])

  const submitExam = useCallback(async () => {
    if (!testData) return
    
    const submission = {
      answers,
      timeLogs,
      submittedAt: new Date().toISOString(),
      studentName: 'Anonymous Student'
    }
    
    try {
      const encrypted = await encryptData(submission, testCode)
      
      const response = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCode,
          encryptedSubmissionData: encrypted,
          timeLogs,
          student_name: 'Anonymous'
        })
      })
      
      if (response.ok) {
        await idb.clearExamState(testCode)
        router.push('/thank-you')
      } else {
        throw new Error('Submission failed')
      }
    } catch (error) {
      console.error('Error submitting exam:', error)
      // Store locally for later sync
      const encrypted = await encryptData(submission, testCode)
      await idb.savePendingSubmission(testCode, encrypted)
      alert('Submission saved offline. Will sync when online.')
      router.push('/')
    }
  }, [testData, answers, timeLogs, testCode, router])

  // Handle timer expiration
  const handleTimerExpire = useCallback(() => {
    submitExam()
  }, [submitExam])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!testData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Test Not Found</h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-accent rounded-lg hover:bg-blue-500 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  const currentQuestionData = testData.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="bg-surface border-b border-border p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Exam: {testCode}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <OfflineIndicator testCode={testCode} lastSave={lastSave} />
              {warnings.length > 0 && (
                <span className="text-yellow-400 text-sm">
                  ⚠️ {warnings.length} warning{warnings.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <CountdownTimer 
              duration={timeLeft}
              onExpire={handleTimerExpire}
            />
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="px-4 py-2 border border-accent rounded-lg hover:bg-accent/10 transition-colors"
            >
              {fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-surface border-r border-border p-4 hidden md:block">
          <h3 className="font-semibold mb-4">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {testData.questions.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`h-10 rounded-lg border transition-colors ${
                  currentQuestion === index
                    ? 'border-accent bg-accent/10'
                    : answers[index] !== -1
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <div className="mt-8">
            <button
              onClick={submitExam}
              className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Submit Exam
            </button>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Auto-submits when timer expires
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  Question {currentQuestion + 1} of {testData.questions.length}
                </h2>
                <span className="text-gray-400">
                  {currentQuestion + 1}/{testData.questions.length}
                </span>
              </div>
              
              <div className="bg-surface border border-border rounded-xl p-6 mb-6">
                <div className="prose prose-invert max-w-none">
                  {currentQuestionData.type === 'math' ? (
                    <div dangerouslySetInnerHTML={{ __html: currentQuestionData.text }} />
                  ) : (
                    <p className="text-lg">{currentQuestionData.text}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestionData.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newAnswers = [...answers]
                      newAnswers[currentQuestion] = index
                      setAnswers(newAnswers)
                    }}
                    className={`p-4 text-left rounded-xl border transition-colors ${
                      answers[currentQuestion] === index
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50 hover:bg-surface/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border mr-3 flex items-center justify-center ${
                        answers[currentQuestion] === index
                          ? 'border-accent bg-accent'
                          : 'border-border'
                      }`}>
                        {answers[currentQuestion] === index && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex justify-between md:hidden">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-2 border border-border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              
              <button
                onClick={() => setCurrentQuestion(prev => 
                  Math.min(testData.questions.length - 1, prev + 1)
                )}
                disabled={currentQuestion === testData.questions.length - 1}
                className="px-6 py-2 border border-border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}