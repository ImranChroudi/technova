import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { TanStackQueryProvider } from "@/lib/providers/query-provider";
import { ThemedToaster } from "@/components/ThemedToaster";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { SiteFooter } from "@/components/home/SiteFooter";
import { MainLayout } from "@/components/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DemoBanner } from "@/components/DemoBanner";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ChatWidget } from "@/components/chat/ChatWidget";
// inside body, after SiteFooter:

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "E-Commerce",
  description: "E-Commerce App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <title>My App</title>
        <meta name="description" content="My App is a..." />
      </head>
      <body className="bg-background min-h-screen">
        <ErrorBoundary>
          <TanStackQueryProvider>
            <AuthProvider>
              <CartProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <div className="min-h-screen flex flex-col">
                    <DemoBanner />
                    <Navbar />
                    <MainLayout>
                      <AnalyticsProvider>{children}</AnalyticsProvider>
                    </MainLayout>
                    <SiteFooter />
                    <ChatWidget />
                    <ThemedToaster />
                  </div>
                </ThemeProvider>
              </CartProvider>
            </AuthProvider>
          </TanStackQueryProvider>
        </ErrorBoundary>

        
      </body>
    </html>
  );
}
