"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import type { ProductType } from "@/types";

export function PremiumProductCard({ product }: { product: ProductType }) {
  const { addToCart } = useCart();
  const [liked, setLiked] = useState(false);
  const [adding, setAdding] = useState(false);

  const originalPrice = (product.price * 1.25).toFixed(2);
  const discount = Math.round((1 - product.price / (product.price * 1.25)) * 100);

  const badges: { label: string; tone: "orange" | "navy" }[] = [];
  if (discount >= 15) badges.push({ label: `-${discount}%`, tone: "orange" });
  if (product.title.toLowerCase().includes("wireless")) badges.push({ label: "Wireless", tone: "navy" });
  if (product.stock < 30) badges.push({ label: "New Arrival", tone: "navy" });
  if (product.price > 150) badges.push({ label: "Featured", tone: "navy" });
  badges.push({ label: "Our Selection", tone: "navy" });
  // de-dupe-ish: keep first 3
  const shown = badges.slice(0, 3);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addToCart(product);
    toast.success("Added to cart");
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div className="group flex flex-col rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Image area */}
      <div className="relative aspect-square bg-muted/40 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1.5 max-w-[70%]">
          {shown.map((b, i) => (
            <span
              key={i}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow ${
                b.tone === "orange" ? "bg-orange-500" : "bg-slate-900"
              }`}
            >
              {b.label}
            </span>
          ))}
        </div>
        {/* Actions */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLiked((v) => !v);
            }}
            aria-label="Toggle wishlist"
            className="h-9 w-9 rounded-full bg-white border shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
          </button>
          <button
            type="button"
            onClick={handleAdd}
            aria-label="Add to cart"
            className="h-9 w-9 rounded-full bg-white border shadow-sm flex items-center justify-center hover:bg-primary/10 transition-colors"
          >
            <ShoppingCart className={`h-4 w-4 text-gray-700 ${adding ? "scale-125" : ""} transition-transform`} />
          </button>
        </div>
        <Link href={`/products/${product.product_id}`} className="block h-full">
          <Image
            src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.product_id}`} className="block">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem] hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>
        {product.sku && (
          <p className="mt-1 text-[11px] text-muted-foreground">Ref: {product.sku}</p>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-orange-500">{product.price} DH</span>
          <span className="text-xs text-muted-foreground line-through">{originalPrice} DH</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">TTC</p>

        <Button asChild className="mt-3 w-full h-9 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg">
          <Link href={`/products/${product.product_id}`}>VIEW PRODUCT</Link>
        </Button>
      </div>
    </div>
  );
}
