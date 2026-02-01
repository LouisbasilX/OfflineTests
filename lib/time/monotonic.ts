// Monotonic time utilities for anti-cheat and time logging

export class MonotonicTimer {
  private startTime: number
  private logs: Array<{
    id: string
    event: string
    timestamp: number
    monotonic: number
    data?: any
  }> = []

  constructor() {
    this.startTime = performance.now()
  }

  mark(event: string, id?: string, data?: any): string {
    const eventId = id || `event_${this.logs.length + 1}`
    const timestamp = Date.now()
    const monotonic = performance.now() - this.startTime
    
    this.logs.push({
      id: eventId,
      event,
      timestamp,
      monotonic,
      data
    })
    
    return eventId
  }

  getEvent(id: string) {
    return this.logs.find(log => log.id === id)
  }

  getEvents(eventName: string) {
    return this.logs.filter(log => log.event === eventName)
  }

  getElapsedTime(): number {
    return performance.now() - this.startTime
  }

  getElapsedSeconds(): number {
    return this.getElapsedTime() / 1000
  }

  validateMonotonicity(): {
    valid: boolean
    issues: Array<{
      index: number
      issue: string
      current: number
      previous: number
    }>
  } {
    const issues = []
    
    for (let i = 1; i < this.logs.length; i++) {
      const current = this.logs[i]
      const previous = this.logs[i - 1]
      
      // Check for monotonic increase
      if (current.monotonic < previous.monotonic) {
        issues.push({
          index: i,
          issue: 'Non-monotonic time detected',
          current: current.monotonic,
          previous: previous.monotonic
        })
      }
      
      // Check for unrealistically fast events (< 1ms)
      const gap = current.monotonic - previous.monotonic
      if (gap < 1 && gap > 0) {
        issues.push({
          index: i,
          issue: 'Unrealistically fast event',
          current: current.monotonic,
          previous: previous.monotonic
        })
      }
      
      // Check for large gaps (> 5 minutes) that might indicate tampering
      if (gap > 300000) { // 5 minutes in milliseconds
        issues.push({
          index: i,
          issue: 'Suspiciously large time gap',
          current: current.monotonic,
          previous: previous.monotonic
        })
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    }
  }

  generateReport() {
    const validation = this.validateMonotonicity()
    
    return {
      startTime: this.startTime,
      elapsedTime: this.getElapsedTime(),
      elapsedSeconds: this.getElapsedSeconds(),
      totalEvents: this.logs.length,
      validation,
      events: this.logs.map(log => ({
        ...log,
        relativeTime: log.monotonic,
        humanTime: new Date(log.timestamp).toISOString()
      })),
      statistics: {
        averageGap: this.calculateAverageGap(),
        minGap: this.calculateMinGap(),
        maxGap: this.calculateMaxGap(),
        eventFrequency: this.calculateEventFrequency()
      }
    }
  }

  private calculateAverageGap(): number {
    if (this.logs.length < 2) return 0
    
    let totalGap = 0
    for (let i = 1; i < this.logs.length; i++) {
      totalGap += this.logs[i].monotonic - this.logs[i - 1].monotonic
    }
    
    return totalGap / (this.logs.length - 1)
  }

  private calculateMinGap(): number {
    if (this.logs.length < 2) return 0
    
    let minGap = Infinity
    for (let i = 1; i < this.logs.length; i++) {
      const gap = this.logs[i].monotonic - this.logs[i - 1].monotonic
      minGap = Math.min(minGap, gap)
    }
    
    return minGap
  }

  private calculateMaxGap(): number {
    if (this.logs.length < 2) return 0
    
    let maxGap = -Infinity
    for (let i = 1; i < this.logs.length; i++) {
      const gap = this.logs[i].monotonic - this.logs[i - 1].monotonic
      maxGap = Math.max(maxGap, gap)
    }
    
    return maxGap
  }

  private calculateEventFrequency(): number {
    if (this.logs.length < 2) return 0
    
    const totalTime = this.getElapsedTime()
    return (this.logs.length / totalTime) * 1000 // events per second
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  importLogs(logs: string) {
    try {
      const parsedLogs = JSON.parse(logs)
      if (Array.isArray(parsedLogs)) {
        this.logs = parsedLogs
      }
    } catch (error) {
      throw new Error('Invalid logs format')
    }
  }

  clear() {
    this.logs = []
    this.startTime = performance.now()
  }
}

export class QuestionTimeLogger {
  private questionTimes: Map<string, { start: number; end?: number }> = new Map()
  private currentQuestionId: string | null = null

  startQuestion(questionId: string) {
    this.currentQuestionId = questionId
    if (!this.questionTimes.has(questionId)) {
      this.questionTimes.set(questionId, { start: performance.now() })
    }
  }

  endQuestion(questionId: string) {
    const questionTime = this.questionTimes.get(questionId)
    if (questionTime && !questionTime.end) {
      questionTime.end = performance.now()
    }
    this.currentQuestionId = null
  }

  endCurrentQuestion() {
    if (this.currentQuestionId) {
      this.endQuestion(this.currentQuestionId)
    }
  }

  getQuestionDuration(questionId: string): number | null {
    const questionTime = this.questionTimes.get(questionId)
    if (questionTime && questionTime.end) {
      return questionTime.end - questionTime.start
    }
    return null
  }

  getCurrentQuestionDuration(): number | null {
    if (this.currentQuestionId) {
      const questionTime = this.questionTimes.get(this.currentQuestionId)
      if (questionTime && !questionTime.end) {
        return performance.now() - questionTime.start
      }
    }
    return null
  }

  getAllDurations(): Array<{ questionId: string; duration: number }> {
    const durations: Array<{ questionId: string; duration: number }> = []
    
    this.questionTimes.forEach((time, questionId) => {
      if (time.end) {
        durations.push({
          questionId,
          duration: time.end - time.start
        })
      }
    })
    
    return durations
  }

  getTotalTime(): number {
    let total = 0
    this.questionTimes.forEach(time => {
      if (time.end) {
        total += time.end - time.start
      }
    })
    return total
  }

  getAverageTime(): number {
    const durations = this.getAllDurations()
    if (durations.length === 0) return 0
    
    const total = durations.reduce((sum, d) => sum + d.duration, 0)
    return total / durations.length
  }

  validateTimeLogs(): {
    valid: boolean
    issues: Array<{
      questionId: string
      issue: string
      duration?: number
    }>
  } {
    const issues = []
    const durations = this.getAllDurations()
    
    durations.forEach(({ questionId, duration }) => {
      // Check for unrealistically short times (< 100ms)
      if (duration < 100) {
        issues.push({
          questionId,
          issue: 'Unrealistically short answer time',
          duration
        })
      }
      
      // Check for unrealistically long times (> 10 minutes)
      if (duration > 600000) {
        issues.push({
          questionId,
          issue: 'Excessively long answer time',
          duration
        })
      }
    })
    
    // Check for overlapping times (simplified check)
    const times = Array.from(this.questionTimes.values())
    for (let i = 1; i < times.length; i++) {
      const prev = times[i - 1]
      const current = times[i]
      
      if (prev.end && current.start && current.start < prev.end) {
        issues.push({
          questionId: `Questions ${i}-${i + 1}`,
          issue: 'Overlapping time detected'
        })
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    }
  }

  exportLogs() {
    return Array.from(this.questionTimes.entries()).map(([questionId, time]) => ({
      questionId,
      start: time.start,
      end: time.end,
      duration: time.end ? time.end - time.start : null
    }))
  }

  clear() {
    this.questionTimes.clear()
    this.currentQuestionId = null
  }
}

// ... previous code ...

// Utility function to detect time manipulation
export function detectTimeManipulation(timestamps: number[]): {
  manipulated: boolean
  confidence: number
  evidence: string[]
} {
  const evidence: string[] = []
  let confidence = 0

  // Check for monotonic increase
  for (let i = 1; i < timestamps.length; i++) {
    if (timestamps[i] < timestamps[i - 1]) {
      evidence.push(`Non-monotonic time at position ${i}`)
      confidence += 30
    }
  }

  // Check for consistent intervals (possible automation)
  if (timestamps.length >= 3) {
    const intervals = []
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1])
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2)
    }, 0) / intervals.length
    
    if (variance < 10) { // Very consistent intervals
      evidence.push('Highly consistent time intervals detected')
      confidence += 40
    }
  }

  // Check for missing timestamps (jumps)
  const totalDuration = timestamps[timestamps.length - 1] - timestamps[0]
  const expectedInterval = totalDuration / (timestamps.length - 1)
  
  for (let i = 1; i < timestamps.length; i++) {
    const actualInterval = timestamps[i] - timestamps[i - 1]
    if (actualInterval > expectedInterval * 3) { // More than 3x expected
      evidence.push(`Suspicious jump at position ${i} (${actualInterval.toFixed(0)}ms)`)
      confidence += 25
    }
  }

  // Return the result object
  return {
    manipulated: confidence > 50, // Threshold for flagging as manipulated
    confidence: Math.min(100, confidence), // Cap at 100%
    evidence
  }
}

// Optional: Add a utility function to generate time fingerprints
export function generateTimeFingerprint(): {
  performanceNow: number
  dateNow: number
  timezoneOffset: number
  timezone: string
  locale: string
  userAgent: string
} {
  return {
    performanceNow: performance.now(),
    dateNow: Date.now(),
    timezoneOffset: new Date().getTimezoneOffset(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: navigator.language,
    userAgent: navigator.userAgent
  }
}

// Optional: Add function to compare time fingerprints for consistency
export function compareTimeFingerprints(
  start: ReturnType<typeof generateTimeFingerprint>,
  end: ReturnType<typeof generateTimeFingerprint>
): {
  consistent: boolean
  differences: string[]
} {
  const differences: string[] = []
  
  if (start.timezone !== end.timezone) {
    differences.push(`Timezone changed: ${start.timezone} -> ${end.timezone}`)
  }
  
  if (start.locale !== end.locale) {
    differences.push(`Locale changed: ${start.locale} -> ${end.locale}`)
  }
  
  if (start.userAgent !== end.userAgent) {
    differences.push(`User agent changed`)
  }
  
  // Check for significant time discrepancy
  const expectedElapsed = end.performanceNow - start.performanceNow
  const actualElapsed = end.dateNow - start.dateNow
  const discrepancy = Math.abs(expectedElapsed - actualElapsed)
  
  if (discrepancy > 1000) { // More than 1 second difference
    differences.push(`Time discrepancy detected: ${discrepancy.toFixed(0)}ms`)
  }
  
  return {
    consistent: differences.length === 0,
    differences
  }
}