export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  type: 'text' | 'math'
}

export interface TestData {
  questions: Question[]
  duration: number
  createdAt: string
  allowCorrections: boolean
  metadata?: Record<string, any>
}

export interface SubmissionData {
  answers: number[]
  timeLogs: Array<{ questionId: string; entry: number; exit?: number }>
  submittedAt: string
  studentName: string
}

export interface CorrectionData {
  scores: number[]
  feedbacks: string[]
  teacherNotes?: string
  correctedAt: string
}