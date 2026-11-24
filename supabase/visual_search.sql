-- ============================================================
-- Visual Search (image embeddings) using pgvector + CLIP
-- Run in Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.product_image_embeddings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  embedding extensions.vector(512) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pie_product ON public.product_image_embeddings (product_id);
-- IVFFlat index for fast similarity search (create after data is populated)
-- CREATE INDEX idx_pie_embedding ON public.product_image_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE public.product_image_embeddings ENABLE ROW LEVEL SECURITY;
-- Public read for similarity search via RPC; writes only via service role (admin)
CREATE POLICY "pie_select_all" ON public.product_image_embeddings FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.search_similar_images(
  query_embedding extensions.vector(512),
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  product_id UUID,
  image_url TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    p.product_id,
    p.image_url,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM public.product_image_embeddings p
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;