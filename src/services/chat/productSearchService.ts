import { createServerSupabase } from "@/lib/supabase/server";

export type SearchParams = {
  keywords?: string;
  category?: string; // name or id
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  inStockOnly?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "rating";
  limit?: number;
};

export async function searchProducts(params: SearchParams) {
  const supabase = await createServerSupabase();
  let query = supabase.from("products").select("*, category:categories(id, name)");

  if (params.category) {
    const cat = params.category.trim().replace(/[^a-zA-Z0-9\s&-]/g, "");
    const { data: cats } = await supabase.from("categories").select("id, name").ilike("name", `%${cat}%`);
    if (cats && cats.length > 0) query = query.in("category_id", cats.map((c: any) => c.id));
    else if (/^\d+$/.test(cat)) query = query.eq("category_id", Number(cat));
  }

  if (typeof params.minPrice === "number") query = query.gte("price", params.minPrice);
  if (typeof params.maxPrice === "number") query = query.lte("price", params.maxPrice);
  
  if (params.keywords) {
    const kw = params.keywords.trim().replace(/[^a-zA-Z0-9\s-]/g, "");
    if (kw) query = query.or(`title.ilike.%${kw}%,description.ilike.%${kw}%,sku.ilike.%${kw}%`);
  }

  if (params.inStockOnly) query = query.gt("stock", 0);
  if (params.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (params.sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("title", { ascending: true });

  const limit = Math.min(params.limit ?? 8, 20);
  query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return data ?? [];
}
