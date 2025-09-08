import { NextRequest, NextResponse } from 'next/server';
import { generateText, streamText } from 'ai';
import { openai, createOpenAI } from '@ai-sdk/openai';
import { google, createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

export const runtime = 'edge';

// AI Provider configurations
const getAIModel = (provider: 'openai' | 'gemini' | 'openrouter', model?: string, apiKeys?: Record<string, string>) => {
  switch (provider) {
    case 'openai':
      const openaiConfig = apiKeys?.openai ? { apiKey: apiKeys.openai } : {};
      if (Object.keys(openaiConfig).length > 0) {
        const openrouter = createOpenAI(openaiConfig);
        return openrouter.chat('gpt-5');
      }
      return openai('gpt-5');
    
    case 'openrouter':
      const openrouter = createOpenRouter({
        apiKey: apiKeys?.openrouter || process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
      });
      return openrouter(model || 'deepseek/deepseek-chat-v3.1:free');
    case 'gemini':
    default:
      // Remove unused geminiConfig variable
      if (apiKeys?.google) {
        const googleAI = createGoogleGenerativeAI({ 
          apiKey: apiKeys.google 
        });
        return googleAI('gemini-2.5-flash');
      }
      return google('gemini-2.5-flash');
  }
};

export async function POST(req: NextRequest) {
  try {
    const { messages, provider = 'openai', stream = false, mode = 'markdown', model, apiKeys } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Validate provider
    if (!['openai', 'gemini', 'openrouter'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "openai", "gemini", or "openrouter"' },
        { status: 400 }
      );
    }

    const aiModel = getAIModel(provider, model, apiKeys);

    // System prompt for MDX/Markdown assistance
    const systemPrompt = `You are an expert AI assistant specializing in ${mode.toUpperCase()} content creation and editing. 

Your capabilities include:
- Writing high-quality ${mode} content
- Improving existing content structure and clarity
- Suggesting better formatting and organization
- Adding relevant examples and explanations
- Fixing grammar, spelling, and syntax issues
${mode === 'mdx' ? '- Suggesting appropriate React components for interactive content' : ''}
- Providing content suggestions based on user requests

When working with ${mode} content:
- Always maintain proper ${mode} syntax
- Ensure content is well-structured and readable
- Provide helpful and accurate information
- Keep responses focused and relevant to the user's request
${mode === 'mdx' ? '- Use MDX components (like <Callout>, <Counter>, <ProgressBar>) when appropriate' : ''}

Always respond in a helpful, professional, and concise manner.
Additionally, for all proposed ${mode} content which should be wrapped in the standard "\`\`\`${mode} \`\`\`" code block of the ${mode} mode at the end of the answer. After it there will be no more content.
`;

    const fullMessages = [
      {
        role: 'system' as const,
        content: systemPrompt,
      },
      ...messages,
    ];

    console.log('- aiModel: ', aiModel);
    if (stream) {
      // Streaming response
      const result = await streamText({
        model: aiModel,
        messages: fullMessages,
        temperature: 0.7,
        maxOutputTokens: 4000,
      });

      return result.toTextStreamResponse();
    } else {
      // Non-streaming response
      const result = await generateText({
        model: aiModel,
        messages: fullMessages,
        temperature: 0.7,
        maxOutputTokens: 4000,
      });

      return NextResponse.json({
        message: result.text,
        provider,
        usage: result.usage,
      });
    }
  } catch (error) {
    console.error('AI API Error:', error);

    // Check for API key errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error. Please check API keys.' },
          { status: 500 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'AI service quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'AI Chat API is running',
    providers: ['openai', 'gemini', 'openrouter'],
    timestamp: new Date().toISOString(),
  });
}