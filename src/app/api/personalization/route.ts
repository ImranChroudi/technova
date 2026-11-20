import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visitorId = searchParams.get("visitor_id");
    const userId = searchParams.get("user_id");

    // Recently viewed product ids
    let evQuery = supabase
      .from("visitor_events")
      .select("properties, created_at")
      .eq("event_type", "product_view")
      .order("created_at", { ascending: false })
      .limit(50);
    if (userId) evQuery = evQuery.eq("user_id", userId);
    else if (visitorId) evQuery = evQuery.eq("visitor_id", visitorId);

    const { data: events } = await evQuery;
    const seen = new Set<string>();
    const recentIds: string[] = [];
    for (const r of events ?? []) {
      const pid = r.properties?.product_id;
      if (pid && !seen.has(pid)) {
        seen.add(pid);
        recentIds.push(pid);
        if (recentIds.length >= 12) break;
      }
    }

    // Recommended: top categories from views (for logged-in), else best sellers
    let recommendedIds: string[] = [];
    if (userId && recentIds.length > 0) {
      const { data: prods } = await supabase
        .from("products")
        .select("product_id, category_id")
        .in("product_id", recentIds);
      const catCounts = new Map<number, number>();
      for (const p of prods ?? []) {
        if (p.category_id != null) catCounts.set(p.category_id, (catCounts.get(p.category_id) ?? 0) + 1);
      }
      const topCats = [...catCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0]);
      if (topCats.length > 0) {
        const { data: recs } = await supabase
          .from("products")
          .select("product_id")
          .in("category_id", topCats)
          .not("product_id", "in", `(${recentIds.join(",")})`)
          .limit(8);
        recommendedIds = (recs ?? []).map((r: any) => r.product_id);
      }
    }
    // Only fall back to best-sellers for logged-in users or visitors with
    // viewing history. First-time anonymous visitors get nothing, so the
    // "Picked for you" section doesn't appear before they've browsed.
    if (recommendedIds.length === 0 && (userId || recentIds.length > 0)) {
      const { data: bs } = await supabase
        .from("products")
        .select("product_id")
        .order("stock", { ascending: false })
        .limit(8);
      recommendedIds = (bs ?? []).map((r: any) => r.product_id);
    }

    const allIds = [...new Set([...recentIds, ...recommendedIds])];
    const { data: products } = allIds.length
      ? await supabase.from("products").select("*").in("product_id", allIds)
      : { data: [] };

    const byId = new Map((products ?? []).map((p: any) => [p.product_id, p]));
    const recentlyViewed = recentIds.map((id) => byId.get(id)).filter(Boolean);
    const recommended = recommendedIds.map((id) => byId.get(id)).filter(Boolean);

    return NextResponse.json({ recentlyViewed, recommended });
  } catch {
    return NextResponse.json({ recentlyViewed: [], recommended: [] }, { status: 200 });
  }
}
