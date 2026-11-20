"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden brand-gradient text-white">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl" />
      </div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-2xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur">
            <Sparkles className="h-4 w-4" /> New season arrivals
          </span>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Discover products you'll <span className="text-amber-300">love</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-xl">
            Shop the latest trends in electronics, fashion and more. Free shipping
            on orders over $50.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="#products">
                Shop now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
              <Link href="/products">Browse all</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
