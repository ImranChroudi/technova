"use client";

import { HeroCarousel } from "./HeroCarousel";
import { FeaturedProducts } from "./FeaturedProducts";

export function HomeHeroSection() {
  return (
    <section className="container mx-auto px-4 py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-8">
          <HeroCarousel />
        </div>
        <div className="lg:col-span-4">
          <FeaturedProducts />
        </div>
      </div>
    </section>
  );
}
