import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tkusnuqfomrauukvdfrl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrdXNudXFmb21yYXV1a3ZkZnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1OTc2NjMsImV4cCI6MjA2NjE3MzY2M30.6iJG7rJB7QXIn3g0zqjIjCR1w3_FTrOwG83xK9inzw4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)