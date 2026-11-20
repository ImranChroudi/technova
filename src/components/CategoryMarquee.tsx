"use client";

import { useCategories } from "@/hooks/queries/use-categories";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CategoryMarquee() {
  const { data: categories = [] } = useCategories();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || categories.length === 0) return null;

  // Duplicate list for seamless loop
  const items = [...categories, ...categories];

  return (
    <section className="w-full overflow-hidden border-y bg-muted/30 py-4">
      <div className="relative flex">
        <div className="flex animate-marquee gap-6 whitespace-nowrap">
          {items.map((c, i) => (
            <Link
              key={`${c.id}-${i}`}
              href={`/products?category=${c.id}`}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-5 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-primary" />
              {c.name}
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
