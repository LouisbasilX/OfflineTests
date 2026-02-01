import { supabase } from './client'
import { Database } from './types'

type Tables = Database['public']['Tables']

// Test queries
export const testQueries = {
  async create(
    test: Omit<Tables['tests']['Insert'], 'id' | 'created_at'>
  ) {
    const { data, error } = await supabase
      .from('tests')
      .insert(test)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByCode(testCode: string) {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('test_code', testCode)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error) return null
    return data
  },

  async getByTeacher(teacherId: string) {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async deleteExpired() {
    const { error } = await supabase
      .from('tests')
      .delete()
      .lt('expires_at', new Date().toISOString())
    
    if (error) throw error
  },

  async updateScore(testId: string, submissionId: string, score: number) {
    const { error } = await supabase
      .from('submissions')
      .update({ score })
      .eq('id', submissionId)
      .eq('test_id', testId)
    
    if (error) throw error
  }
}

// Submission queries
export const submissionQueries = {
  async create(
    submission: Omit<Tables['submissions']['Insert'], 'id' | 'submitted_at'>
  ) {
    const { data, error } = await supabase
      .from('submissions')
      .insert(submission)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getByTest(testId: string) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('test_id', testId)
      .order('submitted_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        tests (
          test_code,
          duration_minutes,
          allow_corrections
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getSuspiciousByTeacher(teacherId: string) {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        tests!inner (
          test_code,
          teacher_id
        )
      `)
      .eq('tests.teacher_id', teacherId)
      .eq('is_suspicious', true)
      .order('submitted_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async deleteExpired() {
    const { error } = await supabase
      .from('submissions')
      .delete()
      .lt('expires_at', new Date().toISOString())
    
    if (error) throw error
  }
}

// Correction queries
export const correctionQueries = {
  async create(
    correction: Omit<Tables['corrections']['Insert'], 'id' | 'created_at'>
  ) {
    const { data, error } = await supabase
      .from('corrections')
      .insert(correction)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getBySubmission(submissionId: string) {
    const { data, error } = await supabase
      .from('corrections')
      .select('*')
      .eq('submission_id', submissionId)
      .single()
    
    if (error) return null
    return data
  },

  async deleteExpired() {
    const { error } = await supabase
      .from('corrections')
      .delete()
      .lt('expires_at', new Date().toISOString())
    
    if (error) throw error
  }
}

// Teacher queries
export const teacherQueries = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async createProfile(
    profile: Omit<Tables['teacher_profiles']['Insert'], 'id' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await supabase
      .from('teacher_profiles')
      .insert(profile)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateProfile(
    userId: string,
    updates: Partial<Tables['teacher_profiles']['Update']>
  ) {
    const { data, error } = await supabase
      .from('teacher_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Analytics queries
export const analyticsQueries = {
  async getSystemMetrics() {
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('count')
      .gt('expires_at', new Date().toISOString())
    
    const { data: submissions, error: subsError } = await supabase
      .from('submissions')
      .select('count')
      .gt('expires_at', new Date().toISOString())
    
    const { data: teachers, error: teachersError } = await supabase
      .from('teacher_profiles')
      .select('count')
    
    if (testsError || subsError || teachersError) {
      throw new Error('Failed to fetch metrics')
    }
    
    return {
      active_tests: tests?.[0]?.count || 0,
      pending_submissions: submissions?.[0]?.count || 0,
      total_teachers: teachers?.[0]?.count || 0
    }
  },

  async getTeacherStats(teacherId: string) {
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('count')
      .eq('teacher_id', teacherId)
    
    const { data: submissions, error: subsError } = await supabase
      .from('submissions')
      .select(`
        count,
        tests!inner (
          teacher_id
        )
      `)
      .eq('tests.teacher_id', teacherId)
    
    if (testsError || subsError) {
      throw new Error('Failed to fetch teacher stats')
    }
    
    return {
      total_tests: tests?.[0]?.count || 0,
      total_submissions: submissions?.[0]?.count || 0
    }
  }
}