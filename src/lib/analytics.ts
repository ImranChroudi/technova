const VISITOR_KEY = "visitor_id";
const FLUSH_INTERVAL = 5000;
const MAX_BATCH = 5;

export type EventPayload = {
  type: string;
  name?: string;
  url?: string;
  props?: Record<string, unknown>;
};

let queue: EventPayload[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
    document.cookie = `${VISITOR_KEY}=${id}; Max-Age=31536000; Path=/; SameSite=Lax`;
  }
  return id;
}

export function track(event: EventPayload) {
  console.log(event)
  if (typeof window === "undefined") return;
  queue.push({ ...event, url: event.url ?? location.href });
  if (queue.length >= MAX_BATCH) flush();
}

export function flush() {
  if (typeof window === "undefined" || queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  const body = JSON.stringify({
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    user_agent: navigator.userAgent,
    referrer: document.referrer || null,
    landing_page: location.href,
    events: batch.map((e) => ({
      event_type: e.type,
      event_name: e.name ?? null,
      page_url: e.url,
      properties: e.props ?? {},
    })),
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/track", blob);
  } else {
    fetch("/api/track", {
      method: "POST",
      body,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  }
}

export function initAnalytics() {
  if (typeof window === "undefined") return;
  getVisitorId();
  if (timer) clearInterval(timer);
  timer = setInterval(flush, FLUSH_INTERVAL);
  window.addEventListener("pagehide", flush);
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

export async function linkVisitorToUser(userId: string) {
  if (typeof window === "undefined") return;
  const vid = localStorage.getItem(VISITOR_KEY);
  if (!vid) return;
  try {
    await fetch("/api/track/link", {
      method: "POST",
      body: JSON.stringify({ visitor_id: vid, user_id: userId }),
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    });
  } catch {
    // ignore
  }
}
