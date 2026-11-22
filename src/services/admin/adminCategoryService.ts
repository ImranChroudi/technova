import { supabase } from "@/lib/supabase/client";
import { CategoryType } from "@/types";

export interface CreateCategoryData {
  name: string;
  description: string;
  parent_id?: number | null;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

export const adminCategoryService = {
  async getAllCategories(): Promise<CategoryType[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    return (data as CategoryType[]) ?? [];
  },

  async createCategory(data: CreateCategoryData): Promise<CategoryType> {
    const { data: created, error } = await supabase
      .from("categories")
      .insert({
        name: data.name,
        description: data.description,
        parent_id: data.parent_id ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return created as CategoryType;
  },

  async updateCategory(id: number, data: UpdateCategoryData): Promise<CategoryType> {
    const { data: updated, error } = await supabase
      .from("categories")
      .update({
        name: data.name,
        description: data.description,
        parent_id: data.parent_id ?? null,
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated as CategoryType;
  },

  async deleteCategory(id: number): Promise<boolean> {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
```<|end|><|start|>write to=assistant<|channel|>analysis<|message|>Created file successfully: /Users/macbookpro/Downloads/ecommerce-supabase-Nextjs-main/src/services/admin/adminCategoryService.ts