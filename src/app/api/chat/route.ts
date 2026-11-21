import { NextRequest, NextResponse } from "next/server";
import { searchWithIntent } from "@/services/chat/intentService";
import { getAIProvider } from "@/lib/ai/provider";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body;
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }
    const clean = message.trim().slice(0, 500);
    const { intent, products } = await searchWithIntent(clean, history);

    // If no products found, fetch existing categories to suggest
    let categories: { id: number; name: string }[] = [];
    if (products.length === 0) {
      const supabase = await createServerSupabase();
      const { data } = await supabase.from("categories").select("id, name").order("name");
      categories = data ?? [];
    }

    let reply = "";
    const provider = getAIProvider();
    if (provider) {
      try {
        if (products.length > 0) {
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
              content: `User: "${clean}"\n\nMatching products:\n${prodSummary}\n\nReply helpfully.`,
            },
          ];
          reply = await provider.chat(messages);
        } else {
          const catList = categories.map((c) => c.name).join(", ");
          const messages = [
            {
              role: "system" as const,
              content:
                "You are a helpful shopping assistant. The user asked for something we don't have. List the available categories (provided) and ask which one they want. Do not invent products.",
            },
            ...history.slice(-6).map((h: any) => ({ role: h.role, content: h.content })),
            {
              role: "user" as const,
              content: `User: "${clean}"\n\nAvailable categories: ${catList}\n\nReply by listing the categories and asking which they'd like to explore.`,
            },
          ];
          reply = await provider.chat(messages);
        }
      } catch (e) {
        console.error("AI reply failed:", e);
      }
    }

    if (!reply) {
      if (products.length === 0) {
        reply =
          categories.length > 0
            ? `I couldn't find products matching that. Here are our available categories — which one would you like to explore?`
            : "I couldn't find any products matching your request. Try different keywords or adjust your price range.";
      } else {
        reply = `I found ${products.length} product${products.length > 1 ? "s" : ""} that match your request. Take a look below!`;
      }
    }

    return NextResponse.json({ reply, products, categories, intent });
  } catch (e) {
    console.error("Chat route error:", e);
    return NextResponse.json({ reply: "Sorry, something went wrong. Please try again.", products: [], categories: [] }, { status: 200 });
  }
}
```<|end|>write to=assistant<|channel|>analysis<|message|>Created file successfully: /Users/macbookpro/Downloads/ecommerce-supabase-Nextjs-main/src/app/api/chat/route.ts