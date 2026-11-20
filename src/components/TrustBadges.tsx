import { Truck, ShieldCheck, RotateCcw, CreditCard } from "lucide-react";

const items = [
  { icon: Truck, title: "Free shipping", desc: "On orders over $50" },
  { icon: RotateCcw, title: "Easy returns", desc: "30-day return policy" },
  { icon: ShieldCheck, title: "Secure checkout", desc: "SSL encrypted payments" },
  { icon: CreditCard, title: "Flexible payment", desc: "All major cards accepted" },
];

export function TrustBadges() {
  return (
    <section className="border-y bg-muted/30">
      <div className="container mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
