import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hfmagokcqjxqyzrriqia.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmbWFnb2tjcWp4cXl6cnJpcWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2NjcwMzAsImV4cCI6MjA0OTI0MzAzMH0.rxfccILdaxjh33tnMH6OvTKBqYB4fdUuXMjHeiTjjh0";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  }
);