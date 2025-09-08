// Utility functions for managing AI API keys
export interface RuntimeAPIKeys {
  openai?: string;
  google?: string;
  openrouter?: string;
}

const AI_SETTINGS_STORAGE_KEY = 'mdx-editor-ai-settings';

/**
 * Get the runtime API keys from localStorage
 */
export function getRuntimeAPIKeys(): RuntimeAPIKeys {
  if (typeof window === 'undefined') return {};
  
  try {
    const savedSettings = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      return {
        openai: parsed.openai || undefined,
        google: parsed.google || undefined,
        openrouter: parsed.openrouter || undefined,
      };
    }
  } catch (error) {
    console.error('Failed to parse saved AI settings:', error);
  }
  
  return {};
}

/**
 * Get the effective API key for a provider (runtime key overrides environment key)
 */
export function getEffectiveAPIKey(provider: 'openai' | 'google' | 'openrouter'): string | undefined {
  const runtimeKeys = getRuntimeAPIKeys();
  
  // Return runtime key if available and not empty
  if (runtimeKeys[provider] && runtimeKeys[provider]?.trim()) {
    return runtimeKeys[provider];
  }
  
  // Fallback to environment variables (this will be handled on the server side)
  return undefined;
}

/**
 * Check if runtime API keys are configured
 */
export function hasRuntimeAPIKeys(): boolean {
  const keys = getRuntimeAPIKeys();
  return Object.values(keys).some(key => key && key.trim());
}

/**
 * Clear all runtime API keys
 */
export function clearRuntimeAPIKeys(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
    // Trigger event to notify components
    window.dispatchEvent(new CustomEvent('ai-settings-changed', { 
      detail: { openai: '', google: '', openrouter: '' }
    }));
  }
}