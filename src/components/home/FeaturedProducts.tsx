"use client";

import { useRef } from "react";
import { useProducts } from "@/hooks/queries/use-products";
import { FeaturedProductCard } from "./FeaturedProductCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function FeaturedProducts() {
  const { data: products = [] } = useProducts();
  const featured = products.slice(0, 8);
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  if (featured.length === 0) return null;

  return (
    <div className="panel h-full p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="eyebrow">Handpicked for you</p>
          <h2 className="mt-1 text-lg font-bold md:text-xl">Featured products</h2>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => scroll(-1)} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => scroll(1)} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={scroller}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 no-scrollbar"
      >
        {featured.map((p) => (
          <FeaturedProductCard key={p.product_id} product={p} />
        ))}
      </div>
    </div>
  );
}
