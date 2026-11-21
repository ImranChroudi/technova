import { getAIProvider, hasAI } from "@/lib/ai/provider";
import { searchProducts } from "./productSearchService";
import type { SearchParams } from "./productSearchService";

export type Intent = {
  keywords?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "relevance" | "price_asc" | "price_desc";
  reply?: string;
};

const SYSTEM_PROMPT = `You are an e-commerce shopping assistant. Extract structured search criteria from the user's message.
Return ONLY valid JSON with these optional fields:
{
  "keywords": "search keywords",
  "category": "product category name (Electronics, Clothing, Accessories, Smartphones, Laptops, Footwear, Home & Living) or null",
  "minPrice": number or null,
  "maxPrice": number or null,
  "sort": "relevance" | "price_asc" | "price_desc" or null
}
Do not include any other text.`;

// Fallback: rule-based extraction when no AI key
function fallbackIntent(message: string): Intent {
  const m = message.toLowerCase();
  const intent: Intent = {};

  // price: under X / below X / less than X
  const underMatch = m.match(/under\s+(\d+)/) || m.match(/below\s+(\d+)/) || m.match(/less than\s+(\d+)/) || m.match(/max\s+(\d+)/);
  if (underMatch) intent.maxPrice = Number(underMatch[1]);
  const overMatch = m.match(/over\s+(\d+)/) || m.match(/above\s+(\d+)/) || m.match(/more than\s+(\d+)/) || m.match(/min\s+(\d+)/);
  if (overMatch) intent.minPrice = Number(overMatch[1]);
  const betweenMatch = m.match(/between\s+(\d+)\s+and\s+(\d+)/);
  if (betweenMatch) {
    intent.minPrice = Number(betweenMatch[1]);
    intent.maxPrice = Number(betweenMatch[2]);
  }

  // category keywords
  const catMap: Record<string, string> = {
    laptop: "Laptops", laptops: "Laptops",
    phone: "Smartphones", phones: "Smartphones", smartphone: "Smartphones", smartphones: "Smartphones", mobile: "Smartphones",
    headphone: "Electronics", headphones: "Electronics", earbuds: "Electronics",
    watch: "Electronics", smartwatch: "Electronics",
    shoe: "Footwear", shoes: "Footwear", sneaker: "Footwear", sneakers: "Footwear", boots: "Footwear",
    jacket: "Clothing", shirt: "Clothing", tshirt: "Clothing", jeans: "Clothing", hoodie: "Clothing",
    bag: "Accessories", wallet: "Accessories", backpack: "Accessories", sunglasses: "Accessories",
    lamp: "Home & Living", mug: "Home & Living", bottle: "Home & Living",
  };
  for (const [kw, cat] of Object.entries(catMap)) {
    if (m.includes(kw)) { intent.category = cat; break; }
  }

  // sort
  if (m.includes("cheapest") || m.includes("lowest price")) intent.sort = "price_asc";
  if (m.includes("most expensive") || m.includes("highest price")) intent.sort = "price_desc";

  // keywords: remove common words
  const stop = new Set(["i", "need", "want", "show", "me", "find", "a", "an", "the", "for", "with", "under", "over", "cheap", "good", "best"]);
  const words = m.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w && !stop.has(w) && !/^\d+$/.test(w));
  if (words.length) intent.keywords = words.join(" ");

  return intent;
}

export async function extractIntent(message: string): Promise<Intent> {
  const provider = getAIProvider();
  if (provider && hasAI()) {
    try {
      const content = await provider.chat(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        { json: true }
      );
      const parsed = JSON.parse(content);
      return {
        keywords: parsed.keywords || undefined,
        category: parsed.category || undefined,
        minPrice: parsed.minPrice ?? undefined,
        maxPrice: parsed.maxPrice ?? undefined,
        sort: parsed.sort || undefined,
      };
    } catch (e) {
      console.error("AI intent extraction failed, using fallback:", e);
    }
  }
  return fallbackIntent(message);
}

export async function searchWithIntent(message: string, history: { role: string; content: string }[] = []) {
  // Merge context: if message is a refinement (e.g. "under 4000"), reuse previous category/keywords
  let intent = await extractIntent(message);

  // Simple context merge: if no category/keywords in new intent but history has them, reuse
  if (!intent.category && !intent.keywords) {
    // try last user messages
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === "user") {
        const prev = await extractIntent(history[i].content);
        if (prev.category) intent.category = prev.category;
        if (prev.keywords) intent.keywords = prev.keywords;
        break;
      }
    }
  }

  const params: SearchParams = {
    keywords: intent.keywords,
    category: intent.category,
    minPrice: intent.minPrice,
    maxPrice: intent.maxPrice,
    sort: intent.sort,
    inStockOnly: true,
    limit: 8,
  };

  const products = await searchProducts(params);
  return { intent, products };
}
