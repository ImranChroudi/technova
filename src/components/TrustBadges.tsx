import { Truck, ShieldCheck, RotateCcw, CreditCard } from "lucide-react";

const items = [
  { icon: Truck, title: "Free shipping", desc: "On orders over $50" },
  { icon: RotateCcw, title: "Easy returns", desc: "30-day return policy" },
  { icon: ShieldCheck, title: "Secure checkout", desc: "SSL encrypted payments" },
  { icon: CreditCard, title: "Flexible payment", desc: "All major cards accepted" },
];

export function TrustBadges() {
  return (
    <section className="border-y border-border/60 bg-muted/25">
      <div className="container mx-auto grid grid-cols-2 gap-x-5 gap-y-6 px-4 py-7 md:grid-cols-4 md:py-8">
        {items.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="truncate text-xs text-muted-foreground">{desc}</p>
            </div>
            {i < items.length - 1 && (
              <span className="ml-4 hidden h-8 w-px bg-border lg:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
