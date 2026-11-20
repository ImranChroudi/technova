"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProductCard } from "@/components/ProductCard";
import { ProductType } from "@/types";

type Product = ProductType & { product_id: string };

export function PersonalizedSections() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [recent, setRecent] = useState<Product[]>([]);
  const [recommended, setRecommended] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    const visitorId =
      typeof window !== "undefined" ? localStorage.getItem("visitor_id") : null;

    const load = () => {
      const params = new URLSearchParams();
      if (visitorId) params.set("visitor_id", visitorId);
      if (user?.id) params.set("user_id", user.id);
      fetch(`/api/personalization?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          setRecent(d.recentlyViewed ?? []);
          setRecommended(d.recommended ?? []);
        })
        .catch(() => {});
    };

    // small delay to let tracked events flush to the DB first
    const t = setTimeout(load, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user?.id, pathname]);

  if (recent.length === 0 && recommended.length === 0) return null;

  return (
    <div className="space-y-8 py-6">
      {recent.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recent.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </section>
      )}
      {recommended.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Picked for you</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recommended.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
