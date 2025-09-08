'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AIProvider, ChatMessage, aiService } from './service';

interface AIContextState {
  // Current provider
  selectedProvider: 'openai' | 'gemini' | 'openrouter';
  setSelectedProvider: (provider: 'openai' | 'gemini' | 'openrouter') => void;
  
  // OpenRouter model selection
  selectedModel: string | null;
  setSelectedModel: (model: string | null) => void;
  
  // Chat state
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (content: string, mode: 'markdown' | 'mdx') => Promise<void>;
  streamMessage: (content: string, mode: 'markdown' | 'mdx', onChunk: (chunk: string) => void) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  
  // Provider info
  providers: AIProvider[];
  getCurrentProvider: () => AIProvider | undefined;
  getOpenRouterModels: () => Record<string, unknown>[];
  
  // Service health
  isServiceAvailable: boolean;
  checkServiceHealth: () => Promise<void>;
}

const AIContext = createContext<AIContextState | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
  defaultProvider?: 'openai' | 'gemini' | 'openrouter';
}

export function AIProvider({ children, defaultProvider = 'gemini' }: AIProviderProps) {
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'openrouter'>(defaultProvider);
  const [selectedModel, setSelectedModel] = useState<string | null>('deepseek/deepseek-chat-v3.1:free');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState(true);

  const providers = aiService.getAllProviders();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const checkServiceHealth = useCallback(async () => {
    try {
      const healthy = await aiService.checkHealth();
      setIsServiceAvailable(healthy);
    } catch {
      setIsServiceAvailable(false);
    }
  }, []);

  // Listen for API key changes
  useEffect(() => {
    const handleAPIKeyChange = () => {
      // Force refresh of service health when API keys change
      checkServiceHealth();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ai-settings-changed', handleAPIKeyChange);
      return () => {
        window.removeEventListener('ai-settings-changed', handleAPIKeyChange);
      };
    }
  }, [checkServiceHealth]);

  const getOpenRouterModels = useCallback(() => {
    return aiService.getOpenRouterModels();
  }, []);

  const sendMessage = useCallback(async (content: string, mode: 'markdown' | 'mdx' = 'markdown') => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const model = selectedProvider === 'openrouter' ? selectedModel || undefined : undefined;
      const response = await aiService.sendMessage([userMessage], selectedProvider, mode, false, model);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('AI message error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvider, selectedModel]);

  const streamMessage = useCallback(async (
    content: string, 
    mode: 'markdown' | 'mdx' = 'markdown',
    onChunk: (chunk: string) => void
  ) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Add placeholder assistant message that will be updated
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      let fullResponse = '';
      const model = selectedProvider === 'openrouter' ? selectedModel || undefined : undefined;
      
      await aiService.streamMessage([userMessage], selectedProvider, mode, (chunk) => {
        fullResponse += chunk;
        onChunk(chunk);
        
        // Update the last message (assistant's response)
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...assistantMessage,
            content: fullResponse,
          };
          return updated;
        });
      }, model);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('AI streaming error:', err);
      
      // Remove the placeholder assistant message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvider, selectedModel]);

  const getCurrentProvider = useCallback(() => {
    return aiService.getProviderInfo(selectedProvider);
  }, [selectedProvider]);

  const value: AIContextState = {
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    messages,
    isLoading,
    error,
    sendMessage,
    streamMessage,
    clearMessages,
    clearError,
    providers,
    getCurrentProvider,
    getOpenRouterModels,
    isServiceAvailable,
    checkServiceHealth,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI(): AIContextState {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

// Hook for AI content assistance
export function useAIAssistant(mode: 'markdown' | 'mdx' = 'markdown') {
  const ai = useAI();

  const improveContent = useCallback(async (content: string) => {
    const prompt = `Please improve the following ${mode} content by enhancing clarity, structure, and readability:\n\n${content}`;
    await ai.sendMessage(prompt, mode);
  }, [ai, mode]);

  const expandContent = useCallback(async (content: string, topic: string) => {
    const prompt = `Please expand the following ${mode} content about "${topic}" with more details, examples, and explanations:\n\n${content}`;
    await ai.sendMessage(prompt, mode);
  }, [ai, mode]);

  const summarizeContent = useCallback(async (content: string) => {
    const prompt = `Please create a concise summary of the following ${mode} content:\n\n${content}`;
    await ai.sendMessage(prompt, mode);
  }, [ai, mode]);

  const correctContent = useCallback(async (content: string) => {
    const prompt = `Please fix any grammar, spelling, or syntax errors in the following ${mode} content:\n\n${content}`;
    await ai.sendMessage(prompt, mode);
  }, [ai, mode]);

  const rewriteContent = useCallback(async (content: string, style: string) => {
    const prompt = `Please rewrite the following ${mode} content in a ${style} style:\n\n${content}`;
    await ai.sendMessage(prompt, mode);
  }, [ai, mode]);

  return {
    ...ai,
    improveContent,
    expandContent,
    summarizeContent,
    correctContent,
    rewriteContent,
  };
}