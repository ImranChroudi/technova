"use client";

import { useCategories } from "@/hooks/queries/use-categories";
import { useProducts } from "@/hooks/queries/use-products";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export function CategoryCarousel() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const scroller = useRef<HTMLDivElement>(null);

  const countFor = (id: number) => products.filter((p) => p.category_id === id).length;

  const scroll = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Browse</p>
          <h2 className="text-xl md:text-2xl font-bold">Categories</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="h-9 w-9 rounded-full border bg-background hover:bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next"
            className="h-9 w-9 rounded-full border bg-background hover:bg-muted flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 no-scrollbar"
      >
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.id}`}
            className="group flex-shrink-0 w-[160px] sm:w-[180px] snap-start overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-[4/3] bg-muted/40 overflow-hidden">
              <Image
                src={`https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&sig=${c.id}`}
                alt={c.name}
                fill
                sizes="180px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm truncate">{c.name}</p>
              <p className="text-xs text-muted-foreground">{countFor(c.id)} products</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
