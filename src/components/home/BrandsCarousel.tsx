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
    <section className="section-pad container mx-auto px-4">
      <div className="mb-6 text-center">
        <p className="eyebrow">Trusted brands</p>
        <h2 className="display-title mt-1">The names you know</h2>
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div
          ref={trackRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="flex gap-4 overflow-hidden whitespace-nowrap"
        >
          {items.map((b, i) => (
            <div
              key={i}
              className="panel flex h-16 min-w-[150px] flex-shrink-0 items-center justify-center px-6 text-base font-semibold tracking-tight text-muted-foreground transition-colors hover:text-primary"
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
