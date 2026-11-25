"use client";

import { useCategories } from "@/hooks/queries/use-categories";
import { useProducts } from "@/hooks/queries/use-products";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export function CategoryCarousel() {
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts();
  const scroller = useRef<HTMLDivElement>(null);

  const countFor = (id: number) =>
    products.filter((p) => p.category_id === id).length;

  const scroll = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  if (categories.length === 0) return null;

  return (
    <section id="categories" className="section-pad container mx-auto px-4">
      <div className="section-head">
        <div>
          <p className="eyebrow">Browse the collection</p>
          <h2 className="display-title mt-1">Shop by category</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous categories"
            className="panel flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next categories"
            className="panel flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {categories.map((c, i) => (
          <Link
            key={c.id}
            href={`/categories/${c.id}`}
            className="panel panel-hover group w-[165px] flex-shrink-0 snap-start overflow-hidden sm:w-[200px]"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="relative aspect-[5/4] overflow-hidden bg-muted/40">
              <Image
                src={
                  c.image ||
                  `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&sig=${c.id}`
                }
                alt={c.name}
                fill
                sizes="(max-width: 640px) 165px, 200px"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="p-3.5">
              <p className="truncate text-sm font-semibold">{c.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {countFor(c.id)} {countFor(c.id) === 1 ? "product" : "products"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
