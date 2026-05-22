import type { FileCategory } from '../types';

export function getFileCategory(mimeType: string, fileName: string): FileCategory {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (mimeType === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'odt', 'rtf', 'txt', 'pages'].includes(ext)) return 'document';
  if (['xls', 'xlsx', 'ods', 'csv'].includes(ext)) return 'spreadsheet';
  if (['ppt', 'pptx', 'odp', 'key'].includes(ext)) return 'presentation';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'unknown';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(category: FileCategory): string {
  const icons: Record<FileCategory, string> = {
    pdf: 'file-text',
    document: 'file-text',
    spreadsheet: 'table',
    presentation: 'presentation',
    image: 'image',
    video: 'video',
    audio: 'music',
    unknown: 'file',
  };
  return icons[category];
}

export function getCategoryColor(category: FileCategory): string {
  const colors: Record<FileCategory, string> = {
    pdf: 'text-red-400',
    document: 'text-blue-400',
    spreadsheet: 'text-green-400',
    presentation: 'text-orange-400',
    image: 'text-pink-400',
    video: 'text-cyan-400',
    audio: 'text-yellow-400',
    unknown: 'text-slate-400',
  };
  return colors[category];
}

export function getCategoryBg(category: FileCategory): string {
  const colors: Record<FileCategory, string> = {
    pdf: 'bg-red-500/10 border-red-500/20',
    document: 'bg-blue-500/10 border-blue-500/20',
    spreadsheet: 'bg-green-500/10 border-green-500/20',
    presentation: 'bg-orange-500/10 border-orange-500/20',
    image: 'bg-pink-500/10 border-pink-500/20',
    video: 'bg-cyan-500/10 border-cyan-500/20',
    audio: 'bg-yellow-500/10 border-yellow-500/20',
    unknown: 'bg-slate-500/10 border-slate-500/20',
  };
  return colors[category];
}

export const SUPPORTED_FORMATS: Record<string, string[]> = {
  'PDF': ['application/pdf'],
  'Word': ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'Excel': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  'PowerPoint': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  'Text': ['text/plain', 'text/html', 'text/markdown'],
  'Images': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  'Video': ['video/mp4', 'video/webm', 'video/mov'],
  'Audio': ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'],
};

export function getAllAcceptedTypes(): string {
  return Object.values(SUPPORTED_FORMATS).flat().join(',');
}
