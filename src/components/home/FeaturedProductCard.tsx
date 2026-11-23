"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import type { ProductType } from "@/types";

export function FeaturedProductCard({ product }: { product: ProductType }) {
  const { addToCart } = useCart();
  const [liked, setLiked] = useState(false);

  const discount =
    product.price && product.price > 0
      ? Math.round((1 - product.price / (product.price * 1.25)) * 100)
      : 0;
  const originalPrice = product.price ? (product.price * 1.25).toFixed(2) : null;

  return (
    <div className="group flex-shrink-0 w-[78%] sm:w-[48%] md:w-full snap-start rounded-2xl border bg-card p-3 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${product.product_id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          <Image
            src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 60vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setLiked((v) => !v);
            }}
            aria-label="Toggle favorite"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>
          {discount > 0 && (
            <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              -{discount}%
            </span>
          )}
        </div>
      </Link>
      <div className="mt-3 space-y-1">
        <Link href={`/products/${product.product_id}`} className="block">
          <h3 className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-primary">${product.price}</span>
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through">${originalPrice}</span>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => {
              addToCart(product);
              toast.success("Added to cart");
            }}
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
          <Button render={<Link href={`/products/${product.product_id}`} />} nativeButton={false} size="sm" variant="outline" className="h-8 text-xs">
            View
          </Button>
        </div>
      </div>
    </div>
  );
}
