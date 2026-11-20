"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
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
    <section className="brand-gradient text-white">
      <div className="container mx-auto px-4 py-12 text-center">
        <Mail className="mx-auto h-8 w-8 mb-3" />
        <h2 className="text-2xl md:text-3xl font-bold">Stay in the loop</h2>
        <p className="mt-2 text-white/80 max-w-md mx-auto">
          Get exclusive deals, new arrivals and style tips straight to your inbox.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
            required
          />
          <Button type="submit" disabled={loading} className="bg-white text-primary hover:bg-white/90">
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  );
}
