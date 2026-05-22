/*
  # DocuAI Super App - Database Schema

  ## Tables Created
  
  ### 1. documents
  - Stores uploaded document metadata
  - Fields: id, user_id, name, type, size, storage_path, status, created_at, updated_at
  
  ### 2. document_analyses
  - Stores AI analysis results for documents
  - Fields: id, document_id, key_insights, summary, best_parts, ignorable_parts, action_items, web_resources, raw_analysis, created_at
  
  ### 3. document_notes
  - User-created notes linked to documents
  - Fields: id, document_id, user_id, content, color, page_number, created_at, updated_at
  
  ### 4. document_conversions
  - Tracks file conversion jobs
  - Fields: id, document_id, from_format, to_format, status, output_path, created_at
  
  ## Security
  - RLS enabled on all tables
  - Authenticated users can only access their own documents and related data
*/

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  original_name text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT '',
  file_size bigint NOT NULL DEFAULT 0,
  storage_path text DEFAULT '',
  page_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'processing',
  thumbnail_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Document analyses table
CREATE TABLE IF NOT EXISTS document_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  key_insights jsonb DEFAULT '[]',
  summary text DEFAULT '',
  best_parts jsonb DEFAULT '[]',
  ignorable_parts jsonb DEFAULT '[]',
  action_items jsonb DEFAULT '[]',
  web_resources jsonb DEFAULT '[]',
  topics jsonb DEFAULT '[]',
  sentiment text DEFAULT 'neutral',
  reading_time_minutes integer DEFAULT 0,
  complexity_score integer DEFAULT 0,
  language text DEFAULT 'en',
  raw_analysis text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE document_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analyses of own documents"
  ON document_analyses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_analyses.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analyses for own documents"
  ON document_analyses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_analyses.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update analyses for own documents"
  ON document_analyses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_analyses.document_id
      AND documents.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_analyses.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Document notes table
CREATE TABLE IF NOT EXISTS document_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL DEFAULT '',
  color text DEFAULT 'yellow',
  page_number integer DEFAULT 1,
  note_type text DEFAULT 'general',
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE document_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes"
  ON document_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON document_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON document_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON document_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Document conversions table
CREATE TABLE IF NOT EXISTS document_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  from_format text NOT NULL DEFAULT '',
  to_format text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  output_path text DEFAULT '',
  error_message text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE document_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversions"
  ON document_conversions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_conversions.document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own conversions"
  ON document_conversions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_conversions.document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_document_id ON document_analyses(document_id);
CREATE INDEX IF NOT EXISTS idx_notes_document_id ON document_notes(document_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON document_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_conversions_document_id ON document_conversions(document_id);
