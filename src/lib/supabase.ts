import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Document = {
  id: string;
  user_id: string;
  name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  page_count: number;
  status: 'processing' | 'ready' | 'error';
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
};

export type DocumentAnalysis = {
  id: string;
  document_id: string;
  key_insights: string[];
  summary: string;
  best_parts: string[];
  ignorable_parts: string[];
  action_items: string[];
  web_resources: WebResource[];
  topics: string[];
  sentiment: string;
  reading_time_minutes: number;
  complexity_score: number;
  language: string;
  raw_analysis: string;
  created_at: string;
  updated_at: string;
};

export type WebResource = {
  title: string;
  url: string;
  description: string;
  relevance: 'high' | 'medium' | 'low';
};

export type DocumentNote = {
  id: string;
  document_id: string;
  user_id: string;
  content: string;
  color: string;
  page_number: number;
  note_type: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type DocumentConversion = {
  id: string;
  document_id: string;
  from_format: string;
  to_format: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  output_path: string;
  error_message: string;
  created_at: string;
  updated_at: string;
};
