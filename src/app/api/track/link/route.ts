import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { visitor_id, user_id } = await req.json();
    if (!visitor_id || !user_id) {
      return NextResponse.json({ ok: true });
    }
    await supabase
      .from("visitors")
      .update({ user_id })
      .eq("visitor_id", visitor_id);
    await supabase
      .from("visitor_events")
      .update({ user_id })
      .eq("visitor_id", visitor_id)
      .is("user_id", null);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
