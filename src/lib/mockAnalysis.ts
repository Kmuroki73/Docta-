import type { AnalysisResult } from '../types';
import type { FileCategory } from '../types';

export function generateMockAnalysis(fileName: string, category: FileCategory): AnalysisResult {
  const baseAnalysis: AnalysisResult = {
    key_insights: [
      'The document presents a comprehensive framework for modern workflow optimization, emphasizing automation and AI-assisted decision making.',
      'Key performance indicators show a 34% improvement in operational efficiency when adopting the proposed methodologies.',
      'Three core pillars are identified: process standardization, continuous monitoring, and adaptive feedback loops.',
      'Risk assessment models suggest prioritizing high-impact, low-effort initiatives in the first 90 days.',
      'Cross-functional collaboration is cited as the primary driver of sustained organizational improvement.',
    ],
    summary: `This ${category} document "${fileName}" covers essential strategies and methodologies relevant to its subject matter. The content is well-structured with clear sections addressing both theoretical foundations and practical applications. The author presents data-backed conclusions supported by case studies and empirical evidence. Overall tone is professional and informative, making it suitable for both practitioners and strategic decision-makers.`,
    best_parts: [
      'Sections 2-4: Core methodology and framework — highly actionable and clearly explained with concrete examples.',
      'Executive Summary: Concise overview of findings with quantified outcomes, perfect for stakeholder presentations.',
      'Case Studies (pages 12-18): Real-world implementations with measurable results validate the proposed approaches.',
      'Recommendations section: Prioritized action list with timelines and resource requirements.',
    ],
    ignorable_parts: [
      'Appendix B: Redundant statistical tables already summarized in the main body — skip unless deep-diving into raw data.',
      'Introduction (first 2 pages): Extensive background context most readers already know; skim quickly.',
      'Glossary section: Only reference if unfamiliar with industry-specific terminology.',
    ],
    action_items: [
      'Implement Phase 1 recommendations within 30 days — assign dedicated project owner.',
      'Schedule stakeholder review meeting to present key findings and get alignment.',
      'Set up KPI tracking dashboard using metrics defined in Section 3.',
      'Conduct team workshop on methodology described in Chapter 4.',
      'Request supplementary data from referenced studies for deeper analysis.',
    ],
    web_resources: [
      {
        title: 'Harvard Business Review — Modern Workflow Strategies',
        url: 'https://hbr.org/topics/operations',
        description: 'Peer-reviewed articles on operational excellence and organizational efficiency strategies.',
        relevance: 'high',
      },
      {
        title: 'McKinsey Global Institute — Digital Transformation',
        url: 'https://www.mckinsey.com/capabilities/operations',
        description: 'Research on AI-driven process optimization and enterprise transformation.',
        relevance: 'high',
      },
      {
        title: 'MIT Sloan Management Review',
        url: 'https://sloanreview.mit.edu',
        description: 'Academic and practical insights on management and technology integration.',
        relevance: 'medium',
      },
      {
        title: 'Gartner Research — Emerging Trends',
        url: 'https://www.gartner.com/en/research',
        description: 'Industry analysis and technology forecasts relevant to document topics.',
        relevance: 'medium',
      },
      {
        title: 'PwC — Insights & Publications',
        url: 'https://www.pwc.com/gx/en/issues',
        description: 'Global consulting insights on industry challenges and solutions.',
        relevance: 'low',
      },
    ],
    topics: ['Strategy', 'Operations', 'AI & Automation', 'Data Analytics', 'Leadership', 'Risk Management'],
    sentiment: 'positive',
    reading_time_minutes: Math.floor(Math.random() * 20) + 5,
    complexity_score: Math.floor(Math.random() * 40) + 50,
    language: 'en',
  };

  if (category === 'image') {
    return {
      ...baseAnalysis,
      image_description: `Image analysis of "${fileName}": The image contains professional content with clear visual hierarchy. Detected elements include text overlays, graphical elements, and structured layout suggesting a business or technical context. Color palette is predominantly neutral with accent colors indicating a professional design aesthetic. No sensitive personal information detected. Resolution and quality are suitable for printing at standard sizes.`,
      key_insights: [
        'Image contains structured visual content with identifiable text and graphic elements.',
        'Color scheme analysis indicates professional context — likely corporate or technical material.',
        'Detected objects: charts/graphs (2), text blocks (4), logo/branding elements (1).',
        'Image quality score: 8.4/10 — suitable for high-resolution printing and digital use.',
        'Metadata suggests creation via professional design software.',
      ],
    };
  }

  if (category === 'video') {
    return {
      ...baseAnalysis,
      media_transcript: `[00:00] Introduction and overview of the main topic.\n[02:15] Speaker introduces core concepts and foundational principles.\n[05:30] Deep dive into methodology with visual demonstrations.\n[12:45] Case study presentation with real-world examples.\n[18:20] Q&A and practical implementation discussion.\n[22:00] Summary of key takeaways and next steps.\n[24:30] Closing remarks and resource recommendations.`,
      key_insights: [
        'Video runtime analysis: 24 minutes 47 seconds — high information density throughout.',
        'Speaker presents 5 core frameworks with visual aids supporting each concept.',
        'Key demonstration at 12:45 timestamp shows highest engagement value.',
        'Audio quality: clear, no background noise, suitable for transcription.',
        'Recommended watch sections: 05:30-12:45 for core content, 22:00-24:30 for summary.',
      ],
    };
  }

  if (category === 'audio') {
    return {
      ...baseAnalysis,
      media_transcript: `[00:00] Host introduces today's episode and guests.\n[03:20] Discussion on current trends and industry developments.\n[08:15] Deep dive into the main topic with expert commentary.\n[15:40] Analysis of challenges and proposed solutions.\n[21:00] Listener questions and practical advice segment.\n[28:30] Key recommendations and resources for further learning.\n[32:00] Episode wrap-up and preview of next content.`,
      key_insights: [
        'Podcast/audio duration: approximately 32 minutes — concise and information-dense.',
        'Three expert voices identified, each contributing distinct perspectives.',
        'Most valuable segment: 08:15-15:40 containing core expert analysis.',
        'Audio clarity: excellent — transcription accuracy estimated at 97%.',
        'Key quote identified at 21:15 — highly shareable insight.',
      ],
    };
  }

  return baseAnalysis;
}
