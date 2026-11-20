-- ============================================================
-- Anonymous visitor tracking schema
-- Run AFTER supabase/schema.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.visitors (
  visitor_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_seen    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen     TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id       UUID REFERENCES public.profiles(profile_id) ON DELETE SET NULL,
  user_agent    TEXT,
  referrer      TEXT,
  landing_page  TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  device_type   TEXT
);

CREATE TABLE IF NOT EXISTS public.visitor_events (
  id          BIGSERIAL PRIMARY KEY,
  visitor_id  UUID NOT NULL REFERENCES public.visitors(visitor_id) ON DELETE CASCADE,
  session_id  UUID,
  user_id     UUID REFERENCES public.profiles(profile_id) ON DELETE SET NULL,
  event_type  TEXT NOT NULL,
  event_name  TEXT,
  page_url    TEXT,
  referrer    TEXT,
  properties  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ve_visitor  ON public.visitor_events (visitor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ve_type     ON public.visitor_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ve_created  ON public.visitor_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ve_user     ON public.visitor_events (user_id, created_at DESC);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;
-- No public policies: only the service role (API route) reads/writes.
