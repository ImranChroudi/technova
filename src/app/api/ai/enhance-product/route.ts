import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/provider";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, price, category_id, sku } = body;

    const supabase = await createServerSupabase();

    // Fetch similar products (same category) for price context
    let similar: any[] = [];
    if (category_id) {
      const { data } = await supabase
        .from("products")
        .select("title, price")
        .eq("category_id", Number(category_id))
        .limit(10);
      similar = data ?? [];
    }

    const context = similar.length
      ? `Similar products in same category (for price reference):\n${similar.map((p) => `- ${p.title}: ${p.price} DH`).join("\n")}`
      : "No similar products found.";

    const provider = getAIProvider();
    if (provider) {
      try {
        const messages = [
          {
            role: "system" as const,
            content:
              "You are an e-commerce product copywriter. Given a product's current info and similar products, suggest an improved title, description, and a competitive price. Return ONLY valid JSON: { \"title\": string, \"description\": string, \"price\": number }. Keep title under 80 chars. Description 2-4 sentences, compelling but factual. Price must be a number.",
          },
          {
            role: "user" as const,
            content: `Current product:\nTitle: ${title}\nDescription: ${description}\nPrice: ${price} DH\nSKU: ${sku || "n/a"}\n\n${context}\n\nReturn improved JSON.`,
          },
        ];
        const raw = await provider.chat(messages, { json: true });
        console.log("AI raw response:", raw);
        const parsed = JSON.parse(raw);
        return NextResponse.json({
          title: parsed.title || title,
          description: parsed.description || description,
          price: typeof parsed.price === "number" ? parsed.price : price,
          source: "ai",
        });
      } catch (e: any) {
        console.error("AI enhance failed, using fallback:", e?.message || e);
        return NextResponse.json({
          title,
          description,
          price,
          source: "fallback",
          error: e?.message || String(e),
        });
      }
    }

    // Fallback (no AI): simple cleanup + price suggestion from similar
    const suggestedTitle = (title || "").trim().replace(/\s+/g, " ");
    const suggestedDesc = (description || "").trim();
    let suggestedPrice = price;
    if (similar.length > 0) {
      const avg = similar.reduce((s, p) => s + Number(p.price), 0) / similar.length;
      suggestedPrice = Math.round(avg * 100) / 100;
    }
    return NextResponse.json({
      title: suggestedTitle,
      description: suggestedDesc,
      price: suggestedPrice,
      source: "fallback",
    });
  } catch (e) {
    console.error("enhance-product error:", e);
    return NextResponse.json({ error: "Failed to enhance" }, { status: 500 });
  }
}
