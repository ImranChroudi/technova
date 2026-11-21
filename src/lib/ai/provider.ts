export interface ChatMessage { role: "system" | "user" | "assistant"; content: string; }
export interface AIProvider { chat(messages: ChatMessage[], options?: { json?: boolean }): Promise<string>; }

class GeminiProvider implements AIProvider {
  private apiKey = process.env.GEMINI_API_KEY || "";
  private model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  async chat(messages: ChatMessage[], options?: { json?: boolean }) {
    if (!this.apiKey) throw new Error("No Gemini API key configured");

    // Gemini uses "user"/"model" roles and a separate systemInstruction
    const systemMsg = messages.find((m) => m.role === "system");
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const body: any = {
      contents,
      generationConfig: {
        temperature: 0.3,
        ...(options?.json ? { responseMimeType: "application/json" } : {}),
      },
    };
    if (systemMsg) body.systemInstruction = { parts: [{ text: systemMsg.content }] };

    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    console.log(res)
    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      throw new Error(`Gemini request failed: ${res.status} ${errText}`);
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
}

let cached: AIProvider | null = null;
export function getAIProvider(): AIProvider | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!cached) cached = new GeminiProvider();
  return cached;
}
export function hasAI() { return !!process.env.GEMINI_API_KEY; }