"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        classNames: {
          error: "bg-red-500 text-white border-red-600",
          success: "bg-green-500 text-white border-green-600",
          warning: "bg-yellow-500 text-black border-yellow-600",
          info: "bg-blue-500 text-white border-blue-600",
        },
      }}
    />
  );
}
