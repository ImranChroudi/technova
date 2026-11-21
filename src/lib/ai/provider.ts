// AI provider abstraction (OpenAI-compatible). Configure via env vars:
// AI_API_KEY (or OPENAI_API_KEY), AI_BASE_URL (default https://api.openai.com/v1),
// AI_MODEL (default gpt-4o-mini)
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  chat(messages: ChatMessage[], options?: { json?: boolean }): Promise<string>;
}

class OpenAICompatibleProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
    this.baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    this.model = process.env.AI_MODEL || "gpt-4o-mini";
  }

  async chat(messages: ChatMessage[], options?: { json?: boolean }): Promise<string> {
    if (!this.apiKey) throw new Error("No AI API key configured");
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3,
        ...(options?.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "";
  }
}

let cached: AIProvider | null = null;
export function getAIProvider(): AIProvider | null {
  const key = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) return null;
  if (!cached) cached = new OpenAICompatibleProvider();
  return cached;
}

export function hasAI(): boolean {
  return !!(process.env.AI_API_KEY || process.env.OPENAI_API_KEY);
}
