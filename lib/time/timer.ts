export class CountdownTimer {
  private duration: number // in seconds
  private remaining: number
  private interval: NodeJS.Timeout | null = null
  private startTime: number | null = null
  private callbacks: {
    onTick?: (remaining: number) => void
    onExpire?: () => void
    onWarning?: () => void
    onCritical?: () => void
  } = {}
  private warningThreshold: number
  private criticalThreshold: number

  constructor(
    duration: number,
    warningThreshold = 300, // 5 minutes
    criticalThreshold = 60   // 1 minute
  ) {
    this.duration = duration
    this.remaining = duration
    this.warningThreshold = warningThreshold
    this.criticalThreshold = criticalThreshold
  }

  start() {
    if (this.interval) return
    
    this.startTime = Date.now()
    this.interval = setInterval(() => {
      this.remaining = Math.max(0, this.duration - Math.floor((Date.now() - this.startTime!) / 1000))
      
      // Call tick callback
      this.callbacks.onTick?.(this.remaining)
      
      // Check for warnings
      if (this.remaining === this.warningThreshold) {
        this.callbacks.onWarning?.()
      }
      
      // Check for critical
      if (this.remaining === this.criticalThreshold) {
        this.callbacks.onCritical?.()
      }
      
      // Check for expiration
      if (this.remaining === 0) {
        this.stop()
        this.callbacks.onExpire?.()
      }
    }, 1000)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  pause() {
    this.stop()
  }

  resume() {
    if (!this.interval && this.remaining > 0) {
      // Adjust duration to remaining time
      this.duration = this.remaining
      this.startTime = Date.now() - (this.duration - this.remaining) * 1000
      this.start()
    }
  }

  reset(newDuration?: number) {
    this.stop()
    if (newDuration !== undefined) {
      this.duration = newDuration
    }
    this.remaining = this.duration
    this.startTime = null
  }

  addTime(seconds: number) {
    this.duration += seconds
    this.remaining += seconds
  }

  subtractTime(seconds: number) {
    this.duration = Math.max(0, this.duration - seconds)
    this.remaining = Math.max(0, this.remaining - seconds)
  }

  onTick(callback: (remaining: number) => void) {
    this.callbacks.onTick = callback
  }

  onExpire(callback: () => void) {
    this.callbacks.onExpire = callback
  }

  onWarning(callback: () => void) {
    this.callbacks.onWarning = callback
  }

  onCritical(callback: () => void) {
    this.callbacks.onCritical = callback
  }

  getRemainingTime() {
    return this.remaining
  }

  getFormattedTime(): string {
    const hours = Math.floor(this.remaining / 3600)
    const minutes = Math.floor((this.remaining % 3600) / 60)
    const seconds = this.remaining % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  getProgressPercentage(): number {
    return ((this.duration - this.remaining) / this.duration) * 100
  }

  getTimeStatus(): 'normal' | 'warning' | 'critical' {
    if (this.remaining <= this.criticalThreshold) return 'critical'
    if (this.remaining <= this.warningThreshold) return 'warning'
    return 'normal'
  }

  isRunning(): boolean {
    return this.interval !== null
  }

  isPaused(): boolean {
    return !this.interval && this.remaining > 0 && this.startTime !== null
  }

  isExpired(): boolean {
    return this.remaining === 0
  }

  destroy() {
    this.stop()
    this.callbacks = {}
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
  
  return parts.join(' ')
}

export function parseDuration(duration: string): number {
  // Parse strings like "1h 30m 45s", "90m", "2h", "3600s"
  let totalSeconds = 0
  
  const hourMatch = duration.match(/(\d+)\s*h/)
  const minuteMatch = duration.match(/(\d+)\s*m/)
  const secondMatch = duration.match(/(\d+)\s*s/)
  
  if (hourMatch) totalSeconds += parseInt(hourMatch[1]) * 3600
  if (minuteMatch) totalSeconds += parseInt(minuteMatch[1]) * 60
  if (secondMatch) totalSeconds += parseInt(secondMatch[1])
  
  // If no unit specified, assume minutes
  if (!hourMatch && !minuteMatch && !secondMatch) {
    const numMatch = duration.match(/\d+/)
    if (numMatch) totalSeconds = parseInt(numMatch[0]) * 60
  }
  
  return totalSeconds
}

export function calculatePace(totalQuestions: number, timeRemaining: number): number {
  // Returns seconds per question
  return timeRemaining > 0 ? timeRemaining / totalQuestions : 0
}

export function getEstimatedCompletion(currentQuestion: number, totalQuestions: number, pace: number): number {
  // Returns estimated seconds to complete
  const questionsRemaining = totalQuestions - currentQuestion - 1
  return questionsRemaining * pace
}

export class ExamTimer {
  private totalQuestions: number
  private questionTimes: Map<number, { start: number; end?: number }> = new Map()
  private currentQuestion: number = 0
  private totalTime: number
  private timer: CountdownTimer

  constructor(totalQuestions: number, totalTime: number) {
    this.totalQuestions = totalQuestions
    this.totalTime = totalTime
    this.timer = new CountdownTimer(totalTime)
  }

  startQuestion(questionIndex: number) {
    this.currentQuestion = questionIndex
    if (!this.questionTimes.has(questionIndex)) {
      this.questionTimes.set(questionIndex, { start: Date.now() })
    }
  }

  endQuestion(questionIndex: number) {
    const questionTime = this.questionTimes.get(questionIndex)
    if (questionTime && !questionTime.end) {
      questionTime.end = Date.now()
    }
  }

  getQuestionTime(questionIndex: number): number | null {
    const questionTime = this.questionTimes.get(questionIndex)
    if (questionTime && questionTime.end) {
      return (questionTime.end - questionTime.start) / 1000
    }
    return null
  }

  getAverageTime(): number {
    const completedTimes = Array.from(this.questionTimes.values())
      .filter(qt => qt.end)
      .map(qt => (qt.end! - qt.start) / 1000)
    
    if (completedTimes.length === 0) return 0
    return completedTimes.reduce((a, b) => a + b, 0) / completedTimes.length
  }

  getRemainingTime(): number {
    return this.timer.getRemainingTime()
  }

  getRecommendedPace(): number {
    const timeUsed = this.totalTime - this.timer.getRemainingTime()
    const questionsRemaining = this.totalQuestions - this.currentQuestion - 1
    const timeRemaining = this.timer.getRemainingTime()
    
    return questionsRemaining > 0 ? timeRemaining / questionsRemaining : 0
  }

  isOnTrack(): boolean {
    const expectedTimePerQuestion = this.totalTime / this.totalQuestions
    const averageTime = this.getAverageTime()
    return averageTime <= expectedTimePerQuestion * 1.2 // Within 20% of expected pace
  }

  getTimeAlert(): 'normal' | 'warning' | 'critical' {
    const pace = this.getRecommendedPace()
    const expectedTimePerQuestion = this.totalTime / this.totalQuestions
    
    if (pace < expectedTimePerQuestion * 0.5) {
      return 'critical' // Too slow
    } else if (pace < expectedTimePerQuestion * 0.8) {
      return 'warning' // Getting slow
    }
    return 'normal'
  }

  generateTimeReport() {
    return {
      totalTime: this.totalTime,
      remainingTime: this.timer.getRemainingTime(),
      timeUsed: this.totalTime - this.timer.getRemainingTime(),
      averageTimePerQuestion: this.getAverageTime(),
      recommendedPace: this.getRecommendedPace(),
      isOnTrack: this.isOnTrack(),
      timeAlert: this.getTimeAlert(),
      questionTimes: Object.fromEntries(this.questionTimes)
    }
  }
}