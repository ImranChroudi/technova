import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitor_id, session_id, user_agent, referrer, landing_page, events } = body;

    if (!visitor_id || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ ok: true });
    }

    await supabase.from("visitors").upsert(
      {
        visitor_id,
        last_seen: new Date().toISOString(),
        user_agent: user_agent ?? null,
        referrer: referrer ?? null,
        landing_page: landing_page ?? null,
      },
      { onConflict: "visitor_id" }
    );

    const rows = events.slice(0, 100).map((e: any) => ({
      visitor_id,
      session_id: session_id ?? null,
      event_type: e.event_type,
      event_name: e.event_name ?? null,
      page_url: e.page_url ?? null,
      properties: e.properties ?? {},
    }));

    await supabase.from("visitor_events").insert(rows);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
