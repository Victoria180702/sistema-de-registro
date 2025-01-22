import { createClient } from "@supabase/supabase-js";

const supabaseUrl = `https://kkuysuwhxzkugrlgubwv.supabase.co`;
const supabaseApyKey = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdXlzdXdoeHprdWdybGd1Ynd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyODEzNjIsImV4cCI6MjA0ODg1NzM2Mn0.JSgac754acC88CJ4i34VcLNMQenVaHuU9-BtF-yl46Y`;

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseApyKey);

export default supabase;
