-- ============================================================
-- Seed / Fake Data — 30 products + 2 users
-- Run AFTER supabase/schema.sql (+ analytics_schema.sql optional)
-- All passwords: "password123"
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Auth users
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, confirmation_token,
  email_change, email_change_token_new, recovery_token
) VALUES
  ('00000000-0000-0000-0000-000000000000',
   '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated',
   'admin@example.com', crypt('password123', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}',
   '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000',
   '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated',
   'user@example.com', crypt('password123', gen_salt('bf')),
   now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jane Doe"}',
   '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
   '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@example.com"}',
   'email', '11111111-1111-1111-1111-111111111111', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
   '{"sub":"22222222-2222-2222-2222-222222222222","email":"user@example.com"}',
   'email', '22222222-2222-2222-2222-222222222222', now(), now(), now())
ON CONFLICT DO NOTHING;

-- 2. Profiles
INSERT INTO public.profiles (profile_id, username, email, avatar_url, role, created_at, updated_at) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin', 'admin@example.com', NULL, 'admin', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'janedoe', 'user@example.com', NULL, 'user', now(), now())
ON CONFLICT (profile_id) DO NOTHING;

-- 3. Categories
INSERT INTO public.categories (id, name, description, parent_id) VALUES
  (1, 'Electronics', 'Electronic devices and gadgets', NULL),
  (2, 'Clothing', 'Apparel and fashion items', NULL),
  (3, 'Accessories', 'Bags, jewelry and other accessories', NULL),
  (4, 'Smartphones', 'Mobile phones and accessories', 1),
  (5, 'Laptops', 'Portable computers', 1),
  (6, 'Footwear', 'Shoes and sneakers', NULL),
  (7, 'Home & Living', 'Home decor and essentials', NULL)
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('public.categories','id'), (SELECT MAX(id) FROM public.categories));

-- 4. Products (30)
INSERT INTO public.products (product_id, title, description, price, image, stock, sku, category_id, created_at, updated_at) VALUES
  ('33333333-3333-3333-3333-333333333301', 'Wireless Headphones', 'Premium noise-cancelling wireless headphones with 30h battery life.', 199.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 42, 'WH-001', 1, now(), now()),
  ('33333333-3333-3333-3333-333333333302', 'Smart Watch Pro', 'Fitness and health tracking smartwatch with AMOLED display.', 249.50, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 18, 'SW-002', 1, now(), now()),
  ('33333333-3333-3333-3333-333333333303', 'Classic T-Shirt', '100% cotton everyday t-shirt, unisex fit.', 24.00, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 120, 'TS-003', 2, now(), now()),
  ('33333333-3333-3333-3333-333333333304', 'Denim Jacket', 'Vintage-style denim jacket with button closure.', 89.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600', 35, 'DJ-004', 2, now(), now()),
  ('33333333-3333-3333-3333-333333333305', 'Leather Wallet', 'Genuine leather bifold wallet with RFID protection.', 45.00, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600', 60, 'LW-005', 3, now(), now()),
  ('33333333-3333-3333-3333-333333333306', 'Canvas Backpack', 'Durable canvas backpack for daily commute and travel.', 69.00, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 25, 'CB-006', 3, now(), now()),
  ('33333333-3333-3333-3333-333333333307', 'Bluetooth Speaker', 'Portable waterproof Bluetooth speaker, 12h playtime.', 59.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', 50, 'BS-007', 1, now(), now()),
  ('33333333-3333-3333-3333-333333333308', 'Running Shoes', 'Lightweight running shoes with cushioned sole.', 79.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 70, 'RS-008', 6, now(), now()),
  ('33333333-3333-3333-3333-333333333309', 'Sunglasses', 'UV400 polarized sunglasses, unisex.', 39.99, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600', 90, 'SG-009', 3, now(), now()),
  ('33333333-3333-3333-3333-333333333310', 'Yoga Mat', 'Non-slip eco-friendly yoga mat, 6mm thick.', 29.00, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600', 45, 'YM-010', 7, now(), now()),
  ('33333333-3333-3333-3333-333333333311', 'Mechanical Keyboard', 'RGB mechanical keyboard with blue switches.', 129.00, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600', 22, 'MK-011', 1, now(), now()),
  ('33333333-3333-3333-3333-333333333312', 'Hoodie', 'Fleece-lined pullover hoodie, unisex.', 49.99, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', 80, 'HD-012', 2, now(), now()),
  ('33333333-3333-3333-3333-333333333313', 'Wireless Mouse', 'Ergonomic wireless mouse, 6 buttons.', 34.50, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', 65, 'WM-013', 1, now(), now()),
  ('33333333-3333-3333-3333-333333333314', 'Beanie Hat', 'Knitted winter beanie, one size.', 18.00, 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600', 100, 'BH-014', 2, now(), now()),
  ('33333333-3333-3333-3333-333333333315', 'Desk Lamp', 'LED desk lamp with adjustable brightness.', 42.00, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', 30, 'DL-015', 7, now(), now()),
  ('33333333-3333-3333-3333-333333333316', 'Smartphone Stand', 'Aluminum phone stand, adjustable angle.', 22.99, 'https://images.unsplash.com/photo-1603539947678-cd3954ed515d?w=600', 55, 'SS-016', 4, now(), now()),
  ('33333333-3333-3333-3333-333333333317', 'Laptop Sleeve', 'Padded 13-15 inch laptop sleeve.', 27.00, 'https://images.unsplash.com/photo-1548123378-bde8b540906c?w=600', 40, 'LS-017', 5, now(), now()),
  ('33333333-3333-3333-3333-333333333318', 'Water Bottle', 'Insulated stainless steel water bottle 500ml.', 25.00, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600', 110, 'WB-018', 7, now(), now()),
  ('33333333-3333-3333-3333-333333333319', 'Trail Running Shoes', 'Grip trail shoes for outdoor running.', 95.00, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600', 28, 'TR-019', 6, now(), now()),
  ('33333333-3333-3333-3333-333333333320', 'Silk Scarf', 'Printed silk scarf, 90x90cm.', 38.00, 'https://images.unsplash.com/photo-1601924994996-1b3c0e1b5b5b?w=600', 33, 'SC-020', 3, now(), now()),
  ('33333333-3333-3333-3333-333333333321', 'USB-C Hub', '7-in-1 USB-C hub with HDMI and PD.', 49.00, 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600', 44, 'UH-021', 1, now(), now()),
  ('33333333-3333-3333-3333-333333333322', 'Jeans', 'Slim-fit stretch denim jeans.', 65.00, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 55, 'JN-022', 2, now(), now()),
  ('33333333-3333-3333-3333-333333333323', 'Smart Bulb', 'WiFi smart LED bulb, 16M colors.', 15.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 150, 'SB-023', 7, now(), now()),
  ('33333333-3333-3333-3333-333333333324', 'Earbuds', 'True wireless earbuds with charging case.', 89.00, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600', 38, 'EB-024', 1, now(), now()),
  ('33333333-3333-3333-3333-333333333325', 'Winter Boots', 'Waterproof insulated winter boots.', 120.00, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600', 20, 'WB-025', 6, now(), now()),
  ('33333333-3333-3333-3333-333333333326', 'Coffee Mug', 'Ceramic coffee mug 350ml.', 12.00, 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600', 200, 'CM-026', 7, now(), now()),
  ('33333333-3333-3333-3333-333333333327', 'Phone Case', 'Shockproof phone case, multiple colors.', 14.99, 'https://images.unsplash.com/photo-1601593346740-925612772716?w=600', 95, 'PC-027', 4, now(), now()),
  ('33333333-3333-3333-3333-333333333328', 'Laptop Stand', 'Aluminum laptop stand, ergonomic.', 39.00, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600', 32, 'LS-028', 5, now(), now()),
  ('33333333-3333-3333-3333-333333333329', 'Sports Jacket', 'Lightweight water-resistant sports jacket.', 99.00, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', 26, 'SJ-029', 2, now(), now()),
  ('33333333-3333-3333-3333-333333333330', 'Tablet 10"', '10-inch tablet, 64GB, WiFi.', 299.00, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600', 15, 'TB-030', 1, now(), now())
ON CONFLICT (product_id) DO NOTHING;

-- 5. Addresses
INSERT INTO public.addresses (id, user_id, street, city, state, zip_code, country, is_default, created_at) VALUES
  (1, '22222222-2222-2222-2222-222222222222', '123 Main St', 'Springfield', 'IL', '62701', 'US', TRUE, now()),
  (2, '11111111-1111-1111-1111-111111111111', '99 Admin Ave', 'Metropolis', 'NY', '10001', 'US', TRUE, now())
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('public.addresses','id'), (SELECT MAX(id) FROM public.addresses));

-- 6. Carts
INSERT INTO public.carts (id, user_id, status, total_items, total_price, created_at, updated_at) VALUES
  (1, '22222222-2222-2222-2222-222222222222', 'active', 2, 223.99, now(), now())
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('public.carts','id'), (SELECT MAX(id) FROM public.carts));

INSERT INTO public.cart_items (id, cart_id, product_id, quantity, price, created_at, updated_at) VALUES
  (1, 1, '33333333-3333-3333-3333-333333333301', 1, 199.99, now(), now()),
  (2, 1, '33333333-3333-3333-3333-333333333305', 1, 45.00, now(), now())
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('public.cart_items','id'), (SELECT MAX(id) FROM public.cart_items));

-- 7. Orders
INSERT INTO public.orders (id, user_id, status, total, shipping_address_id, payment_method, payment_id, created_at, updated_at) VALUES
  (1, '22222222-2222-2222-2222-222222222222', 'processing', 288.99, 1, 'polar', 'chk_seed_001', now() - interval '3 days', now()),
  (2, '22222222-2222-2222-2222-222222222222', 'delivered', 89.99, 1, 'polar', 'chk_seed_002', now() - interval '14 days', now())
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('public.orders','id'), (SELECT MAX(id) FROM public.orders));

INSERT INTO public.order_items (id, order_id, product_id, quantity, price) VALUES
  (1, 1, '33333333-3333-3333-3333-333333333301', 1, 199.99),
  (2, 1, '33333333-3333-3333-3333-333333333305', 2, 45.00),
  (3, 2, '33333333-3333-3333-3333-333333333304', 1, 89.99)
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('public.order_items','id'), (SELECT MAX(id) FROM public.order_items));

-- 8. Reviews (a few)
INSERT INTO public.reviews (id, product_id, user_id, rating, comment, created_at, updated_at) VALUES
  (1, '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222222', 5, 'Excellent sound quality and battery life!', now() - interval '2 days', now()),
  (2, '33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222222', 4, 'Comfortable and fits well.', now() - interval '5 days', now()),
  (3, '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 3, 'Good but a bit pricey.', now() - interval '1 day', now()),
  (4, '33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222222', 5, 'Super comfy for long runs.', now() - interval '3 days', now()),
  (5, '33333333-3333-3333-3333-333333333312', '22222222-2222-2222-2222-222222222222', 4, 'Warm and soft.', now() - interval '1 day', now())
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('public.reviews','id'), (SELECT MAX(id) FROM public.reviews));

-- Extra reviews for AI summarization testing
INSERT INTO public.reviews (id, product_id, user_id, rating, comment, created_at, updated_at) VALUES
  (6, '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222222', 4, 'Great sound but a bit heavy for long sessions.', now() - interval '3 days', now()),
  (7, '33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 5, 'Best headphones I have owned. Battery lasts forever.', now() - interval '1 day', now()),
  (8, '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222222', 3, 'Good but the price is high for what you get.', now() - interval '6 days', now()),
  (9, '33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222222', 5, 'Love the fitness tracking and display.', now() - interval '2 days', now()),
  (10, '33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 2, 'Battery drains too fast, disappointed.', now() - interval '4 days', now()),
  (11, '33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222222', 4, 'Stylish and warm, fits true to size.', now() - interval '1 day', now())
ON CONFLICT (id) DO NOTHING;
SELECT setval(pg_get_serial_sequence('public.reviews','id'), (SELECT MAX(id) FROM public.reviews));
