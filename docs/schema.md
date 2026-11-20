# Database Schema Documentation

> Extracted from the `ecommerce-supabase-Nextjs-main` project (services, types, docs, and migrations).

## Overview

This document outlines the database schema for the e-commerce application. We use Supabase (PostgreSQL) as the database provider. All tables live in the `public` schema and have Row Level Security (RLS) enabled.

A ready-to-run DDL file is available at [`supabase/schema.sql`](../supabase/schema.sql).

## Common Queries

### Get all products in a category
```sql
SELECT * FROM products WHERE category_id = [category_id];
```

### Get all orders for a user
```sql
SELECT * FROM orders WHERE user_id = [user_id];
```

### Get all items in an order with product details
```sql
SELECT oi.*, p.title, p.image
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
WHERE oi.order_id = [order_id];
```

### Get all reviews for a product
```sql
SELECT r.*, p.username
FROM reviews r
JOIN profiles p ON r.user_id = p.profile_id
WHERE r.product_id = [product_id];
```

### Get user's default shipping address
```sql
SELECT * FROM addresses
WHERE user_id = [user_id] AND is_default = true;
```

### Get active cart with items
```sql
SELECT ci.*, p.title, p.image, p.price
FROM cart_items ci
JOIN products p ON ci.product_id = p.product_id
WHERE ci.cart_id = (SELECT id FROM carts WHERE user_id = [user_id] AND status = 'active');
```

## Tables

### profiles

Stores user profile information (1:1 with `auth.users`).

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| profile_id   | UUID         | Primary key, matches Supabase auth.uid() | PK, NOT NULL, FK → auth.users(id) ON DELETE CASCADE |
| username     | TEXT         | User's display name                      | NULL allowed     |
| email        | TEXT         | User's email                             | NULL allowed     |
| avatar_url   | TEXT         | URL to user's avatar image               | NULL allowed     |
| role         | TEXT         | 'admin' or 'user'                        | NOT NULL, DEFAULT 'user', CHECK (role IN ('admin','user')) |
| created_at   | TIMESTAMPTZ  | When the profile was created             | NOT NULL, DEFAULT now() |
| updated_at   | TIMESTAMPTZ  | When the profile was last updated        | DEFAULT now()    |

#### RLS Policies
- Users can insert their own profile: `auth.uid() = profile_id`
- Users can view their own profile: `auth.uid() = profile_id`
- Users can update their own profile: `auth.uid() = profile_id`
- Admins can view all profiles: `auth.uid() IN (SELECT profile_id FROM admin_users)`

### products

Stores product information.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| product_id   | UUID         | Primary key                              | PK, NOT NULL, DEFAULT gen_random_uuid() |
| title        | VARCHAR      | Product title                            | NOT NULL        |
| description  | TEXT         | Product description                      | NOT NULL        |
| price        | NUMERIC      | Product price                            | NOT NULL, CHECK (price > 0) |
| image        | VARCHAR      | URL to product image                     | NULL allowed     |
| stock        | INTEGER      | Available stock                          | NOT NULL, DEFAULT 0, CHECK (stock >= 0) |
| sku          | VARCHAR      | Stock keeping unit                       | NULL allowed     |
| category_id  | INTEGER      | Reference to categories.id               | FK, NULL allowed, ON DELETE SET NULL |
| created_at   | TIMESTAMPTZ  | When the product was created             | DEFAULT CURRENT_TIMESTAMP |
| updated_at   | TIMESTAMPTZ  | When the product was last updated        | DEFAULT CURRENT_TIMESTAMP |

#### RLS Policies
- Everyone can view products: `true`
- Only admins can insert/update/delete products: `auth.uid() IN (SELECT profile_id FROM admin_users)`

### categories

Stores product categories (self-referencing for subcategories).

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| id           | SERIAL       | Primary key                              | PK, NOT NULL     |
| name         | VARCHAR      | Category name                            | NOT NULL        |
| description  | TEXT         | Category description                     | NOT NULL        |
| parent_id    | INTEGER      | Reference to parent category             | FK (self), NULL allowed, ON DELETE SET NULL |

#### RLS Policies
- Everyone can view categories: `true`
- Only admins can insert/update/delete categories: `auth.uid() IN (SELECT profile_id FROM admin_users)`

### addresses

Stores user addresses.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| id           | SERIAL       | Primary key                              | PK, NOT NULL     |
| user_id      | UUID         | Reference to profiles.profile_id         | FK, NOT NULL, ON DELETE CASCADE |
| street       | VARCHAR      | Street address                           | NOT NULL        |
| city         | VARCHAR      | City                                     | NOT NULL        |
| state        | VARCHAR      | State/province                           | NULL allowed     |
| zip_code     | VARCHAR      | Postal/zip code                          | NOT NULL        |
| country      | VARCHAR      | Country                                  | NOT NULL        |
| is_default   | BOOLEAN      | Whether this is the default address      | DEFAULT FALSE    |
| created_at   | TIMESTAMPTZ  | When the address was created             | DEFAULT CURRENT_TIMESTAMP |

#### RLS Policies
- Users can view/insert/update their own addresses: `auth.uid() = user_id`

### orders

Stores order information.

| Column              | Type          | Description                        | Constraints       |
|--------------------|----------------|------------------------------------|--------------------|
| id                 | SERIAL        | Primary key                         | PK, NOT NULL       |
| user_id            | UUID          | Reference to profiles.profile_id    | FK, NOT NULL       |
| status             | order_status  | Order status (enum)                 | NOT NULL, DEFAULT 'pending' |
| total              | NUMERIC       | Total amount of the order           | NOT NULL, CHECK (total >= 0) |
| shipping_address_id| INTEGER       | Reference to addresses.id           | FK, NOT NULL       |
| payment_method     | VARCHAR       | Payment method used                 | NULL allowed       |
| payment_id         | VARCHAR       | Payment provider reference ID       | NULL allowed, UNIQUE (partial, WHERE payment_id IS NOT NULL) |
| created_at         | TIMESTAMPTZ   | When the order was created          | DEFAULT CURRENT_TIMESTAMP |
| updated_at         | TIMESTAMPTZ   | When the order was last updated     | DEFAULT CURRENT_TIMESTAMP |

#### RLS Policies
- Users can insert their own orders: `auth.uid() = user_id`
- Users can view their own orders: `auth.uid() = user_id`

### order_items

Stores items in an order.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| id           | SERIAL       | Primary key                              | PK, NOT NULL     |
| order_id     | INTEGER      | Reference to orders.id                   | FK, NOT NULL, ON DELETE CASCADE |
| product_id   | UUID         | Reference to products.product_id         | FK, NOT NULL, ON DELETE RESTRICT |
| quantity     | INTEGER      | Quantity of the product                  | NOT NULL, CHECK (quantity > 0) |
| price        | NUMERIC      | Price of the product at time of purchase | NOT NULL, CHECK (price >= 0) |

#### RLS Policies
- Users can view their own order items: `auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)`
- Users can insert items into their own orders: `auth.uid() = (SELECT user_id FROM orders WHERE id = order_id)`

### reviews

Stores product reviews.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| id           | SERIAL       | Primary key                              | PK, NOT NULL     |
| product_id   | UUID         | Reference to products.product_id         | FK, NOT NULL, ON DELETE CASCADE |
| user_id      | UUID         | Reference to profiles.profile_id         | FK, NOT NULL     |
| rating       | INTEGER      | Rating (1-5)                             | NOT NULL, CHECK (rating BETWEEN 1 AND 5) |
| comment      | TEXT         | Review text                              | NULL allowed     |
| created_at   | TIMESTAMPTZ  | When the review was created              | DEFAULT CURRENT_TIMESTAMP |
| updated_at   | TIMESTAMPTZ  | When the review was last updated         | DEFAULT CURRENT_TIMESTAMP |

#### RLS Policies
- Everyone can view reviews: `true`
- Users can insert/update their own reviews: `auth.uid() = user_id`

### carts

Stores a user's shopping cart (one active cart per user).

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| id           | SERIAL       | Primary key                              | PK, NOT NULL     |
| user_id      | UUID         | Reference to profiles.profile_id         | FK, NOT NULL, ON DELETE CASCADE |
| status       | cart_status  | Cart status (enum)                       | NOT NULL, DEFAULT 'active' |
| total_items  | INTEGER      | Total number of items (stored, default 0; app computes client-side) | NOT NULL, DEFAULT 0 |
| total_price  | NUMERIC      | Total price (stored, default 0; app computes client-side) | NOT NULL, DEFAULT 0 |
| created_at   | TIMESTAMPTZ  | When the cart was created                | DEFAULT CURRENT_TIMESTAMP |
| updated_at   | TIMESTAMPTZ  | When the cart was last updated           | DEFAULT CURRENT_TIMESTAMP |

#### RLS Policies
- Users can manage their own carts: `auth.uid() = user_id`

### cart_items

Stores items in a cart.

| Column       | Type         | Description                              | Constraints       |
|--------------|--------------|------------------------------------------|------------------|
| id           | SERIAL       | Primary key                              | PK, NOT NULL     |
| cart_id      | INTEGER      | Reference to carts.id                    | FK, NOT NULL, ON DELETE CASCADE |
| product_id   | UUID         | Reference to products.product_id         | FK, NOT NULL, ON DELETE CASCADE |
| quantity     | INTEGER      | Quantity of the product                  | NOT NULL, CHECK (quantity > 0) |
| price        | NUMERIC      | Price of the product at time of adding   | NOT NULL, CHECK (price >= 0) |
| created_at   | TIMESTAMPTZ  | When the item was added                  | DEFAULT CURRENT_TIMESTAMP |
| updated_at   | TIMESTAMPTZ  | When the item was last updated           | DEFAULT CURRENT_TIMESTAMP |

#### RLS Policies
- Users can manage their own cart items: `auth.uid() = (SELECT user_id FROM carts WHERE id = cart_id)`

## Custom Types

### order_status
An ENUM type with the following values:
- 'pending'
- 'processing'
- 'shipped'
- 'delivered'
- 'cancelled'

### cart_status
An ENUM (or TEXT with CHECK) type with the following values:
- 'active'
- 'abandoned'
- 'converted'

## Views

### admin_users
A view over `profiles` filtering `role = 'admin'`. Exposes `profile_id`, `username`, `email`, `role`, `created_at`. Used by the app to check admin privileges and by RLS policies.

## Relationships

- `profiles.profile_id` ← `orders.user_id`: A user can have many orders
- `profiles.profile_id` ← `addresses.user_id`: A user can have many addresses
- `profiles.profile_id` ← `reviews.user_id`: A user can write many reviews
- `profiles.profile_id` ← `carts.user_id`: A user can have many carts
- `addresses.id` ← `orders.shipping_address_id`: An address can be used for many orders
- `orders.id` ← `order_items.order_id`: An order can have many order items (CASCADE on delete)
- `products.product_id` ← `order_items.product_id`: A product can be in many order items (RESTRICT on delete)
- `products.product_id` ← `reviews.product_id`: A product can have many reviews (CASCADE on delete)
- `products.product_id` ← `cart_items.product_id`: A product can be in many cart items (CASCADE on delete)
- `categories.id` ← `products.category_id`: A category can have many products (SET NULL on delete)
- `categories.id` ← `categories.parent_id`: A category can have subcategories (SET NULL on delete)
- `carts.id` ← `cart_items.cart_id`: A cart can have many cart items (CASCADE on delete)

## Indexes

- `idx_products_category`: Index on `products.category_id`
- `idx_orders_user`: Index on `orders.user_id`
- `idx_orders_payment_id`: Index on `orders.payment_id`
- `idx_orders_payment_id_unique`: Unique partial index on `orders.payment_id` (WHERE payment_id IS NOT NULL)
- `idx_order_items_order`: Index on `order_items.order_id`
- `idx_order_items_product`: Index on `order_items.product_id`
- `idx_reviews_product`: Index on `reviews.product_id`
- `idx_reviews_user`: Index on `reviews.user_id`
- `idx_addresses_user`: Index on `addresses.user_id`
- `idx_carts_user_status`: Index on `carts(user_id, status)`
- `idx_cart_items_cart`: Index on `cart_items.cart_id`
- `idx_cart_items_product`: Index on `cart_items.product_id`

## Notes on Security

- All tables have Row Level Security (RLS) enabled
- Policies are designed to ensure users can only access their own data
- Product and category data is publicly readable but protected for writes
- Only administrators can create or modify products and categories
- `admin_users` is a view over `profiles` (role = 'admin'), not a separate table
- Supabase Auth manages the `auth.users` table; `profiles.profile_id` mirrors `auth.users.id`

## Storage

The app uses Supabase Storage buckets for avatars/images. Bucket names tried by the client: `avatars`, `images`, `public`, `default`, `storage`. These are configured in Supabase Storage, not in this SQL schema.
