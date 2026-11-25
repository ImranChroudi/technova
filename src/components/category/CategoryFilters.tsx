"use client";

import { useMemo } from "react";
import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProductType } from "@/types";

export type SortKey =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "name-asc";

export type CategoryFilterState = {
  query: string;
  sort: SortKey;
  stock: "all" | "in" | "out";
  minPrice: string;
  maxPrice: string;
  onlyNew: boolean;
};

export const defaultCategoryFilters: CategoryFilterState = {
  query: "",
  sort: "featured",
  stock: "all",
  minPrice: "",
  maxPrice: "",
  onlyNew: false,
};

const sortLabels: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  newest: "Newest first",
  "name-asc": "Name: A to Z",
};

export function isNewProduct(product: ProductType) {
  if (!product.created_at) return false;
  const days = (Date.now() - new Date(product.created_at).getTime()) / 86_400_000;
  return days >= 0 && days <= 14;
}

export function applyCategoryFilters(
  products: ProductType[],
  state: CategoryFilterState
) {
  const q = state.query.trim().toLowerCase();
  const min = state.minPrice === "" ? null : Number(state.minPrice);
  const max = state.maxPrice === "" ? null : Number(state.maxPrice);

  const filtered = products.filter((p) => {
    if (
      q &&
      !p.title.toLowerCase().includes(q) &&
      !(p.description || "").toLowerCase().includes(q)
    ) {
      return false;
    }
    if (state.stock === "in" && p.stock <= 0) return false;
    if (state.stock === "out" && p.stock > 0) return false;
    if (state.onlyNew && !isNewProduct(p)) return false;

    const price = Number(p.price);
    if (min !== null && Number.isFinite(min) && price < min) return false;
    if (max !== null && Number.isFinite(max) && price > max) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (state.sort) {
    case "price-asc":
      return sorted.sort((a, b) => Number(a.price) - Number(b.price));
    case "price-desc":
      return sorted.sort((a, b) => Number(b.price) - Number(a.price));
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
    case "name-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sorted;
  }
}

export function activeFilterCount(state: CategoryFilterState) {
  let n = 0;
  if (state.query.trim()) n++;
  if (state.stock !== "all") n++;
  if (state.minPrice !== "" || state.maxPrice !== "") n++;
  if (state.onlyNew) n++;
  if (state.sort !== "featured") n++;
  return n;
}

type PanelProps = {
  state: CategoryFilterState;
  onChange: (patch: Partial<CategoryFilterState>) => void;
  onReset: () => void;
  products: ProductType[];
  resultCount: number;
  className?: string;
};

/** The actual filter controls — reused on desktop and in the mobile drawer. */
export function CategoryFiltersPanel({
  state,
  onChange,
  onReset,
  products,
  resultCount,
  className,
}: PanelProps) {
  const { min, max, presets } = useMemo(() => {
    const prices = products.map((p) => Number(p.price)).filter(Number.isFinite);
    if (prices.length === 0) {
      return { min: 0, max: 1000, presets: [] as { label: string; min?: number; max?: number }[] };
    }
    const lo = Math.floor(Math.min(...prices));
    const hi = Math.ceil(Math.max(...prices));
    const q1 = Math.round(lo + (hi - lo) * 0.33);
    const q2 = Math.round(lo + (hi - lo) * 0.66);
    return {
      min: lo,
      max: hi,
      presets: [
        { label: `Under $${q1}`, max: q1 },
        { label: `$${q1}–$${q2}`, min: q1, max: q2 },
        { label: `Over $${q2}`, min: q2 },
      ],
    };
  }, [products]);

  const activePreset = (preset: { min?: number; max?: number }) => {
    const currentMin = state.minPrice === "" ? null : Number(state.minPrice);
    const currentMax = state.maxPrice === "" ? null : Number(state.maxPrice);
    return currentMin === (preset.min ?? null) && currentMax === (preset.max ?? null);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Search
        </label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={state.query}
            onChange={(e) => onChange({ query: e.target.value })}
            placeholder="Search in this category…"
            className="bg-muted/40 h-10 rounded-xl border-transparent pl-9 text-sm focus:bg-background"
          />
          {state.query && (
            <button
              type="button"
              onClick={() => onChange({ query: "" })}
              aria-label="Clear search"
              className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sort by
        </label>
        <div className="relative">
          <select
            value={state.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey })}
            aria-label="Sort products"
            className="bg-muted/40 h-10 w-full appearance-none rounded-xl border border-transparent px-3 pr-9 text-sm font-medium focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            {(Object.keys(sortLabels) as SortKey[]).map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </select>
          <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Availability
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { value: "all", label: "All" },
              { value: "in", label: "In stock" },
              { value: "out", label: "Sold out" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ stock: option.value })}
              className={cn(
                "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                state.stock === option.value
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border/70 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Price range
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={state.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            placeholder={`$${min}`}
            aria-label="Minimum price"
            className="bg-muted/40 h-10 rounded-xl border-transparent text-sm focus:bg-background"
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="number"
            min={0}
            value={state.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            placeholder={`$${max}`}
            aria-label="Maximum price"
            className="bg-muted/40 h-10 rounded-xl border-transparent text-sm focus:bg-background"
          />
        </div>
        {presets.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onChange({
                    minPrice: preset.min === undefined ? "" : String(preset.min),
                    maxPrice: preset.max === undefined ? "" : String(preset.max),
                  })
                }
                className={cn("chip cursor-pointer", activePreset(preset) && "chip-active")}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New arrivals */}
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/70 bg-background px-3 py-2.5">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-primary" />
          New arrivals only
        </span>
        <input
          type="checkbox"
          checked={state.onlyNew}
          onChange={(e) => onChange({ onlyNew: e.target.checked })}
          className="h-4 w-4 accent-[var(--primary)]"
        />
      </label>

      <div className="soft-divider" />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          <strong className="text-foreground">{resultCount}</strong> results
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-8 gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>
    </div>
  );
}

type BarProps = {
  count: number;
  activeCount: number;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  onOpenFilters: () => void;
};

/** Mobile toolbar with sort + filter drawer trigger. */
export function CategoryFilterBar({
  count,
  activeCount,
  sort,
  onSortChange,
  onOpenFilters,
}: BarProps) {
  return (
    <div className="panel mb-4 flex items-center gap-2 p-2 lg:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenFilters}
        className="h-9 gap-2 rounded-xl"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="brand-gradient flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </Button>
      <div className="relative ml-auto">
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
          aria-label="Sort products"
          className="h-9 appearance-none rounded-xl border border-border/70 bg-background pr-7 pl-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {(Object.keys(sortLabels) as SortKey[]).map((key) => (
            <option key={key} value={key}>
              {sortLabels[key]}
            </option>
          ))}
        </select>
        <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 h-3.5 w-3.5 -translate-y-1/2" />
      </div>
      <span className="text-muted-foreground hidden whitespace-nowrap px-1 text-xs sm:inline">
        {count} items
      </span>
    </div>
  );
}
