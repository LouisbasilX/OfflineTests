interface ExamState {
  answers: number[]
  currentQuestion: number
  timeLogs: Array<{questionId: string, entry: number, exit?: number}>
  lastUpdated: Date
}

interface PendingSubmission {
  testCode: string
  encryptedData: string
  timestamp: Date
}

export class IDBManager {
  private dbName = 'offlinetests'
  private version = 1
  
  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Store for exam state
        if (!db.objectStoreNames.contains('exam_state')) {
          const store = db.createObjectStore('exam_state', { keyPath: 'testCode' })
          store.createIndex('lastUpdated', 'lastUpdated')
        }
        
        // Store for pending submissions
        if (!db.objectStoreNames.contains('pending_submissions')) {
          const store = db.createObjectStore('pending_submissions', { keyPath: 'id', autoIncrement: true })
          store.createIndex('testCode', 'testCode')
          store.createIndex('timestamp', 'timestamp')
        }
        
        // Store for test data cache
        if (!db.objectStoreNames.contains('test_cache')) {
          const store = db.createObjectStore('test_cache', { keyPath: 'testCode' })
          store.createIndex('expiresAt', 'expiresAt')
        }
      }
    })
  }
  
  async saveExamState(testCode: string, state: ExamState): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['exam_state'], 'readwrite')
      const store = transaction.objectStore('exam_state')
      
      const request = store.put({
        testCode,
        ...state,
        lastUpdated: new Date()
      })
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  
  async getExamState(testCode: string): Promise<ExamState | null> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['exam_state'], 'readonly')
      const store = transaction.objectStore('exam_state')
      
      const request = store.get(testCode)
      
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }
  
  async clearExamState(testCode: string): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['exam_state'], 'readwrite')
      const store = transaction.objectStore('exam_state')
      
      const request = store.delete(testCode)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  
  async savePendingSubmission(testCode: string, encryptedData: string): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_submissions'], 'readwrite')
      const store = transaction.objectStore('pending_submissions')
      
      const request = store.add({
        testCode,
        encryptedData,
        timestamp: new Date()
      })
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  
  async getPendingSubmissions(): Promise<PendingSubmission[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_submissions'], 'readonly')
      const store = transaction.objectStore('pending_submissions')
      
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  
  async clearPendingSubmission(id: number): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['pending_submissions'], 'readwrite')
      const store = transaction.objectStore('pending_submissions')
      
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  
  async cacheTest(testCode: string, data: any, expiresAt: Date): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['test_cache'], 'readwrite')
      const store = transaction.objectStore('test_cache')
      
      const request = store.put({
        testCode,
        data,
        expiresAt,
        cachedAt: new Date()
      })
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  
  async getCachedTest(testCode: string): Promise<any> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['test_cache'], 'readonly')
      const store = transaction.objectStore('test_cache')
      
      const request = store.get(testCode)
      
      request.onsuccess = () => {
        const result = request.result
        if (result && new Date(result.expiresAt) > new Date()) {
          resolve(result.data)
        } else {
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }
  
  async cleanupExpiredCache(): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['test_cache'], 'readwrite')
      const store = transaction.objectStore('test_cache')
      const index = store.index('expiresAt')
      
      const range = IDBKeyRange.upperBound(new Date())
      const request = index.openCursor(range)
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
    })
  }
}