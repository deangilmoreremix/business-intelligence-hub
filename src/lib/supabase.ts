import { getHostToken } from './hostAuth';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

/**
 * Anonymous per-browser session id. The chatbot RLS policies match rows on the
 * `x-session-id` request header, so every request must carry it.
 */
export const getSessionId = (): string => {
  try {
    let id = localStorage.getItem('chatbot_session_id');
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem('chatbot_session_id', id);
    }
    return id;
  } catch {
    return 'session_ephemeral';
  }
};

// When the host CRM has given us a tenant token (a Supabase-signed JWT with a tenant_id claim), send it so
// Row Level Security scopes every query to that tenant. Without a token the anon key is used (shared 'public' tenant).
const tenantFetch: typeof fetch = (input, init) => {
  const token = getHostToken();
  if (!token) return fetch(input, init);
  const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
  headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { headers: { 'x-session-id': getSessionId() }, fetch: tenantFetch },
});

// Database types (auto-generated from Supabase)
export interface Database {
  public: {
    Tables: {
      app_content: {
        Row: {
          id: string;
          key: string;
          value: any;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: any;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: any;
          user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}