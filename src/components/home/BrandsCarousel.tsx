"use client";

import { useEffect, useRef, useState } from "react";

const BRANDS = [
  "Nike", "Adidas", "Apple", "Samsung", "Sony", "Puma", "Levi's", "Zara", "H&M", "Gucci",
];

export function BrandsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf: number;
    let pos = 0;
    const speed = 0.5;
    const loop = () => {
      if (!paused) {
        pos += speed;
        if (pos >= el.scrollWidth / 2) pos = 0;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const items = [...BRANDS, ...BRANDS];

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Trusted brands</p>
        <h2 className="text-xl md:text-2xl font-bold">Our brands</h2>
      </div>
      <div
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex gap-8 overflow-hidden whitespace-nowrap"
      >
        {items.map((b, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center justify-center h-16 min-w-[120px] rounded-xl border bg-card px-6 text-lg font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {b}
          </div>
        ))}
      </div>
    </section>
  );
}
