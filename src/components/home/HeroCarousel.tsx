"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";

export type HeroSlide = {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  cta: string;
  href: string;
  image: string;
  imageAlt: string;
};

const SLIDES: HeroSlide[] = [
  {
    badge: "New Arrivals",
    title: "Discover products you'll",
    highlight: "love",
    description: "Shop the latest trends in electronics, fashion and more. Free shipping on orders over $50.",
    cta: "Shop now",
    href: "#products",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200",
    imageAlt: "Wireless headphones",
  },
  {
    badge: "Limited Offer",
    title: "Upgrade your",
    highlight: "everyday",
    description: "Premium smartwatches and accessories at up to 30% off. Limited time only.",
    cta: "Discover more",
    href: "#products",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200",
    imageAlt: "Smart watch",
  },
  {
    badge: "Best Sellers",
    title: "Style that fits your",
    highlight: "life",
    description: "Curated clothing and accessories for every season. Quality you can feel.",
    cta: "Explore collection",
    href: "#products",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200",
    imageAlt: "Classic t-shirt",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const total = SLIDES.length;

  const go = useCallback((n: number) => setIndex((i) => (i + n + total) % total), [total]);
  const goTo = useCallback((n: number) => setIndex(n), []);

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
    touchStart.current = null;
  };

  const slide = SLIDES[index];

  return (
    <div
      className="relative h-full min-h-[420px] md:min-h-[520px] overflow-hidden rounded-2xl"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional hero"
    >
      <Image
        src={slide.image}
        alt={slide.imageAlt}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 75vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-6 md:px-10 max-w-xl text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs md:text-sm backdrop-blur">
            {slide.badge}
          </span>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">
            {slide.title} <span className="text-amber-300">{slide.highlight}</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/85 max-w-md">
            {slide.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href={slide.href}>
                {slide.cta} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {/* trust logos */}
          <div className="mt-6 flex items-center gap-4 text-xs text-white/70">
            <span>Trusted by 10k+ shoppers</span>
            <span className="h-1 w-1 rounded-full bg-white/50" />
            <span>Free shipping over $50</span>
          </div>
        </div>
      </div>

      {/* controls */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/40 flex items-center justify-center"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/40 flex items-center justify-center"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
