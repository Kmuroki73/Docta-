import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Loader2, MessageSquare, RotateCw } from 'lucide-react';
import type { UploadedFile, AnalysisResult } from '../types';
import DropZone from './DropZone';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatPanelProps {
  file: UploadedFile | null;
  analysis: AnalysisResult | null;
  onFiles: (files: File[]) => void;
  onGoToAnalysis?: () => void;
}

const SUGGESTED_QUESTIONS = [
  'What are the main topics covered?',
  'Summarize the key points in 3 bullets',
  'What action items should I take?',
  'Explain the most important concept',
  'What should I focus on first?',
  'Are there any risks or concerns?',
];

function generateAIResponse(question: string, analysis: AnalysisResult | null, fileName: string): string {
  const q = question.toLowerCase();

  if (!analysis) {
    return `I don't have analysis data for "${fileName}" yet. Please run AI Analysis first so I can answer questions about this document.`;
  }

  if (q.includes('summar') || q.includes('overview') || q.includes('about')) {
    return analysis.summary;
  }

  if (q.includes('topic') || q.includes('subject')) {
    return `The document covers these main topics: **${analysis.topics.join(', ')}**.\n\n${analysis.summary.substring(0, 200)}...`;
  }

  if (q.includes('action') || q.includes('next step') || q.includes('should i')) {
    return `Based on the document, here are your action items:\n\n${analysis.action_items.map((item, i) => `${i + 1}. ${item}`).join('\n')}`;
  }

  if (q.includes('insight') || q.includes('key point') || q.includes('important') || q.includes('main')) {
    return `Here are the key insights from this document:\n\n${analysis.key_insights.map((insight, i) => `**${i + 1}.** ${insight}`).join('\n\n')}`;
  }

  if (q.includes('skip') || q.includes('ignore') || q.includes('less important')) {
    return `You can safely skip these sections:\n\n${analysis.ignorable_parts.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
  }

  if (q.includes('best') || q.includes('read') || q.includes('focus') || q.includes('priorit')) {
    return `I recommend focusing on these parts:\n\n${analysis.best_parts.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
  }

  if (q.includes('sentiment') || q.includes('tone') || q.includes('feel')) {
    return `The document has a **${analysis.sentiment}** tone overall. Complexity score: ${analysis.complexity_score}/100. Estimated reading time: ${analysis.reading_time_minutes} minutes.`;
  }

  if (q.includes('resource') || q.includes('learn more') || q.includes('research')) {
    return `Here are some suggested resources for deeper learning:\n\n${analysis.web_resources.slice(0, 3).map(r => `**${r.title}** — ${r.description}`).join('\n\n')}`;
  }

  if (q.includes('risk') || q.includes('concern') || q.includes('problem')) {
    return `Based on my analysis of "${fileName}", here are potential areas of concern:\n\n${analysis.ignorable_parts[0] || 'No specific risks identified.'}\n\nI recommend reviewing the action items section for mitigation steps.`;
  }

  // Generic contextual response
  const randomInsight = analysis.key_insights[Math.floor(Math.random() * analysis.key_insights.length)];
  return `Based on my analysis of "${fileName}":\n\n${randomInsight}\n\nThe document covers: ${analysis.topics.slice(0, 3).join(', ')}. Would you like me to go deeper on any specific aspect?`;
}

export default function ChatPanel({ file, analysis, onFiles, onGoToAnalysis }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset chat when file changes
  useEffect(() => {
    setMessages([]);
  }, [file?.id]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));

    const aiResponse = generateAIResponse(content, analysis, file?.name ?? 'document');
    const assistantMsg: Message = {
      id: `msg-${Date.now() + 1}`,
      role: 'assistant',
      content: aiResponse,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMsg]);
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">AI Chat</h2>
        <p className="text-slate-400 text-sm mb-6 max-w-xs">Upload a document, then ask the AI anything about it.</p>
        <div className="w-full max-w-sm">
          <DropZone onFiles={onFiles} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Ask AI about this document</p>
          <p className="text-xs text-slate-500 truncate">{file.name}</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-4 space-y-4">

        {messages.length === 0 && (
          <div className="space-y-4">
            {/* Welcome */}
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
                  {!analysis ? (
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Hi! I'm ready to help you understand <span className="text-white font-medium">"{file.name}"</span>. 
                      To give you accurate answers, please run <span className="text-blue-400">AI Analysis</span> first.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Hi! I've analyzed <span className="text-white font-medium">"{file.name}"</span> and I'm ready to answer your questions. Ask me anything about the content, key insights, action items, or anything else!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {!analysis && onGoToAnalysis && (
              <div className="ml-10">
                <button
                  onClick={onGoToAnalysis}
                  className="flex items-center gap-2 text-sm font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-4 py-2.5 rounded-xl transition-colors active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  Run AI Analysis First
                </button>
              </div>
            )}

            {/* Suggested questions */}
            {analysis && (
              <div className="ml-10">
                <p className="text-xs text-slate-500 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs text-slate-300 bg-white/5 hover:bg-white/10 border border-white/8 px-3 py-1.5 rounded-xl transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              msg.role === 'assistant'
                ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                : 'bg-slate-700'
            }`}>
              {msg.role === 'assistant'
                ? <Bot className="w-3.5 h-3.5 text-white" />
                : <User className="w-3.5 h-3.5 text-slate-300" />}
            </div>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-sm'
                : 'bg-white/5 border border-white/8 text-slate-200 rounded-tl-sm'
            }`}>
              {msg.content.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-white/5">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this document..."
            rows={1}
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none max-h-32 transition-all disabled:opacity-50 leading-relaxed"
            style={{ minHeight: '48px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition-all active:scale-95 flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
