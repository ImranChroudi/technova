"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Eye, ImageOff, Sparkles } from "lucide-react";
import type { ProductType } from "@/types";
import { useCart } from "@/context/CartContext";
import { track, flush } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: ProductType;
}

function isNew(product: ProductType) {
  if (!product.created_at) return false;
  const days = (Date.now() - new Date(product.created_at).getTime()) / 86_400_000;
  return days >= 0 && days <= 14;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const soldOut = product.stock === 0;

  const openProduct = () => {
    track({
      type: "product_view",
      props: { product_id: product.product_id, price: product.price },
    });
    flush();
    router.push(`/products/${product.product_id}`);
  };

  const add = (e: React.MouseEvent) => {
    e.stopPropagation();
    track({
      type: "add_to_cart",
      props: { product_id: product.product_id, price: product.price },
    });
    addToCart(product);
  };

  return (
    <Card
      className={cn(
        "panel panel-hover group relative cursor-pointer overflow-hidden",
        "border-border/60 bg-card/80 backdrop-blur-sm"
      )}
      onClick={openProduct}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
            className="object-cover p-3 transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground/50">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs font-medium">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isNew(product) && (
            <span className="brand-gradient inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
              <Sparkles className="h-3 w-3" /> New
            </span>
          )}
          {soldOut && (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-[10px] font-semibold text-destructive-foreground">
              Sold out
            </span>
          )}
          {!soldOut && product.stock <= 5 && (
            <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold text-accent-foreground">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setWishlisted((v) => !v);
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={cn(
            "absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full border bg-background/85 backdrop-blur transition-all hover:scale-110",
            wishlisted
              ? "border-destructive/30 text-destructive"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
        </button>

        {/* Quick actions */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-background via-background/85 to-transparent p-3 pt-8 transition-all duration-300",
            hovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          )}
        >
          <Button
            size="sm"
            variant="secondary"
            className="h-9 flex-1 rounded-full text-xs"
            onClick={(e) => {
              e.stopPropagation();
              openProduct();
            }}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" /> View
          </Button>
          <Button
            size="sm"
            disabled={soldOut}
            className="h-9 flex-1 rounded-full text-xs"
            onClick={add}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      {/* Details */}
      <CardContent className="space-y-2.5 p-3.5">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold transition-colors group-hover:text-primary">
            {product.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.description || "Premium quality, thoughtfully selected."}
          </p>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
              Price
            </p>
            <p className="text-lg font-bold tracking-tight">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>
          <span
            className={`mb-1 inline-flex items-center gap-1.5 text-[11px] font-medium ${
              soldOut ? "text-destructive" : "text-success"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                soldOut ? "bg-destructive" : "bg-success"
              }`}
            />
            {soldOut ? "Out of stock" : "In stock"}
          </span>
        </div>

        <div className="pt-1 sm:hidden">
          <Button
            size="sm"
            className="h-9 w-full rounded-full text-xs"
            disabled={soldOut}
            onClick={add}
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            {soldOut ? "Out of stock" : "Add to cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
