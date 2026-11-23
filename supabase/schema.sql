-- ============================================================
-- E-commerce Supabase (PostgreSQL) — Full Database Schema
-- Extracted from the ecommerce-supabase-Nextjs-main project
-- (src/services, src/types, docs/schema.md, supabase/migrations)
-- ============================================================
-- Run in the Supabase SQL Editor (or as a migration).
-- All tables live in the "public" schema and use Row Level Security.
-- ============================================================

-- ------------------------------------------------------------
-- Custom ENUM types
-- ------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.order_status AS ENUM
    ('pending','processing','shipped','delivered','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cart_status AS ENUM
    ('active','abandoned','converted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- profiles
-- Stores user profile information (1:1 with auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  profile_id  UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT,
  email       TEXT,
  avatar_url  TEXT,
  role        TEXT        NOT NULL DEFAULT 'user'
              CHECK (role IN ('admin','user')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "profiles_admin_select" ON public.profiles
  FOR SELECT USING (auth.uid() IN (SELECT profile_id FROM public.admin_users));

-- View exposing admin users (used by the app for admin checks)
CREATE OR REPLACE VIEW public.admin_users AS
  SELECT profile_id, username, email, role, created_at
  FROM public.profiles
  WHERE role = 'admin';

-- ============================================================
-- categories  (self-referencing for subcategories)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR NOT NULL,
  description TEXT    NOT NULL,
  parent_id   INTEGER REFERENCES public.categories(id) ON DELETE SET NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "categories_admin_write" ON public.categories
  FOR ALL USING (auth.uid() IN (SELECT profile_id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM public.admin_users));

-- ============================================================
-- products
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  product_id  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR     NOT NULL,
  description TEXT        NOT NULL,
  price       NUMERIC     NOT NULL CHECK (price > 0),
  image       VARCHAR,
  images      TEXT[],
  stock       INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku         VARCHAR,
  category_id INTEGER     REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_all" ON public.products
  FOR SELECT USING (true);
  
CREATE POLICY "products_admin_write" ON public.products
  FOR ALL USING (auth.uid() IN (SELECT profile_id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT profile_id FROM public.admin_users));

-- ============================================================
-- addresses
-- ============================================================
CREATE TABLE IF NOT EXISTS public.addresses (
  id       SERIAL      PRIMARY KEY,
  user_id  UUID        NOT NULL REFERENCES public.profiles(profile_id) ON DELETE CASCADE,
  street   VARCHAR     NOT NULL,
  city     VARCHAR     NOT NULL,
  state    VARCHAR,
  zip_code VARCHAR     NOT NULL,
  country  VARCHAR     NOT NULL,
  is_default BOOLEAN   DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_own_all" ON public.addresses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- orders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id                  SERIAL        PRIMARY KEY,
  user_id             UUID          NOT NULL REFERENCES public.profiles(profile_id),
  status              public.order_status NOT NULL DEFAULT 'pending',
  total               NUMERIC       NOT NULL CHECK (total >= 0),
  shipping_address_id INTEGER       NOT NULL REFERENCES public.addresses(id),
  payment_method      VARCHAR,
  payment_id          VARCHAR,
  created_at          TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user        ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id  ON public.orders(payment_id);
-- Partial unique index inferred from idempotency handling in the app code
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_id_unique
  ON public.orders(payment_id) WHERE payment_id IS NOT NULL;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id         SERIAL  PRIMARY KEY,
  order_id   INTEGER NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID    NOT NULL REFERENCES public.products(product_id) ON DELETE RESTRICT,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  price      NUMERIC NOT NULL CHECK (price >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.orders WHERE id = order_id));
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.orders WHERE id = order_id));

-- ============================================================
-- reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id         SERIAL      PRIMARY KEY,
  product_id UUID        NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES public.profiles(profile_id),
  rating     INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user    ON public.reviews(user_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- carts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.carts (
  id           SERIAL      PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES public.profiles(profile_id) ON DELETE CASCADE,
  status       public.cart_status NOT NULL DEFAULT 'active',
  total_items  INTEGER     NOT NULL DEFAULT 0,
  total_price  NUMERIC     NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_carts_user_status ON public.carts(user_id, status);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carts_own_all" ON public.carts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- cart_items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         SERIAL  PRIMARY KEY,
  cart_id    INTEGER NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID    NOT NULL REFERENCES public.products(product_id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  price      NUMERIC NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart    ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cart_items_own_all" ON public.cart_items
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM public.carts WHERE id = cart_id)
  ) WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.carts WHERE id = cart_id)
  );

-- ============================================================
-- Notes
-- ------------------------------------------------------------
-- * `profiles.profile_id` mirrors `auth.users.id` (Supabase Auth).
-- * `admin_users` is a VIEW over profiles (role = 'admin'), not a table.
-- * `carts.total_items` / `carts.total_price` are stored with DEFAULT 0;
--   the app computes them client-side. Convert to GENERATED columns if
--   you want them derived from cart_items.
-- * Storage buckets used by the app for avatars/images: "avatars",
--   "images", "public", "default", "storage" (created in Supabase
--   Storage, not in this SQL schema).
-- * Migration 20250101_add_payment_id_index.sql adds idx_orders_payment_id
--   (already included above).
-- ============================================================
