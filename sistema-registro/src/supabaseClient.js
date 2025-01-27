import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uosaxzrbvjpgzrvfoyjh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvc2F4enJidmpwZ3pydmZveWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NzE0NzcsImV4cCI6MjA1MzE0NzQ3N30.st8rrZ1tqalqQeqIFW9Ot95DM-2RRy0m1njxN_o6Uh8';
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;
