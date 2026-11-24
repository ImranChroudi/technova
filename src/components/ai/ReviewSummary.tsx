"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

type Summary = {
  overall: string;
  pros: string[];
  cons: string[];
  verdict: string;
};

export function ReviewSummary({ productId }: { productId: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [hasReviews, setHasReviews] = useState<boolean | null>(null);

  const load = async (force = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/summarize-reviews${force ? "?force=1" : ""}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      setCount(data.count ?? 0);
      if (data.summary) {
        try {
          setSummary(JSON.parse(data.summary));
        } catch {
          setSummary({ overall: data.summary, pros: [], cons: [], verdict: "" });
        }
      } else {
        setSummary(null);
      }
      setHasReviews((data.count ?? 0) > 0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [productId]);

  if (hasReviews === false) return null;
  if (!summary && !loading) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Review Summary
        </CardTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => load(true)}
          disabled={loading}
          className="h-7 text-xs"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Regenerate"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Summarizing reviews…
          </div>
        ) : (
          <>
            {summary?.overall && <p className="text-sm">{summary.overall}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {summary?.pros && summary.pros.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-600 mb-1 flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" /> Pros
                  </p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {summary.pros.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {summary?.cons && summary.cons.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-600 mb-1 flex items-center gap-1">
                    <ThumbsDown className="h-3 w-3" /> Cons
                  </p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {summary.cons.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {summary?.verdict && (
              <p className="text-xs italic text-muted-foreground border-t pt-2">{summary.verdict}</p>
            )}
            <p className="text-[10px] text-muted-foreground">Based on {count} review{count !== 1 ? "s" : ""}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
