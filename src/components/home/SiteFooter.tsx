"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, ChevronDown, Globe, Share2, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const infoLinks = ["About Us", "General Terms and Conditions", "Legal Notice", "Privacy Policy", "Cookie Policy", "Manage Cookies"];
const commitmentLinks = ["Opening Hours", "Best Price Guarantee", "After-Sales Service", "Returns and Refunds"];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [openCommit, setOpenCommit] = useState(false);

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
    <footer className="border-t bg-white dark:bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Main 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand + contact */}
          <div>
            <h3 className="text-xl font-bold mb-2">ShopClone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your one-stop shop for everything you love.
            </p>
            <div className="space-y-2">
              <a href="tel:+212600000000" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                <span className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </span>
                +212 600 000 000
              </a>
              <a href="tel:+212500000000" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                <span className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Phone className="h-4 w-4" />
                </span>
                +212 500 000 000
              </a>
              <a href="mailto:contact@shopclone.com" className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
                <span className="h-8 w-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Mail className="h-4 w-4" />
                </span>
                contact@shopclone.com
              </a>
            </div>
          </div>

          {/* Information */}
          <div>
            <button
              type="button"
              className="lg:hidden flex items-center justify-between w-full font-semibold text-sm uppercase tracking-wider mb-2"
              onClick={() => setOpenInfo((v) => !v)}
            >
              Informations <ChevronDown className={`h-4 w-4 transition-transform ${openInfo ? "rotate-180" : ""}`} />
            </button>
            <h4 className="hidden lg:block font-semibold text-sm uppercase tracking-wider mb-3">
              INFORMATIONS
              <span className="block h-0.5 w-8 bg-orange-500 mt-1" />
            </h4>
            <ul className={`space-y-2 ${openInfo ? "block" : "hidden lg:block"}`}>
              {infoLinks.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Commitments */}
          <div>
            <button
              type="button"
              className="lg:hidden flex items-center justify-between w-full font-semibold text-sm uppercase tracking-wider mb-2"
              onClick={() => setOpenCommit((v) => !v)}
            >
              Nos engagements <ChevronDown className={`h-4 w-4 transition-transform ${openCommit ? "rotate-180" : ""}`} />
            </button>
            <h4 className="hidden lg:block font-semibold text-sm uppercase tracking-wider mb-3">
              NOS ENGAGEMENTS
              <span className="block h-0.5 w-8 bg-orange-500 mt-1" />
            </h4>
            <ul className={`space-y-2 ${openCommit ? "block" : "hidden lg:block"}`}>
              {commitmentLinks.map((l) => (
                <li key={l}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Apps + Newsletter */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">
              DISPONIBLE SUR :
              <span className="block h-0.5 w-8 bg-orange-500 mt-1" />
            </h4>
            <div className="flex gap-2 mb-5">
              <a href="#" className="block">
                <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" className="h-10" />
              </a>
              <a href="#" className="block">
                <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Google Play" className="h-10" />
              </a>
            </div>

            <h4 className="font-semibold text-sm uppercase tracking-wider mb-2">
              REJOIGNEZ NOTRE NEWSLETTER :
              <span className="block h-0.5 w-8 bg-orange-500 mt-1" />
            </h4>
            <p className="text-xs text-muted-foreground mb-3">We respect your privacy.</p>
            <form onSubmit={submit} className="flex rounded-full border overflow-hidden">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-0 rounded-none focus-visible:ring-0"
                aria-label="Email"
              />
              <Button type="submit" disabled={loading} className="rounded-none bg-orange-500 hover:bg-orange-600 text-white px-5">
                {loading ? "..." : "S'INSCRIRE"}
              </Button>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-10 pt-8 border-t grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">
              SYSTÈME DE PAIEMENT :
              <span className="block h-0.5 w-8 bg-orange-500 mt-1" />
            </h4>
            <div className="flex flex-wrap gap-2">
              {["Visa", "Mastercard", "CMI"].map((p) => (
                <span key={p} className="rounded-md border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">{p}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">
              SYSTÈME D'EXPÉDITION :
              <span className="block h-0.5 w-8 bg-orange-500 mt-1" />
            </h4>
            <div className="flex flex-wrap gap-2">
              {["Amana", "Chronopost", "DHL"].map((p) => (
                <span key={p} className="rounded-md border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">{p}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-3">
              SUIVEZ-NOUS SUR :
              <span className="block h-0.5 w-8 bg-orange-500 mt-1" />
            </h4>
            <div className="flex gap-2">
              {[Globe, Mail, Share2, Rss].map((Icon, i) => (
                <a key={i} href="#" aria-label="social" className="h-9 w-9 rounded-lg border bg-white flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ShopClone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
