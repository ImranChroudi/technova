import { Suspense } from "react";
import ClientProducts from "@/components/ClientProducts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CategoryMarquee } from "@/components/CategoryMarquee";
import { PersonalizedSections } from "@/components/PersonalizedSections";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { TrustBadges } from "@/components/TrustBadges";
import { Newsletter } from "@/components/Newsletter";

export default function Home() {
  return (
    <ErrorBoundary>
      <div className="bg-background min-h-screen">
        <HomeHeroSection />
        <TrustBadges />
        <CategoryMarquee />
        <div className="container mx-auto px-4">
          <PersonalizedSections />
          <div id="products" className="space-y-4 py-4">
            <Suspense
              fallback={
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-t-2 border-b-2"></div>
                </div>
              }
            >
              <ClientProducts />
            </Suspense>
          </div>
        </div>
        <Newsletter />
      </div>
    </ErrorBoundary>
  );
}
