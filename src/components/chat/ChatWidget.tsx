"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User as UserIcon, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import type { ProductType } from "@/types";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductType[];
  categories?: { id: number; name: string }[];
};

const SUGGESTIONS = [
  "Show me laptops",
  "Headphones under 100 DH",
  "Best shoes for running",
  "I need a phone with good camera",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your shopping assistant. Ask me anything about our products — by text or voice.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  // Voice input (Web Speech API)
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechSupported =
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const startListening = useCallback(() => {
    if (!speechSupported) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const transcript = e.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) setInput((prev) => (prev ? prev + " " : "") + transcript);
    };
    rec.onerror = () => {
      setListening(false);
      toast.error("Voice recognition error");
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }, [speechSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply, products: data.products, categories: data.categories },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (name: string) => {
    send(`Show me ${name}`);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] max-w-md h-[70vh] max-h-[600px] flex flex-col rounded-2xl border bg-background shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">Shopping Assistant</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="hover:opacity-80">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={`max-w-[80%] space-y-2 ${m.role === "user" ? "items-end" : ""}`}>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>

                  {/* Category suggestions when no products found */}
                  {m.categories && m.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {m.categories.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleCategoryClick(c.name)}
                          className="text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {m.products && m.products.length > 0 && (
                    <div className="space-y-2">
                      {m.products.map((p) => (
                        <div key={p.product_id} className="rounded-xl border bg-card p-2 flex gap-2">
                          <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={p.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"}
                              alt={p.title}
                              fill
                              sizes="64px"
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium line-clamp-2">{p.title}</p>
                            <p className="text-sm font-bold text-primary mt-1">{p.price} DH</p>
                            <p className="text-[10px] text-muted-foreground">
                              {p.stock > 0 ? `In stock (${p.stock})` : "Out of stock"}
                            </p>
                            <div className="flex gap-1 mt-1">
                              <Link
                                href={`/products/${p.product_id}`}
                                className="text-[10px] px-2 py-0.5 rounded border hover:bg-muted"
                              >
                                View
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  addToCart(p);
                                  toast.success("Added to cart");
                                }}
                                className="text-[10px] px-2 py-0.5 rounded bg-primary text-primary-foreground hover:opacity-90"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-2xl px-3 py-2 text-sm bg-muted flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}

            {messages.length <= 1 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-3 border-t flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products..."
              className="flex-1"
              disabled={loading}
            />
            {speechSupported && (
              <Button
                type="button"
                size="icon"
                variant={listening ? "destructive" : "outline"}
                onClick={listening ? stopListening : startListening}
                aria-label={listening ? "Stop listening" : "Voice input"}
                title="Voice input"
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}