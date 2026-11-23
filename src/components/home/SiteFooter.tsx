"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, Globe, Share2, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const columns = [
  {
    title: "Shop",
    links: ["All products", "New arrivals", "Best sellers", "On sale"],
  },
  {
    title: "Support",
    links: ["Contact us", "FAQ", "Shipping", "Returns & refunds"],
  },
  {
    title: "Company",
    links: ["About us", "Careers", "Press", "Blog"],
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
    <footer className="border-t bg-muted/30 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="brand-gradient inline-block h-8 w-8 rounded-lg" />
              <span className="text-xl font-bold tracking-tight">ShopClone</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Your one-stop shop for everything you love. Quality products, fast shipping, and friendly support.
            </p>
            <div className="space-y-2 text-sm">
              <a href="mailto:contact@shopclone.com" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" /> contact@shopclone.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="h-4 w-4" /> +1 (234) 567-890
              </a>
            </div>
            <div className="flex gap-2 mt-4">
              {[Globe, Share2, Rss].map((Icon, i) => (
                <a key={i} href="#" aria-label="social" className="h-9 w-9 rounded-lg border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-10 pt-8 border-t">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm">Join our newsletter</h4>
              <p className="text-xs text-muted-foreground">Get updates on new arrivals and exclusive offers.</p>
            </div>
            <form onSubmit={submit} className="flex w-full md:w-auto rounded-lg border overflow-hidden bg-background">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-0 rounded-none focus-visible:ring-0 min-w-[240px]"
                aria-label="Email"
              />
              <Button type="submit" disabled={loading} className="rounded-none px-5">
                {loading ? "..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-6 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ShopClone. All rights reserved.</p>
          <div className="flex flex-wrap gap-2">
            {["Visa", "Mastercard", "PayPal"].map((p) => (
              <span key={p} className="rounded-md border bg-background px-2.5 py-1 text-xs font-medium">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}