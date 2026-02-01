'use client'

import { useState } from 'react'

interface ScorePanelProps {
  onFinalSubmit: (totalScore: number, teacherNotes: string) => void
  maxScore: number
  currentTotalScore: number
}

export default function ScorePanel({ onFinalSubmit, maxScore }: ScorePanelProps) {
  const [teacherNotes, setTeacherNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Calculate total score from the parent component's scores
      // The parent (CorrectionPage) should pass the calculated totalScore
      // For now, we'll call with 0 and parent will calculate
      await onFinalSubmit(0, teacherNotes)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Final Submission</h3>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Maximum Score:</span>
          <span className="text-2xl font-bold text-white">{maxScore} points</span>
        </div>
        
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-accent transition-all duration-500"
            style={{ width: '0%' }} // Parent should calculate percentage
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-400 mb-2 text-sm font-medium">
          Teacher Notes (Optional)
        </label>
        <textarea
          value={teacherNotes}
          onChange={(e) => setTeacherNotes(e.target.value)}
          placeholder="Add overall feedback for the student..."
          className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-accent resize-none"
          maxLength={500}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {teacherNotes.length}/500 characters
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Submitting...
          </span>
        ) : (
          'Submit Final Correction'
        )}
      </button>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>⚠️ This submission will be encrypted and automatically deleted in 3 hours</p>
        <p className="mt-1">Students can only view their final score, not the corrected answers</p>
      </div>
    </div>
  )
}