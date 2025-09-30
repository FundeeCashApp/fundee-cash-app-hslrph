
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://cwokeqvsjwlulcugnxth.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3b2tlcXZzandsdWxjdWdueHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTk3MTcsImV4cCI6MjA3NDgzNTcxN30.y_AHHFrQXtLPTXdCeQIK0gzBYrjw2xcC_Mhi4dHAL6I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'fundee-cash-app',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  // Increase timeout from default 6000ms to 30000ms (30 seconds)
  // This should fix the "6000ms timeout exceeded" error
  fetch: (url, options = {}) => {
    return fetch(url, {
      ...options,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
  },
})
