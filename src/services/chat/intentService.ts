import { getAIProvider } from "@/lib/ai/provider";
import { searchProducts } from "./productSearchService";


export type Intent = { keywords?: string; category?: string; minPrice?: number; maxPrice?: number; sort?: "relevance" | "price_asc" | "price_desc"; };

const SYSTEM_PROMPT = `You are an e-commerce  shopping assistant. Extract structured search criteria from the user's message.
Return ONLY valid JSON: { "keywords": string|null, "category": "Electronics|Clothing|Accessories|Smartphones|Laptops|Footwear|Home & Living"|null, "minPrice": number|null, "maxPrice": number|null, "sort": "relevance"|"price_asc"|"price_desc"|null }`;

function fallbackIntent(message: string): Intent {
  const m = message.toLowerCase();
  const intent: Intent = {};
  const under = m.match(/under\s+(\d+)/) || m.match(/below\s+(\d+)/) || m.match(/less than\s+(\d+)/);

  if (under) intent.maxPrice = Number(under[1]);
  const over = m.match(/over\s+(\d+)/) || m.match(/above\s+(\d+)/) || m.match(/more than\s+(\d+)/);
  
  if (over) intent.minPrice = Number(over[1]);
  const between = m.match(/between\s+(\d+)\s+and\s+(\d+)/);

  if (between) { intent.minPrice = Number(between[1]); intent.maxPrice = Number(between[2]); }
  const catMap: Record<string, string> = { laptop: "Laptops", laptops: "Laptops", phone: "Smartphones", phones: "Smartphones", smartphone: "Smartphones", headphones: "Electronics", earbuds: "Electronics", watch: "Electronics", shoe: "Footwear", shoes: "Footwear", sneakers: "Footwear", boots: "Footwear", jacket: "Clothing", shirt: "Clothing", jeans: "Clothing", hoodie: "Clothing", bag: "Accessories", wallet: "Accessories", backpack: "Accessories", sunglasses: "Accessories", lamp: "Home & Living", mug: "Home & Living", bottle: "Home & Living" };

  for (const [kw, cat] of Object.entries(catMap)) if (m.includes(kw)) { intent.category = cat; break; }

  if (m.includes("cheapest")) intent.sort = "price_asc";
  if (m.includes("most expensive")) intent.sort = "price_desc";

  const stop = new Set(["i", "need", "want", "show", "me", "find", "a", "an", "the", "for", "with", "under", "over", "cheap", "good", "best"]);
  const words = m.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w && !stop.has(w) && !/^\d+$/.test(w));
  if (words.length) intent.keywords = words.join(" ");
  return intent;
}

export async function extractIntent(message: string): Promise<Intent> {
  const provider = getAIProvider();
  if (provider) {
    try {
      const content = await provider.chat(
        [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: message }],
        { json: true }
      );
      const parsed = JSON.parse(content);
      return { keywords: parsed.keywords || undefined, category: parsed.category || undefined, minPrice: parsed.minPrice ?? undefined, maxPrice: parsed.maxPrice ?? undefined, sort: parsed.sort || undefined };
    } catch (e) { console.error("AI intent failed, fallback:", e); }
  }
  return fallbackIntent(message);
}

export async function searchWithIntent(message: string, history: { role: string; content: string }[] = []) {
  let intent = await extractIntent(message);
  // context merge for refinements like "only under 4000"
  if (!intent.category && !intent.keywords) {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === "user") {
        const prev = await extractIntent(history[i].content);
        if (prev.category) intent.category = prev.category;
        if (prev.keywords) intent.keywords = prev.keywords;
        break;
      }
    }
  }
  const products = await searchProducts({ keywords: intent.keywords, category: intent.category, minPrice: intent.minPrice, maxPrice: intent.maxPrice, sort: intent.sort, inStockOnly: true, limit: 8 });
  return { intent, products };
}
