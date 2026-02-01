export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teacher_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          institution: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          institution?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          institution?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tests: {
        Row: {
          id: string
          test_code: string
          encrypted_test_data: Json
          teacher_id: string
          duration_minutes: number
          start_test_time: string | null
          expires_at: string
          created_at: string
          allow_corrections: boolean
          metadata: Json
        }
        Insert: {
          id?: string
          test_code: string
          encrypted_test_data: Json
          teacher_id: string
          duration_minutes: number
          start_test_time?: string | null
          expires_at: string
          created_at?: string
          allow_corrections?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          test_code?: string
          encrypted_test_data?: Json
          teacher_id?: string
          duration_minutes?: number
          start_test_time?: string | null
          expires_at?: string
          created_at?: string
          allow_corrections?: boolean
          metadata?: Json
        }
      }
      submissions: {
        Row: {
          id: string
          test_id: string
          student_name: string
          encrypted_submission_data: Json
          time_logs: Json
          is_suspicious: boolean
          score: number | null
          submitted_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          test_id: string
          student_name: string
          encrypted_submission_data: Json
          time_logs: Json
          is_suspicious?: boolean
          score?: number | null
          submitted_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          test_id?: string
          student_name?: string
          encrypted_submission_data?: Json
          time_logs?: Json
          is_suspicious?: boolean
          score?: number | null
          submitted_at?: string
          expires_at?: string
        }
      }
      corrections: {
        Row: {
          id: string
          submission_id: string
          encrypted_correction_data: Json
          teacher_notes: string | null
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          encrypted_correction_data: Json
          teacher_notes?: string | null
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          submission_id?: string
          encrypted_correction_data?: Json
          teacher_notes?: string | null
          created_at?: string
          expires_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}