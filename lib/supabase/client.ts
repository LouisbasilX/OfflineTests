import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    }
  }
)

// Helper functions
export async function getTeacherProfile(userId: string) {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function createTeacherProfile(userId: string, fullName: string, institution?: string) {
  const { data, error } = await supabase
    .from('teacher_profiles')
    .insert({
      user_id: userId,
      full_name: fullName,
      institution: institution || null
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getTestByCode(testCode: string) {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('test_code', testCode)
    .gt('expires_at', new Date().toISOString())
    .single()
  
  if (error) return null
  return data
}

export async function getTeacherTests(teacherId: string) {
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getTestSubmissions(testId: string) {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('test_id', testId)
    .order('submitted_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function createSubmission(submission: {
  test_id: string
  student_name: string
  encrypted_submission_data: any
  time_logs: any
  is_suspicious: boolean
}) {
  const { data, error } = await supabase
    .from('submissions')
    .insert(submission)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function createCorrection(correction: {
  submission_id: string
  encrypted_correction_data: any
  teacher_notes?: string
}) {
  const { data, error } = await supabase
    .from('corrections')
    .insert(correction)
    .select()
    .single()
  
  if (error) throw error
  return data
}