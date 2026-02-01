'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { decryptData } from '@/lib/encryption'
import BurningTimer from '../components/BurningTimer'
import GradingPanel from '../components/GradingPanel'
import ScoreCalculator from '../components/ScoreCalculator'
import ScorePanel from '../components/ScorePanel'

interface SubmissionData {
  questions: Array<{
    id: string
    text: string
    studentAnswer: string
    correctAnswer: string
    options: string[]
  }>
  studentName: string
  submittedAt: string
  timeLogs: any[]
}

export default function CorrectionPage() {
  const params = useParams()
  const router = useRouter()
  const submissionId = params.submissionId as string
  
  const [submissionData, setSubmissionData] = useState<SubmissionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [correctionExpires, setCorrectionExpires] = useState(10800) // 3 hours in seconds

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        // In production, fetch encrypted submission from API
        // This is a mock implementation
        const mockData: SubmissionData = {
          studentName: 'John Doe',
          submittedAt: new Date().toISOString(),
          timeLogs: [],
          questions: [
            {
              id: '1',
              text: 'What is the derivative of x²?',
              studentAnswer: '2x',
              correctAnswer: '2x',
              options: ['x', '2x', 'x²', '2x²']
            },
            {
              id: '2',
              text: 'Solve for x: 2x + 3 = 11',
              studentAnswer: 'x = 3',
              correctAnswer: 'x = 4',
              options: ['x = 2', 'x = 3', 'x = 4', 'x = 5']
            },
            {
              id: '3',
              text: 'What is ∫ x dx?',
              studentAnswer: 'x²/2 + C',
              correctAnswer: 'x²/2 + C',
              options: ['x + C', 'x² + C', 'x²/2 + C', '2x + C']
            }
          ]
        }
        
        setSubmissionData(mockData)
        
        // Calculate expiration time (3 hours from now)
        const expiresIn = 3 * 60 * 60 // 3 hours in seconds
        setCorrectionExpires(expiresIn)
      } catch (error) {
        console.error('Error fetching submission:', error)
        alert('Submission not found or expired')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubmission()
  }, [submissionId, router])

  const handleScoreUpdate = (questionId: string, score: number, feedback: string) => {
    setScores(prev => ({ ...prev, [questionId]: score }))
    setFeedbacks(prev => ({ ...prev, [questionId]: feedback }))
  }

  const handleFinalSubmit = async (totalScore: number, teacherNotes: string) => {
    // In production, submit to API
    console.log('Submitting scores:', { totalScore, teacherNotes, scores, feedbacks })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Correction submitted successfully!')
    router.push('/')
  }

  const handleTimerExpire = () => {
    alert('Correction time has expired! This page will close.')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!submissionData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Submission Not Found</h1>
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

  const totalQuestions = submissionData.questions.length
  const totalMaxScore = totalQuestions * 5 // Assuming 5 points per question
  const gradedQuestions = Object.keys(scores).length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">Correction Room</h1>
              <p className="text-gray-400 mt-2">
                Grading submission for <span className="text-accent">{submissionData.studentName}</span>
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="px-3 py-1 bg-blue-900/30 border border-blue-700 rounded-full text-sm">
                  {totalQuestions} Questions
                </div>
                <div className="px-3 py-1 bg-green-900/30 border border-green-700 rounded-full text-sm">
                  {gradedQuestions} Graded
                </div>
                <div className="px-3 py-1 bg-yellow-900/30 border border-yellow-700 rounded-full text-sm">
                  Submitted: {new Date(submissionData.submittedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <BurningTimer 
              initialSeconds={correctionExpires}
              onExpire={handleTimerExpire}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Grading Panel */}
          <div className="lg:col-span-2">
            <GradingPanel
              questions={submissionData.questions}
              onScoreUpdate={handleScoreUpdate}
            />
          </div>

          {/* Right Column - Score Tools */}
          <div className="space-y-6">
            <ScoreCalculator 
              questions={submissionData.questions.map(q => ({
                id: q.id,
                maxScore: 5,
                score: scores[q.id]
              }))}
            />
            
            <ScorePanel
              onFinalSubmit={handleFinalSubmit}
              maxScore={totalMaxScore}
              currentTotalScore={Object.values(scores).reduce((sum, score) => sum + (score || 0), 0)}
            />
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-8 p-4 bg-background border border-border rounded-lg">
          <h4 className="font-semibold mb-2 text-gray-300">Grading Guidelines:</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Score each question from 0-5 points</li>
            <li>• Provide constructive feedback for each incorrect answer</li>
            <li>• All corrections are encrypted and will be deleted after 3 hours</li>
            <li>• Students can only see their scores, not the corrected answers</li>
          </ul>
        </div>
      </div>
    </div>
  )
}