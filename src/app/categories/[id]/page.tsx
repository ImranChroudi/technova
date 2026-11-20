import { notFound } from "next/navigation";
import { Suspense } from "react";
import CategoryPage from "@/components/CategoryPage";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DynamicCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isFinite(categoryId) || categoryId <= 0) notFound();

  const supabase = await createServerSupabase();
  const { data: category, error } = await supabase
    .from("categories")
    .select("id, name")
    .eq("id", categoryId)
    .single();

  if (error || !category) notFound();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CategoryPage categoryName={category.name} categoryId={category.id} />
    </Suspense>
  );
}
