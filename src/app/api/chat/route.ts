import { NextRequest, NextResponse } from "next/server";
import { searchWithIntent } from "@/services/chat/intentService";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // sanitize
    const clean = message.trim().slice(0, 500);

    const { intent, products } = await searchWithIntent(clean, history);

    // Generate natural reply
    let reply = "";
    const provider = getAIProvider();
    if (provider && products.length > 0) {
      try {
        const prodSummary = products
          .map((p: any) => `${p.title} - ${p.price} DH - stock: ${p.stock} - ${p.description?.slice(0, 80)}`)
          .join("\n");
        const messages = [
          {
            role: "system" as const,
            content:
              "You are a helpful shopping assistant. Answer based ONLY on the products listed. Be concise and friendly. Mention how many products match. Do not invent products or details.",
          },
          ...history.slice(-6).map((h: any) => ({ role: h.role, content: h.content })),
          {
            role: "user" as const,
            content: `User message: "${clean}"\n\nMatching products:\n${prodSummary}\n\nReply helpfully.`,
          },
        ];
        reply = await provider.chat(messages);
      } catch (e) {
        console.error("AI reply failed:", e);
      }
    }

    if (!reply) {
      if (products.length === 0) {
        reply = "I couldn't find any products matching your request. Try different keywords, a broader category, or adjust your price range.";
      } else {
        reply = `I found ${products.length} product${products.length > 1 ? "s" : ""} that match your request. Take a look below!`;
      }
    }

    return NextResponse.json({ reply, products, intent });
  } catch (e) {
    console.error("Chat route error:", e);
    return NextResponse.json({ reply: "Sorry, something went wrong. Please try again.", products: [] }, { status: 200 });
  }
}
