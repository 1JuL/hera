import { TicTool } from '@/features/map/types';

export interface RecommendedToolRef {
  tool: TicTool;
  areaTitle: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  speechText?: string;
  timestamp: string;
  recommendedTools?: RecommendedToolRef[];
  source?: 'n8n' | 'local';
}
