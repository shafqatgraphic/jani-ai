
export type Module = 'terminal' | 'live' | 'scan' | 'encrypt' | 'admin' | 'workspace' | 'memory' | 'system';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: {
    data: string;
    mimeType: string;
  };
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isTTSEnabled: boolean;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
