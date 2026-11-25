"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  Moon,
  Sun,
  User,
  LogIn,
  Search,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/hooks/queries/use-categories";

export function Navbar() {
  const { totalItems } = useCart();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { data: categories = [] } = useCategories();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSearch(false);
  }, [pathname]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/products?search=${encodeURIComponent(q.trim())}`);
  };

  const navLinks = categories.slice(0, 4);

  if (!mounted) {
    return <nav className="border-border bg-background/95 h-16 w-full border-b" />;
  }

  return (
    <nav className="border-border/70 bg-background/85 supports-[backdrop-filter]:bg-background/70 sticky top-0 z-40 w-full border-b backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        {/* Brand */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="brand-gradient btn-glow relative flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md">
            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
          </span>
          <span className="brand-gradient-text text-lg font-bold tracking-tight sm:text-xl">
            ShopClone
          </span>
        </Link>

        {/* Desktop categories */}
        <div className="ml-4 hidden items-center gap-1 lg:flex">
          {navLinks.map((c) => {
            const active = pathname === `/categories/${c.id}`;
            return (
              <Link
                key={c.id}
                href={`/categories/${c.id}`}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {c.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop search */}
        <form
          onSubmit={submitSearch}
          className="mx-auto hidden w-full max-w-sm md:block"
        >
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, brands and more…"
              aria-label="Search products"
              className="bg-muted/50 h-10 rounded-full border-transparent pl-10 pr-4 text-sm transition-all focus:bg-background focus:shadow-md"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-0.5 md:ml-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={() => setMobileSearch((v) => !v)}
            aria-label="Search"
          >
            {mobileSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 sm:inline-flex"
            onClick={() => router.push(user ? "/profile" : "/signin")}
            aria-label={user ? "Profile" : "Sign in"}
          >
            {user ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          </Button>

          <Link href="/cart" aria-label="Cart">
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="brand-gradient absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile search bar */}
      {mobileSearch && (
        <form onSubmit={submitSearch} className="border-t px-4 py-3 md:hidden">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="bg-muted/50 h-10 rounded-full pl-10"
            />
          </div>
        </form>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-rise border-t px-4 py-4 lg:hidden">
          <p className="eyebrow mb-3">Shop by category</p>
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.id}`}
                className="panel flex items-center justify-between px-4 py-3 text-sm font-medium"
              >
                {c.name}
                <span className="text-muted-foreground">→</span>
              </Link>
            ))}
          </div>
          <Button
            variant="outline"
            className="mt-3 w-full"
            onClick={() => router.push(user ? "/profile" : "/signin")}
          >
            {user ? "My account" : "Sign in"}
          </Button>
        </div>
      )}
    </nav>
  );
}
