export type ViewMode = 'dashboard' | 'viewer' | 'analysis' | 'tools' | 'notes' | 'media';

export type FileCategory =
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'video'
  | 'audio'
  | 'unknown';

export type ConversionFormat =
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'pptx'
  | 'txt'
  | 'html'
  | 'markdown'
  | 'jpg'
  | 'png'
  | 'svg'
  | 'mp3'
  | 'mp4';

export type AnalysisTab = 'insights' | 'summary' | 'notes' | 'resources' | 'topics';

export type ToolTab = 'convert' | 'merge' | 'compress' | 'split' | 'protect' | 'print' | 'sign' | 'edit';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  preview?: string;
  progress: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  analysisStatus: 'idle' | 'analyzing' | 'complete' | 'error';
}

export interface AutoNote {
  id: string;
  content: string;
  color: string;
  note_type: string;
  source: string;
  is_pinned: boolean;
  is_auto: boolean;
  created_at: string;
}

export interface AnalysisResult {
  key_insights: string[];
  summary: string;
  best_parts: string[];
  ignorable_parts: string[];
  action_items: string[];
  web_resources: {
    title: string;
    url: string;
    description: string;
    relevance: 'high' | 'medium' | 'low';
  }[];
  topics: string[];
  sentiment: string;
  reading_time_minutes: number;
  complexity_score: number;
  language: string;
  media_transcript?: string;
  image_description?: string;
}
