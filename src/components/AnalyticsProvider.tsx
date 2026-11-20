"use client";

import { useEffect } from "react";
import { initAnalytics, track } from "@/lib/analytics";
import { usePathname } from "next/navigation";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    track({ type: "page_view", name: pathname ?? undefined });
  }, [pathname]);

  return <>{children}</>;
}
