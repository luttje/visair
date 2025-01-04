import type { AssistantConfig } from "./AssistantConfig";
import { threads } from "./ThreadStore.svelte";
import { apiLimits, type ApiLimitState } from './ApiLimitStore';

export type StreamCallbacks = {
  onTextCreated?: () => void;
  onTextDelta?: (delta: string, fullText: string) => void;
  onToolCallCreated?: (toolCall: { type: string }) => void;
  onToolCallDelta?: (delta: any, snapshot: any) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
};

export class RateLimitError extends Error {
  constructor(message: string = 'API call limit reached') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class AssistantClient {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async checkLimit() {
    let state: ApiLimitState | undefined;
    
    // Get the current state value
    const unsubscribe = apiLimits.subscribe(s => {
      state = s;
    });
    unsubscribe();

    if (!state) {
      throw new Error('Failed to get API limit state');
    }

    if (state.limit !== null && state.count >= state.limit) {
      throw new RateLimitError();
    }
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    await this.checkLimit();
    apiLimits.increment();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.statusText}`);
    }

    return response;
  }

  async createAssistant(config: AssistantConfig) {
    await this.checkLimit();
    apiLimits.increment();

    const response = await this.fetch('/v1/assistants', {
      method: 'POST',
      body: JSON.stringify({
        name: config.name,
        instructions: config.instructions,
        model: config.model || 'o1-mini'
      })
    });
    return response.json();
  }

  async createThread() {
    await this.checkLimit();
    apiLimits.increment();

    const response = await this.fetch('/v1/threads', {
      method: 'POST'
    });
    const threadData = await response.json();
    return threadData;
  }

  async addMessage(threadId: string, content: string) {
    await this.checkLimit();
    apiLimits.increment();

    return await this.fetch(`/v1/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        content
      })
    }).then(res => res.json());
  }

  async getMessages(threadId: string) {
    return await this.fetch(`/v1/threads/${threadId}/messages`).then(res => res.json());
  }

  async streamRun(threadId: string, assistantId: string, callbacks: StreamCallbacks) {
    await this.checkLimit();
    apiLimits.increment();

    // Create the run
    const run = await this.fetch(`/v1/threads/${threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: assistantId
      })
    }).then(res => res.json());

    // Setup streaming with reader
    const response = await this.fetch(`/v1/threads/${threadId}/runs/${run.id}/stream`);
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Failed to get reader from response');
    }

    let fullText = '';
    let decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          callbacks.onComplete?.();
          break;
        }

        // Decode the chunk and add it to our buffer
        buffer += decoder.decode(value, { stream: true });

        // Process any complete messages in the buffer
        let lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

        for (const line of lines) {
          if (line.trim() === '') continue;

          // Remove "data: " prefix if it exists
          const jsonStr = line.replace(/^data: /, '').trim();

          try {
            const data = JSON.parse(jsonStr);

            if (data.event === 'text_created') {
              callbacks.onTextCreated?.();
            }
            else if (data.event === 'text_delta') {
              fullText += data.delta.value;
              callbacks.onTextDelta?.(data.delta.value, fullText);
            }
            else if (data.event === 'tool_call_created') {
              callbacks.onToolCallCreated?.(data.tool_call);
            }
            else if (data.event === 'tool_call_delta') {
              callbacks.onToolCallDelta?.(data.delta, data.snapshot);
            }
            else if (data.event === 'error') {
              throw new Error(data.error);
            }
          } catch (error) {
            if (error instanceof SyntaxError) {
              // Skip invalid JSON
              continue;
            }
            throw error;
          }
        }
      }
    } catch (error) {
      callbacks.onError?.(error as Error);
    } finally {
      reader.releaseLock();
    }

    return {
      runId: run.id,
      cancel: () => {
        reader.cancel();
      }
    };
  }

  async sendMessage(threadId: string, content: string) {
    await this.checkLimit();
    apiLimits.increment();

    const thread = threads.getThread(threadId);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    // Add message
    await this.addMessage(threadId, content);

    // Create and wait for run completion
    const run = await this.fetch(`/v1/threads/${threadId}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: thread.assistantId
      })
    }).then(res => res.json());

    // Poll for completion
    while (true) {
      const status = await this.fetch(`/v1/threads/${threadId}/runs/${run.id}`).then(res => res.json());

      if (status.status === 'completed') {
        const messages = await this.getMessages(threadId);

        // Update store with new messages
        threads.updateThread(threadId, {
          messages: messages.data.map((msg: any) => ({
            role: msg.role,
            content: msg.content[0].text.value,
            timestamp: new Date(msg.created_at * 1000)
          }))
        });

        return messages.data[0].content[0].text.value;
      }

      if (status.status === 'failed') {
        throw new Error(`Run failed: ${status.last_error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}