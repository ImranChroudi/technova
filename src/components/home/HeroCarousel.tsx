"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
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
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400",
    imageAlt: "Wireless headphones",
  },
  {
    badge: "Limited Offer",
    title: "Upgrade your",
    highlight: "everyday",
    description: "Premium smartwatches and accessories at up to 30% off. Limited time only.",
    cta: "Discover more",
    href: "#products",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1400",
    imageAlt: "Smart watch",
  },
  {
    badge: "Best Sellers",
    title: "Style that fits your",
    highlight: "life",
    description: "Curated clothing and accessories for every season. Quality you can feel.",
    cta: "Explore collection",
    href: "#products",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1400",
    imageAlt: "Classic t-shirt",
  },
];

const AUTOPLAY_MS = 6000;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const total = SLIDES.length;

  const go = useCallback(
    (n: number) => setIndex((i) => (i + n + total) % total),
    [total]
  );
  const goTo = useCallback((n: number) => setIndex(n), []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, total]);

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
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) go(diff > 0 ? 1 : -1);
    touchStart.current = null;
  };

  return (
    <div
      className="group relative h-full min-h-[440px] overflow-hidden rounded-3xl border border-white/10 bg-muted md:min-h-[540px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional hero"
    >
      {SLIDES.map((slide, i) => (
        <div
          key={slide.image}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.imageAlt}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 70vw"
            className={`object-cover transition-transform duration-[7000ms] ease-linear ${
              i === index && !paused ? "scale-110" : "scale-100"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto max-w-xl px-6 text-white md:px-10">
          {SLIDES.map((slide, i) => (
            <div
              key={slide.badge}
              className={`${
                i === index
                  ? "animate-rise relative"
                  : "pointer-events-none absolute inset-0 opacity-0"
              }`}
            >
              <span className="glass-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                {slide.badge}
              </span>
              <h1 className="mt-5 text-3xl leading-[1.1] font-bold tracking-tight md:text-5xl">
                {slide.title}{" "}
                <span className="text-amber-300">{slide.highlight}</span>
              </h1>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 md:text-base">
                {slide.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  render={<Link href={slide.href} />}
                  nativeButton={false}
                  size="lg"
                  className="btn-glow rounded-full bg-white px-6 font-semibold text-primary hover:bg-white/90"
                >
                  {slide.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  render={<Link href="#products" />}
                  nativeButton={false}
                  size="lg"
                  variant="outline"
                  className="glass-panel rounded-full border-white/30 px-6 text-white hover:bg-white/15 hover:text-white"
                >
                  Browse all
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3 text-[11px] text-white/70 md:text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Trusted by 10k+ shoppers
                </span>
                <span className="h-3 w-px bg-white/30" />
                <span>Free shipping over $50</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous slide"
        className="glass-panel absolute top-1/2 left-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 transition-opacity hover:bg-white/25 group-hover:opacity-100 focus:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next slide"
        className="glass-panel absolute top-1/2 right-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-white opacity-0 transition-opacity hover:bg-white/25 group-hover:opacity-100 focus:opacity-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.badge}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-white" : "w-2 bg-white/45 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
