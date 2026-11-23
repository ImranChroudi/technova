"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Plus, Edit, Trash2, Search, FolderTree } from "lucide-react";
import { adminCategoryService, CreateCategoryData } from "@/services/admin/adminCategoryService";
import { CategoryType } from "@/types";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<CategoryType | null>(null);
  const [deleting, setDeleting] = useState<CategoryType | null>(null);

  const [form, setForm] = useState<CreateCategoryData>({ name: "", description: "", parent_id: null, image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminCategoryService.getAllCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", parent_id: null, image: "" });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    try {
      let imageUrl = form.image?.trim() || undefined;
      if (imageFile) {
        const { uploadImage } = await import("@/services/storage/storageService");
        imageUrl = await uploadImage(imageFile);
      }
      await adminCategoryService.createCategory({ ...form, image: imageUrl });
      toast.success("Category created");
      setShowCreate(false);
      resetForm();
      fetchCategories();
    } catch (e) {
      console.error(e);
      toast.error("Failed to create category");
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    try {
      let imageUrl = form.image?.trim() || undefined;
      if (imageFile) {
        const { uploadImage } = await import("@/services/storage/storageService");
        imageUrl = await uploadImage(imageFile);
      }
      await adminCategoryService.updateCategory(editing.id, { ...form, image: imageUrl });
      toast.success("Category updated");
      setEditing(null);
      resetForm();
      fetchCategories();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await adminCategoryService.deleteCategory(deleting.id);
      toast.success("Category deleted");
      setDeleting(null);
      fetchCategories();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete category");
    }
  };

  const openEdit = (c: CategoryType) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description, parent_id: c.parent_id ?? null, image: c.image || "" });
    setImagePreview(c.image || null);
    setImageFile(null);
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
          <p className="text-muted-foreground">Create, edit, and delete product categories</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreate(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No categories found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-primary" />
                  {c.name}
                </CardTitle>
                <Badge variant="secondary">ID {c.id}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                {c.parent_id && (
                  <p className="text-xs text-muted-foreground mb-3">Parent: {c.parent_id}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                    <Edit className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleting(c)}>
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input
                placeholder="Parent ID (optional)"
                value={form.parent_id ?? ""}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value ? Number(e.target.value) : null })}
              />
              {imagePreview && <img src={imagePreview} alt="preview" className="h-20 w-20 rounded-md object-cover border" />}
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary file:cursor-pointer"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setImageFile(f);
                    setImagePreview(URL.createObjectURL(f));
                    setForm({ ...form, image: "" });
                  }
                  e.target.value = "";
                }}
              />
              <Input
                placeholder="Or image URL"
                value={form.image || ""}
                onChange={(e) => {
                  setForm({ ...form, image: e.target.value });
                  if (e.target.value) { setImageFile(null); setImagePreview(e.target.value); }
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleCreate}>Create</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Input
                placeholder="Parent ID (optional)"
                value={form.parent_id ?? ""}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value ? Number(e.target.value) : null })}
              />
              {imagePreview && <img src={imagePreview} alt="preview" className="h-20 w-20 rounded-md object-cover border" />}
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary file:cursor-pointer"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setImageFile(f);
                    setImagePreview(URL.createObjectURL(f));
                    setForm({ ...form, image: "" });
                  }
                  e.target.value = "";
                }}
              />
              <Input
                placeholder="Or image URL"
                value={form.image || ""}
                onChange={(e) => {
                  setForm({ ...form, image: e.target.value });
                  if (e.target.value) { setImageFile(null); setImagePreview(e.target.value); }
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setEditing(null); resetForm(); }}>Cancel</Button>
                <Button onClick={handleUpdate}>Save</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {deleting && (
        <DeleteConfirmModal
          isOpen={true}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          title="Delete Category"
          description={`Delete "${deleting.name}"? Products in this category will have category set to null.`}
        />
      )}
    </div>
  );
}
