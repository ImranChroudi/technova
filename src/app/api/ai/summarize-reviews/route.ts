import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAIProvider } from "@/lib/ai/provider";

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

    const supabase = await createServerSupabase();

    // Fetch reviews
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating, comment, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ summary: null, count: 0 });
    }

    // Check cached summary
    const { data: product } = await supabase
      .from("products")
      .select("ai_review_summary, updated_at")
      .eq("product_id", productId)
      .single();

    // Simple cache: if summary exists and review count unchanged, return it
    // (We store count in summary text; re-generate if reviews changed)
    if (product?.ai_review_summary) {
      // Re-generate only if new reviews added since last (best-effort: always regenerate if > 0 new)
      // For simplicity, return cached if present; force regen via ?force=1
      const url = new URL(req.url);
      if (url.searchParams.get("force") !== "1") {
        return NextResponse.json({ summary: product.ai_review_summary, count: reviews.length, cached: true });
      }
    }

    const reviewText = reviews
      .map((r: any) => `Rating: ${r.rating}/5 — ${r.comment || "(no comment)"}`)
      .join("\n");

    const provider = getAIProvider();
    let summary = "";
    if (provider) {
      try {
        const messages = [
          {
            role: "system" as const,
            content:
              "You are a product review summarizer. Given a list of reviews, produce a concise summary. Return ONLY valid JSON: { \"overall\": string (1-2 sentences), \"pros\": string[] (3-5 short points), \"cons\": string[] (1-3 short points), \"verdict\": string (one sentence recommendation) }.",
          },
          { role: "user" as const, content: `Reviews for product:\n${reviewText}\n\nSummarize.` },
        ];
        const raw = await provider.chat(messages, { json: true });
        const parsed = JSON.parse(raw);
        summary = JSON.stringify(parsed);
      } catch (e) {
        console.error("AI summarize failed:", e);
      }
    }

    if (!summary) {
      // Fallback: basic stats
      const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
      summary = JSON.stringify({
        overall: `Based on ${reviews.length} review${reviews.length > 1 ? "s" : ""}, average rating is ${avg.toFixed(1)}/5.`,
        pros: [],
        cons: [],
        verdict: reviews.length > 0 ? "See individual reviews for details." : "No reviews yet.",
      });
    }

    // Cache in DB
    await supabase
      .from("products")
      .update({ ai_review_summary: summary })
      .eq("product_id", productId);

    return NextResponse.json({ summary, count: reviews.length, cached: false });
  } catch (e: any) {
    console.error("summarize-reviews error:", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
