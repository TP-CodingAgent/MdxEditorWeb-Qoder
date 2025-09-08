import { getRuntimeAPIKeys } from './keys';

export interface AIProvider {
  id: 'openai' | 'gemini' | 'openrouter';
  name: string;
  description: string;
  icon: string;
  available: boolean;
  models?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface AIResponse {
  message: string;
  provider: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export const OPENROUTER_MODELS = [
  {
    id: 'deepseek/deepseek-chat-v3.1:free',
    name: 'DeepSeek Chat v3.1',
    description: 'Advanced reasoning and coding capabilities - Free tier',
  },
  {
    id: 'moonshotai/kimi-k2:free',
    name: 'Kimi K2',
    description: 'Long context understanding and generation - Free tier',
  },
  {
    id: 'meta-llama/llama-4-scout:free',
    name: 'Llama 4 Scout',
    description: 'Meta\'s latest open-source model - Free tier',
  },
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM-4.5 Air',
    description: 'Lightweight and efficient model - Free tier',
  },
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen3 480B',
    description: 'MoE code generation model developed with strong reasoning - Free tier',
  },
];

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'ChatGPT-5',
    description: 'OpenAI GPT-5 - Advanced language model with excellent coding and writing capabilities',
    icon: '🤖',
    available: true,
  },
  {
    id: 'gemini',
    name: 'Gemini 2.5',
    description: 'Google Gemini 2.5 Flash - Fast and efficient model with multimodal capabilities',
    icon: '✨',
    available: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Multiple free AI models via OpenRouter API with customizable model selection',
    icon: '🔀',
    available: true,
    models: OPENROUTER_MODELS.map(m => m.id),
  },
];

export class AIService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/ai') {
    this.baseUrl = baseUrl;
  }

  async sendMessage(
    messages: ChatMessage[],
    provider: 'openai' | 'gemini' | 'openrouter' = 'gemini',
    mode: 'markdown' | 'mdx' = 'markdown',
    stream: boolean = false,
    model?: string
  ): Promise<AIResponse> {
    // Get runtime API keys
    const runtimeKeys = getRuntimeAPIKeys();
    
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        provider,
        mode,
        stream,
        model,
        apiKeys: runtimeKeys, // Include runtime API keys
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async streamMessage(
    messages: ChatMessage[],
    provider: 'openai' | 'gemini' | 'openrouter' = 'openai',
    mode: 'markdown' | 'mdx' = 'markdown',
    onChunk: (chunk: string) => void,
    model?: string
  ): Promise<void> {
    // Get runtime API keys
    const runtimeKeys = getRuntimeAPIKeys();
    
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        provider,
        mode,
        stream: true,
        model,
        apiKeys: runtimeKeys, // Include runtime API keys
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                onChunk(parsed.choices[0].delta.content);
              }
            } catch {
              // Ignore parsing errors for non-JSON chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`);
      return response.ok;
    } catch {
      return false;
    }
  }

  getProviderInfo(providerId: 'openai' | 'gemini' | 'openrouter'): AIProvider | undefined {
    return AI_PROVIDERS.find(p => p.id === providerId);
  }

  getOpenRouterModels() {
    return OPENROUTER_MODELS;
  }

  getAllProviders(): AIProvider[] {
    return AI_PROVIDERS;
  }
}

// Global AI service instance
export const aiService = new AIService();

// Utility functions for content assistance
export const generateContentPrompts = {
  improve: (content: string, mode: 'markdown' | 'mdx') => 
    `Please improve the following ${mode} content by enhancing clarity, structure, and readability:\n\n${content}`,
  
  expand: (content: string, topic: string, mode: 'markdown' | 'mdx') =>
    `Please expand the following ${mode} content about "${topic}" with more details, examples, and explanations:\n\n${content}`,
  
  summarize: (content: string, mode: 'markdown' | 'mdx') =>
    `Please create a concise summary of the following ${mode} content:\n\n${content}`,
  
  correct: (content: string, mode: 'markdown' | 'mdx') =>
    `Please fix any grammar, spelling, or syntax errors in the following ${mode} content:\n\n${content}`,
  
  rewrite: (content: string, style: string, mode: 'markdown' | 'mdx') =>
    `Please rewrite the following ${mode} content in a ${style} style:\n\n${content}`,
};