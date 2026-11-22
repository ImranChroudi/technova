"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAdmin, loading, error } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      //router.push("/dashboard");
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You don&apos;t have admin privileges to access this page.
            </p>
            <Link href="/dashboard">
              <Button>Go to User Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mobileItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/users", label: "Users" },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile nav */}
        <nav className="md:hidden flex gap-2 overflow-x-auto p-3 border-b bg-muted/30">
          {mobileItems.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium bg-background border"
            >
              {it.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
