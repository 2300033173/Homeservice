import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://nysuqeibkrrbnigkmgtp.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3VxZWlia3JyYm5pZ2ttZ3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxOTY5MjAsImV4cCI6MjA3Mzc3MjkyMH0.hFAcLPTE6bW8UhIyMjlbZx8ULoDL_WzaJmL8GMtsCuI'
export const supabase = createClient(supabaseUrl, supabaseKey)