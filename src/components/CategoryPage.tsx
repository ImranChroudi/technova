"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronRight,
  Home,
  PackageSearch,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ErrorState } from "@/components/ErrorState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/context/AuthContext";
import { useProductsByCategory } from "@/hooks/queries";
import {
  applyCategoryFilters,
  activeFilterCount,
  CategoryFilterBar,
  CategoryFiltersPanel,
  defaultCategoryFilters,
  type CategoryFilterState,
} from "@/components/category/CategoryFilters";

interface CategoryPageProps {
  categoryName: string;
  categoryId: number;
  categoryDescription?: string | null;
  categoryImage?: string | null;
}

export default function CategoryPage({
  categoryName,
  categoryId,
  categoryDescription,
  categoryImage,
}: CategoryPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState<CategoryFilterState>(
    defaultCategoryFilters
  );

  const {
    data: products = [],
    isLoading: loading,
    error,
    refetch: fetchProducts,
  } = useProductsByCategory(categoryId);

  // Keep restricted categories behind authentication (existing behaviour).
  const restricted =
    !user && (categoryName === "Clothing" || categoryName === "Accessories");

  useEffect(() => {
    if (restricted) router.push("/signin");
  }, [restricted, router]);

  const visible = useMemo(
    () => applyCategoryFilters(products, filters),
    [products, filters]
  );

  const update = (patch: Partial<CategoryFilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const reset = () => setFilters(defaultCategoryFilters);

  if (restricted) return null;

  const activeCount = activeFilterCount(filters);
  const chips: { label: string; clear: () => void }[] = [];
  if (filters.query.trim())
    chips.push({
      label: `“${filters.query}”`,
      clear: () => update({ query: "" }),
    });
  if (filters.stock !== "all")
    chips.push({
      label: filters.stock === "in" ? "In stock" : "Sold out",
      clear: () => update({ stock: "all" }),
    });
  if (filters.minPrice !== "" || filters.maxPrice !== "")
    chips.push({
      label: `$${filters.minPrice || "0"} – ${filters.maxPrice || "∞"}`,
      clear: () => update({ minPrice: "", maxPrice: "" }),
    });
  if (filters.onlyNew)
    chips.push({
      label: "New arrivals",
      clear: () => update({ onlyNew: false }),
    });
  if (filters.sort !== "featured")
    chips.push({
      label:
        filters.sort === "price-asc"
          ? "Price ↑"
          : filters.sort === "price-desc"
            ? "Price ↓"
            : filters.sort === "newest"
              ? "Newest"
              : "A–Z",
      clear: () => update({ sort: "featured" }),
    });

  const panelProps = {
    state: filters,
    onChange: update,
    onReset: reset,
    products,
    resultCount: visible.length,
  };

  return (
    <ErrorBoundary>
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link href="/" className="inline-flex items-center gap-1 hover:text-primary">
              <Home className="h-3.5 w-3.5" /> Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span>Categories</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-foreground">{categoryName}</span>
          </nav>

          {/* Category hero */}
          <section className="panel animate-rise relative mb-6 overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src={
                  categoryImage ||
                  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400"
                }
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-25"
              />
              <div className="brand-gradient absolute inset-0 opacity-90" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,.22),transparent_50%)]" />
            </div>
            <div className="relative flex flex-col gap-4 px-5 py-8 text-white md:flex-row md:items-end md:justify-between md:px-8 md:py-10">
              <div className="max-w-xl">
                <span className="glass-panel inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  Curated collection
                </span>
                <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  {categoryName}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-white/80 md:text-base">
                  {categoryDescription ||
                    `Explore our selection of ${categoryName.toLowerCase()} — handpicked for quality, style and everyday value.`}
                </p>
              </div>
              <div className="glass-panel flex items-center gap-2 rounded-2xl px-4 py-3 text-sm">
                <PackageSearch className="h-5 w-5 text-amber-300" />
                <span>
                  <strong className="text-base">{products.length}</strong>{" "}
                  {products.length === 1 ? "product" : "products"}
                </span>
              </div>
            </div>
          </section>

          {/* Filters + results */}
          <div className="grid gap-6 lg:grid-cols-[248px_minmax(0,1fr)]">
            {/* Desktop sidebar */}
            <aside className="hidden lg:block">
              <div className="panel sticky top-20 p-5">
                <div className="mb-5 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold">Filters</h2>
                  {activeCount > 0 && (
                    <span className="brand-gradient ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                      {activeCount}
                    </span>
                  )}
                </div>
                <CategoryFiltersPanel {...panelProps} />
              </div>
            </aside>

            <div className="min-w-0">
              {/* Mobile toolbar */}
              <CategoryFilterBar
                count={visible.length}
                activeCount={activeCount}
                sort={filters.sort}
                onSortChange={(sort) => update({ sort })}
                onOpenFilters={() => setDrawerOpen(true)}
              />

              {/* Desktop summary + active chips */}
              <div className="mb-4 hidden flex-wrap items-center gap-2 lg:flex">
                <span className="text-sm text-muted-foreground">
                  Showing{" "}
                  <strong className="text-foreground">{visible.length}</strong>{" "}
                  of {products.length} products
                </span>
                {chips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={chip.clear}
                    className="chip chip-active cursor-pointer"
                  >
                    {chip.label} <X className="h-3 w-3" />
                  </button>
                ))}
                {activeCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="ml-auto h-8 text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Results */}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
                  >
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="panel overflow-hidden p-3">
                        <div className="shimmer aspect-square rounded-xl bg-muted" />
                        <div className="shimmer mt-3 h-4 w-3/4 rounded bg-muted" />
                        <div className="shimmer mt-2 h-3 w-1/2 rounded bg-muted" />
                      </div>
                    ))}
                  </motion.div>
                ) : error ? (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ErrorState
                      title={`Failed to load ${categoryName.toLowerCase()}`}
                      description="We couldn't load these products. Please try again."
                      onRetry={fetchProducts}
                      error={error}
                      type="network"
                    />
                  </motion.div>
                ) : visible.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ErrorState
                      title={products.length === 0 ? "Nothing here yet" : "No matches found"}
                      description={
                        products.length === 0
                          ? `No ${categoryName.toLowerCase()} products are available right now.`
                          : "Try adjusting or clearing your filters to see more products."
                      }
                      showRetry={products.length === 0}
                      onRetry={fetchProducts}
                      type="not-found"
                    />
                    {products.length > 0 && (
                      <div className="mt-4 text-center">
                        <Button onClick={reset} className="rounded-full">
                          Clear all filters
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="products"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4"
                  >
                    <AnimatePresence>
                      {visible.map((product, i) => (
                        <motion.div
                          key={product.product_id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {!loading && visible.length > 0 && (
                <p className="mt-8 text-center text-xs text-muted-foreground">
                  You’ve reached the end of this collection
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawerOpen(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 320 }}
                className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-3xl border-t bg-background shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-label="Filter products"
              >
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    <h2 className="font-semibold">Filters</h2>
                    {activeCount > 0 && (
                      <span className="brand-gradient flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                        {activeCount}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label="Close filters"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="thin-scrollbar max-h-[calc(88vh-140px)] overflow-y-auto px-5 py-5">
                  <CategoryFiltersPanel {...panelProps} />
                </div>
                <div className="border-t bg-background p-4">
                  <Button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="btn-glow relative h-11 w-full rounded-full"
                  >
                    Show {visible.length} {visible.length === 1 ? "product" : "products"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
