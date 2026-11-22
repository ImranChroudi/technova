import { createClientSupabase } from "@/lib/supabase/client";

const BUCKET = "product-images";

export async function uploadImage(file: File): Promise<string> {
  const supabase = createClientSupabase();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}
```<|end|><|start|>write to=assistant<|channel|>analysis<|message|>Created file successfully: /Users/macbookpro/Downloads/ecommerce-supabase-Nextjs-main/src/services/storage/storageService.ts