"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ProductType } from "@/types";

export function VisualSearch() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(ProductType & { similarity?: number })[]>([]);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Image too large (max 5MB)");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
    setResults([]);
  };

  const search = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/search-by-image", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const prods = data.products ?? [];
      setResults(prods);
      if (prods.length === 0) setError("No similar products found. Make sure embeddings are generated (Admin → Generate embeddings).");
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResults([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">Visual Search</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Upload a photo to find visually similar products
        </p>
      </div>

      <Card className="max-w-xl mx-auto">
        <CardContent className="p-6 space-y-4">
          <div
            className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files?.[0] ?? null);
            }}
          >
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="preview" className="max-h-48 rounded-lg mx-auto" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-10 w-10" />
                <p className="text-sm">Click or drag & drop an image</p>
                <p className="text-xs">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button onClick={search} disabled={!file || loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {loading ? "Searching…" : "Find similar products"}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Similar products</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.map((p) => (
              <Link key={p.product_id} href={`/products/${p.product_id}`} className="group rounded-xl border bg-card p-2 hover:shadow-md transition-shadow">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={p.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300"}
                    alt={p.title}
                    fill
                    sizes="150px"
                    className="object-contain p-2 group-hover:scale-105 transition-transform"
                  />
                </div>
                <p className="text-xs font-medium mt-2 line-clamp-2">{p.title}</p>
                <p className="text-sm font-bold text-primary mt-1">{p.price} DH</p>
                {typeof p.similarity === "number" && (
                  <p className="text-[10px] text-muted-foreground">{Math.round(p.similarity * 100)}% match</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
