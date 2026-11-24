import { Suspense } from "react";
import ClientProducts from "@/components/ClientProducts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CategoryCarousel } from "@/components/home/CategoryCarousel";
import { BrandsCarousel } from "@/components/home/BrandsCarousel";
import { PersonalizedSections } from "@/components/PersonalizedSections";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { TrustBadges } from "@/components/TrustBadges";
import { Newsletter } from "@/components/Newsletter";
import { VisualSearch } from "@/components/VisualSearch";

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="bg-background min-h-screen">
        <HomeHeroSection />
        <TrustBadges />
        <CategoryCarousel />
        <div className="container mx-auto px-4">
          <PersonalizedSections />
          <section id="products" className="space-y-4 py-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Catalog</p>
                <h2 className="text-2xl md:text-3xl font-bold">All products</h2>
              </div>
            </div>
            <Suspense
              fallback={
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
                </div>
              }
            >
              <ClientProducts />
            </Suspense>
          </section>
        </div>
        <VisualSearch />
        <BrandsCarousel />
        <Newsletter />
      </div>
    </ErrorBoundary>
  );
}
