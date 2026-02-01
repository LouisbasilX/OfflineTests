import { z } from 'zod'

// Question validation
export const questionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1, 'Question text is required'),
  options: z.array(z.string()).min(2, 'At least 2 options required'),
  correctAnswer: z.number().int().min(0),
  type: z.enum(['text', 'math'])
})

// Test validation
export const testSchema = z.object({
  questions: z.array(questionSchema).min(1, 'At least 1 question required'),
  duration: z.number().int().min(1).max(240),
  allowCorrections: z.boolean().default(false),
  metadata: z.object({
    version: z.string().default('1.0'),
    createdBy: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
})

// Submission validation
export const submissionSchema = z.object({
  answers: z.array(z.number().int().min(-1)),
  timeLogs: z.array(z.object({
    questionId: z.string(),
    entry: z.number(),
    exit: z.number().optional()
  })),
  submittedAt: z.string().datetime(),
  studentName: z.string().min(1, 'Student name is required')
})

// Correction validation
export const correctionSchema = z.object({
  scores: z.array(z.number().int().min(0)),
  feedbacks: z.array(z.string()),
  teacherNotes: z.string().optional(),
  correctedAt: z.string().datetime()
})

// Time log validation for anti-cheat
export const timeLogSchema = z.object({
  questionId: z.string(),
  entry: z.number(),
  exit: z.number().optional()
}).refine(
  (data) => !data.exit || data.exit > data.entry,
  {
    message: 'Exit time must be after entry time',
    path: ['exit']
  }
)

// Test code validation
export const testCodeSchema = z.string()
  .length(6, 'Test code must be 6 digits')
  .regex(/^\d+$/, 'Test code must contain only numbers')

// Validation helper functions
export function validateTestData(data: any) {
  try {
    return testSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`)
    }
    throw error
  }
}

export function validateSubmissionData(data: any) {
  try {
    return submissionSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Submission validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`)
    }
    throw error
  }
}

export function validateTestCode(code: string) {
  try {
    return testCodeSchema.parse(code)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error('Invalid test code format')
    }
    throw error
  }
}

// Duration validation
export function validateDuration(minutes: number) {
  if (minutes < 1) throw new Error('Duration must be at least 1 minute')
  if (minutes > 240) throw new Error('Duration cannot exceed 4 hours')
  return minutes
}

// Question count validation
export function validateQuestionCount(count: number) {
  if (count < 1) throw new Error('At least 1 question is required')
  if (count > 100) throw new Error('Maximum 100 questions allowed')
  return count
}

// Score validation
export function validateScore(score: number, maxScore: number) {
  if (score < 0) throw new Error('Score cannot be negative')
  if (score > maxScore) throw new Error(`Score cannot exceed ${maxScore}`)
  return score
}