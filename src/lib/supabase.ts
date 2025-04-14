import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If Supabase credentials are missing, use mock data
export const useMockData = !supabaseUrl || !supabaseAnonKey;

export const supabase = useMockData 
  ? null 
  : createClient(supabaseUrl, supabaseAnonKey);