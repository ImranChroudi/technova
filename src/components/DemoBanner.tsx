import { Sparkles } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="brand-gradient relative overflow-hidden px-4 py-2 text-center text-xs text-white md:text-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,.18),transparent_45%)]" />
      <div className="relative mx-auto flex max-w-4xl items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold">Demo storefront</span>
        <span className="hidden text-white/80 sm:inline">
          · Built with Next.js, Supabase & AI-powered search
        </span>
      </div>
    </div>
  );
}
