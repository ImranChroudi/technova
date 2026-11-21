"use client";

import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/queries/use-products";
import { PremiumProductCard } from "./PremiumProductCard";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "selection" | "sale";

export function ProductCollectionSection() {
  const [tab, setTab] = useState<Tab>("selection");
  const { data: products = [], isLoading } = useProducts();

  const saleSet = useMemo(() => {
    // deterministic "on sale" subset (~40%)
    const set = new Set<string>();
    for (const p of products) {
      let h = 0;
      for (let i = 0; i < p.product_id.length; i++) h = (h * 31 + p.product_id.charCodeAt(i)) >>> 0;
      if (h % 5 < 2) set.add(p.product_id);
    }
    return set;
  }, [products]);

  const shown = useMemo(() => {
    if (tab === "sale") return products.filter((p) => saleSet.has(p.product_id));
    return products.filter((p) => !saleSet.has(p.product_id));
  }, [products, tab, saleSet]);

  // fallback: if a tab is empty, show all
  const list = shown.length > 0 ? shown : products;

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-center gap-8 mb-6 border-b">
        <button
          type="button"
          onClick={() => setTab("selection")}
          className={`relative pb-3 text-sm md:text-base font-semibold transition-colors ${
            tab === "selection" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Our Selection
          {tab === "selection" && (
            <motion.span
              layoutId="pc-tab-underline"
              className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary"
            />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("sale")}
          className={`relative pb-3 text-sm md:text-base font-semibold transition-colors ${
            tab === "sale" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          On Sale
          {tab === "sale" && (
            <motion.span
              layoutId="pc-tab-underline"
              className="absolute left-0 right-0 bottom-0 h-0.5 bg-primary"
            />
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No products found.</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
          >
            {list.map((p) => (
              <PremiumProductCard key={p.product_id} product={p} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
