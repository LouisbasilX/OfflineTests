import { timeLogSchema } from './schema'

interface TimeLog {
  questionId: string
  entry: number
  exit?: number
}

interface SuspiciousActivity {
  type: 'time_travel' | 'unrealistic_gap' | 'missing_logs' | 'pattern_detected'
  message: string
  severity: 'low' | 'medium' | 'high'
  evidence: any
}

export class AntiCheatValidator {
  private logs: TimeLog[]
  private suspiciousActivities: SuspiciousActivity[] = []
  private readonly config = {
    minQuestionTime: 1, // seconds
    maxQuestionTime: 600, // seconds
    minGapBetweenQuestions: 0.5, // seconds
    maxGapBetweenQuestions: 300, // seconds
    maxTabSwitches: 3,
    patternThreshold: 3
  }

  constructor(logs: TimeLog[]) {
    this.logs = logs
  }

  validate(): {
    isSuspicious: boolean
    activities: SuspiciousActivity[]
    score: number // 0-100, higher = more suspicious
  } {
    this.suspiciousActivities = []
    
    // Validate each log
    this.validateIndividualLogs()
    
    // Validate sequences and patterns
    this.validateSequences()
    this.detectPatterns()
    
    // Calculate suspicion score
    const score = this.calculateSuspicionScore()
    
    return {
      isSuspicious: this.suspiciousActivities.length > 0,
      activities: this.suspiciousActivities,
      score
    }
  }

  private validateIndividualLogs() {
    this.logs.forEach((log, index) => {
      try {
        timeLogSchema.parse(log)
      } catch (error) {
        this.suspiciousActivities.push({
          type: 'missing_logs',
          message: `Invalid time log for question ${index + 1}`,
          severity: 'medium',
          evidence: { log, error }
        })
      }

      // Check question duration
      if (log.entry && log.exit) {
        const duration = (log.exit - log.entry) / 1000
        
        if (duration < this.config.minQuestionTime) {
          this.suspiciousActivities.push({
            type: 'unrealistic_gap',
            message: `Question ${index + 1} answered too quickly (${duration.toFixed(2)}s)`,
            severity: 'high',
            evidence: { duration, threshold: this.config.minQuestionTime }
          })
        }
        
        if (duration > this.config.maxQuestionTime) {
          this.suspiciousActivities.push({
            type: 'unrealistic_gap',
            message: `Question ${index + 1} took too long (${(duration / 60).toFixed(1)}min)`,
            severity: 'medium',
            evidence: { duration, threshold: this.config.maxQuestionTime }
          })
        }
      }
    })
  }

  private validateSequences() {
    for (let i = 1; i < this.logs.length; i++) {
      const prev = this.logs[i - 1]
      const current = this.logs[i]
      
      if (prev.exit && current.entry) {
        const gap = (current.entry - prev.exit) / 1000
        
        // Check for negative gap (time travel)
        if (gap < 0) {
          this.suspiciousActivities.push({
            type: 'time_travel',
            message: `Time travel detected between questions ${i} and ${i + 1}`,
            severity: 'high',
            evidence: { gap }
          })
        }
        
        // Check for unrealistically fast transitions
        if (gap < this.config.minGapBetweenQuestions) {
          this.suspiciousActivities.push({
            type: 'unrealistic_gap',
            message: `Unrealistically fast transition between questions ${i} and ${i + 1} (${gap.toFixed(2)}s)`,
            severity: 'medium',
            evidence: { gap, threshold: this.config.minGapBetweenQuestions }
          })
        }
        
        // Check for suspiciously long gaps
        if (gap > this.config.maxGapBetweenQuestions) {
          this.suspiciousActivities.push({
            type: 'unrealistic_gap',
            message: `Suspiciously long gap between questions ${i} and ${i + 1} (${(gap / 60).toFixed(1)}min)`,
            severity: 'low',
            evidence: { gap, threshold: this.config.maxGapBetweenQuestions }
          })
        }
      }
    }
  }

  private detectPatterns() {
    // Detect consistent answer times (bot pattern)
    const durations = this.logs
      .filter(log => log.entry && log.exit)
      .map(log => (log.exit! - log.entry!) / 1000)
    
    if (durations.length >= this.config.patternThreshold) {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avgDuration, 2), 0) / durations.length
      
      // Very low variance suggests automated answering
      if (variance < 0.5) {
        this.suspiciousActivities.push({
          type: 'pattern_detected',
          message: 'Consistent answer times detected (possible automation)',
          severity: 'medium',
          evidence: { variance, avgDuration }
        })
      }
    }
    
    // Detect missing logs
    const missingLogs = this.logs.filter(log => !log.entry || !log.exit)
    if (missingLogs.length > 0) {
      this.suspiciousActivities.push({
        type: 'missing_logs',
        message: `Missing time logs for ${missingLogs.length} questions`,
        severity: 'low',
        evidence: { missingCount: missingLogs.length }
      })
    }
  }

  private calculateSuspicionScore(): number {
    const weights = {
      high: 10,
      medium: 5,
      low: 2
    }
    
    let score = 0
    this.suspiciousActivities.forEach(activity => {
      score += weights[activity.severity]
    })
    
    // Normalize to 0-100
    return Math.min(100, score * 2)
  }

  static analyzeTimePattern(logs: TimeLog[]): {
    totalTime: number
    avgPerQuestion: number
    consistency: number // 0-100, higher = more consistent
    gaps: number[]
  } {
    const durations = logs
      .filter(log => log.entry && log.exit)
      .map(log => (log.exit! - log.entry!) / 1000)
    
    const gaps = []
    for (let i = 1; i < logs.length; i++) {
      if (logs[i - 1].exit && logs[i].entry) {
        gaps.push((logs[i].entry - logs[i - 1].exit!) / 1000)
      }
    }
    
    const totalTime = durations.reduce((a, b) => a + b, 0)
    const avgPerQuestion = durations.length > 0 ? totalTime / durations.length : 0
    
    // Calculate consistency (inverse of coefficient of variation)
    const mean = avgPerQuestion
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / durations.length
    const stdDev = Math.sqrt(variance)
    const consistency = mean > 0 ? Math.max(0, 100 - (stdDev / mean) * 100) : 100
    
    return {
      totalTime,
      avgPerQuestion,
      consistency,
      gaps
    }
  }

  static generateReport(logs: TimeLog[]) {
    const validator = new AntiCheatValidator(logs)
    const result = validator.validate()
    const patterns = AntiCheatValidator.analyzeTimePattern(logs)
    
    return {
      ...result,
      patterns,
      recommendations: result.isSuspicious ? [
        'Review time logs for inconsistencies',
        'Check for potential tab switching',
        'Verify answer patterns'
      ] : ['Time logs appear normal']
    }
  }
}