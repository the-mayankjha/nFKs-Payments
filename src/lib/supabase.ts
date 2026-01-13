import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase URL/Key missing. Database features will fail if USE_SUPABASE=true.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');
