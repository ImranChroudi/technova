"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useCategories } from "@/hooks/queries/use-categories";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/#products" },
      { label: "New arrivals", href: "/#products" },
      { label: "Best sellers", href: "/#products" },
      { label: "Categories", href: "/#categories" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "My orders", href: "/dashboard" },
      { label: "My account", href: "/profile" },
      { label: "Cart", href: "/cart" },
      { label: "Contact us", href: "mailto:contact@shopclone.com" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/#products" },
      { label: "Our story", href: "/#products" },
      { label: "Careers", href: "/#products" },
      { label: "Blog", href: "/#products" },
    ],
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: categories = [] } = useCategories();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Subscribed successfully");
      setEmail("");
      setLoading(false);
    }, 700);
  };

  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="brand-gradient-text text-lg font-bold tracking-tight">
                ShopClone
              </span>
            </div>
            <p className="mb-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Your one-stop shop for everything you love. Quality products, fast
              shipping, and friendly support.
            </p>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:contact@shopclone.com"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" /> contact@shopclone.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4" /> +1 (234) 567-890
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href.startsWith("/") ? (
                      <Link
                        href={l.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="soft-divider mt-10 pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-sm font-semibold">Join our newsletter</h4>
              <p className="text-xs text-muted-foreground">
                Get updates on new arrivals and exclusive offers.
              </p>
            </div>
            <form
              onSubmit={submit}
              className="flex w-full max-w-md overflow-hidden rounded-xl border bg-background"
            >
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 rounded-none border-0 focus-visible:ring-0"
                aria-label="Email"
              />
              <Button type="submit" disabled={loading} className="rounded-none px-5">
                {loading ? "…" : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="soft-divider mt-8 flex flex-col gap-3 pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} ShopClone. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.id}`}
                className="inline-flex items-center gap-1 rounded-md border bg-background px-2.5 py-1 font-medium transition-colors hover:text-primary"
              >
                {c.name} <ArrowUpRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
