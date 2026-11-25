"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      toast.success("Thanks for subscribing!");
      setEmail("");
      setLoading(false);
    }, 600);
  };

  return (
    <section className="brand-gradient relative overflow-hidden text-white">
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 -bottom-28 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="container relative mx-auto px-4 py-12 text-center md:py-14">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Mail className="h-6 w-6" />
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
          Stay in the loop
        </p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">
          Deals worth opening your inbox for
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/75">
          Get exclusive offers, new arrivals and style tips. No spam, unsubscribe anytime.
        </p>
        <form
          onSubmit={submit}
          className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 h-11 border-white/25 text-white placeholder:text-white/60 focus-visible:ring-white/50"
            required
          />
          <Button
            type="submit"
            disabled={loading}
            className="btn-glow relative h-11 rounded-xl bg-white px-6 font-semibold text-primary hover:bg-white/90"
          >
            {loading ? "Subscribing…" : "Subscribe"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      </div>
    </section>
  );
}
