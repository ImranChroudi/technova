"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CreateProductData,
  ProductWithDetails,
} from "@/services/admin/adminProductService";
import { useCategories } from "@/hooks/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Sparkles, ImageIcon, UploadCloud, X } from "lucide-react";

interface FormData {
  title: string;
  description: string;
  price: string;
  image: string;
  images: string[];
  stock: string;
  sku: string;
  category_id: string;
}

const MAX_IMAGES = 5;

const EMPTY_FORM: FormData = {
  title: "",
  description: "",
  price: "",
  image: "",
  images: [],
  stock: "",
  sku: "",
  category_id: "no-category",
};

function Field({
  id,
  label,
  error,
  hint,
  action,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {error ? (
        <p role="alert" className="text-destructive text-xs">
          {error}
        </p>
      ) : hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductData) => Promise<void>;
  product?: ProductWithDetails | null;
  title: string;
}) {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

  // Object URLs for files that haven't been uploaded yet
  const pendingPreviews = useMemo(
    () => pendingFiles.map((f) => URL.createObjectURL(f)),
    [pendingFiles]
  );
  useEffect(() => {
    return () => pendingPreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [pendingPreviews]);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        image: product.image || "",
        images: product.images || (product.image ? [product.image] : []),
        stock: product.stock?.toString() || "",
        sku: product.sku || "",
        category_id: product.category_id?.toString() || "no-category",
      });
      setImages(product.images || (product.image ? [product.image] : []));
    } else {
      setFormData(EMPTY_FORM);
      setImages([]);
    }
    setImageFile(null);
    setPendingFiles([]);
    setImagePreview(product?.image || null);
    setErrors({});
  }, [product, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price.trim()) newErrors.price = "Price is required";
    else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) newErrors.price = "Price must be a positive number";
    }
    if (!formData.stock.trim()) newErrors.stock = "Stock is required";
    else {
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) newErrors.stock = "Stock must be a non-negative number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleEnhance = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      toast.error("Enter a title or description first");
      return;
    }
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/enhance-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          sku: formData.sku,
          category_id:
            formData.category_id !== "no-category" ? parseInt(formData.category_id) : null,
        }),
      });
      const data = await res.json();
      if (data.title) setFormData((p) => ({ ...p, title: data.title }));
      if (data.description) setFormData((p) => ({ ...p, description: data.description }));
      if (typeof data.price === "number" && data.price > 0)
        setFormData((p) => ({ ...p, price: data.price.toString() }));
      toast.success(
        data.source === "ai"
          ? "AI suggestions applied — review and edit before saving"
          : "Basic cleanup applied"
      );
    } catch (e) {
      console.error(e);
      toast.error("Failed to enhance product");
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      let mainImageUrl = formData.image.trim() || undefined;
      if (imageFile) {
        const { uploadImage } = await import("@/services/storage/storageService");
        mainImageUrl = await uploadImage(imageFile);
      }
      const uploadedExtras: string[] = [];
      for (const f of pendingFiles) {
        const { uploadImage } = await import("@/services/storage/storageService");
        uploadedExtras.push(await uploadImage(f));
      }

      const finalImages = [...images, ...uploadedExtras];
      if (mainImageUrl && !finalImages.includes(mainImageUrl)) finalImages.unshift(mainImageUrl);
      const mainImage = mainImageUrl || finalImages[0] || undefined;

      const submitData: CreateProductData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        image: mainImage,
        images: finalImages.length ? finalImages : undefined,
        stock: parseInt(formData.stock),
        sku: formData.sku.trim() || undefined,
        category_id:
          formData.category_id && formData.category_id !== "no-category"
            ? parseInt(formData.category_id)
            : undefined,
      };
      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting product:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalImages = images.length + pendingFiles.length;
  const busy = loading || enhancing;

  const inputError = (key: string) =>
    errors[key] ? "border-destructive focus-visible:ring-destructive/30" : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-1/2 left-1/2 z-50 flex max-h-[92vh] -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1.5rem)] max-w-3xl sm:max-w-3xl flex-col gap-0 overflow-hidden p-0">
        {enhancing && (
          <div className="bg-background/80 absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
            <Loader2 className="text-primary h-7 w-7 animate-spin" />
            <p className="text-sm font-medium">Enhancing with AI…</p>
            <p className="text-muted-foreground text-xs">Checking title, description and price</p>
          </div>
        )}

        <DialogHeader className="border-b px-6 py-4 text-left">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription>Add photos and details customers will see.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
          {/* Images: one row */}
          <section aria-label="Product images" className="flex flex-col gap-4 sm:flex-row">
            <div className="bg-muted/30 relative aspect-square w-full shrink-0 overflow-hidden rounded-lg border sm:w-44">
              {imagePreview ? (
                <img src={imagePreview} alt="Main product" className="h-full w-full object-contain" />
              ) : (
                <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-1.5">
                  <ImageIcon className="h-8 w-8 opacity-40" />
                  <p className="text-xs">No main image yet</p>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <Label className="text-sm font-medium">Images</Label>
                <span className="text-muted-foreground text-xs">
                  {totalImages}/{MAX_IMAGES} · click a photo to make it the main one
                </span>
              </div>

              <ul className="flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <li key={`${img}-${i}`} className="relative h-20 w-20">
                    <button
                      type="button"
                      title={i === 0 ? "Main image" : "Set as main image"}
                      onClick={() => {
                        const reordered = [img, ...images.filter((_, idx) => idx !== i)];
                        setImages(reordered);
                        setFormData((p) => ({ ...p, image: reordered[0] }));
                        setImagePreview(reordered[0]);
                      }}
                      className={`h-full w-full overflow-hidden rounded-md border transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                        i === 0 ? "ring-primary ring-2" : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Product image ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove image ${i + 1}`}
                      className="bg-background text-foreground hover:bg-destructive hover:text-destructive-foreground absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm transition"
                      onClick={() => {
                        const next = images.filter((_, idx) => idx !== i);
                        setImages(next);
                        setFormData((p) => ({ ...p, image: next[0] || "" }));
                        setImagePreview(next[0] || null);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}

                {pendingFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="relative h-20 w-20">
                    <button
                      type="button"
                      title="Preview"
                      onClick={() => setImagePreview(pendingPreviews[i])}
                      className="h-full w-full overflow-hidden rounded-md border border-dashed"
                    >
                      <img src={pendingPreviews[i]} alt={f.name} className="h-full w-full object-cover" />
                    </button>
                    <span className="bg-primary text-primary-foreground absolute bottom-1 left-1 rounded px-1 text-[10px] leading-4">
                      New
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      className="bg-background text-foreground hover:bg-destructive hover:text-destructive-foreground absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm transition"
                      onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}

                {totalImages < MAX_IMAGES && (
                  <li className="h-20 w-20">
                    <label
                      htmlFor="image-upload"
                      className="hover:bg-muted hover:border-primary/50 text-muted-foreground flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed text-xs transition"
                    >
                      <UploadCloud className="h-5 w-5" />
                      Add
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          const remaining = MAX_IMAGES - totalImages;
                          const toAdd = files.slice(0, Math.max(0, remaining));
                          if (files.length > toAdd.length) toast.error(`Up to ${MAX_IMAGES} images`);
                          setPendingFiles((prev) => [...prev, ...toAdd]);
                          if (toAdd.length && !imagePreview) setImagePreview(URL.createObjectURL(toAdd[0]));
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </li>
                )}
              </ul>

              <Input
                aria-label="Image URL"
                value={formData.image}
                onChange={(e) => {
                  handleInputChange("image", e.target.value);
                  if (e.target.value) {
                    setImagePreview(e.target.value);
                    setImages((prev) => (prev.length ? prev : [e.target.value]));
                  }
                }}
                placeholder="Or paste an image URL"
                className="text-sm"
              />
            </div>
          </section>

          <hr />

          {/* Fields: in rows */}
          <section aria-label="Product details" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
              <Field id="title" label="Title" error={errors.title}>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g. Handwoven wool rug"
                  aria-invalid={!!errors.title}
                  className={inputError("title")}
                />
              </Field>
              <Field id="sku" label="SKU" hint="Optional">
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                  placeholder="e.g. RUG-001"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field id="price" label="Price" error={errors.price}>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    inputMode="decimal"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.00"
                    aria-invalid={!!errors.price}
                    className={`pr-10 ${inputError("price")}`}
                  />
                  <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">
                    DH
                  </span>
                </div>
              </Field>
              <Field id="stock" label="Stock" error={errors.stock}>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  placeholder="0"
                  aria-invalid={!!errors.stock}
                  className={inputError("stock")}
                />
              </Field>
              <Field id="category" label="Category">
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange("category_id", value ?? "")}
                  disabled={categoriesLoading || !!categoriesError}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder={categoriesLoading ? "Loading…" : "Select a category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-category">No category</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {categoriesError && (
              <div className="border-destructive/30 bg-destructive/10 flex items-center justify-between gap-2 rounded-md border p-2.5 text-sm">
                <p className="text-destructive">{categoriesError.message}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void refetchCategories()}>
                  Retry
                </Button>
              </div>
            )}

            <Field
              id="description"
              label="Description"
              error={errors.description}
              action={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleEnhance}
                  disabled={busy}
                  className="text-primary hover:text-primary h-7 gap-1.5 px-2 text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Improve with AI
                </Button>
              }
            >
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="What is it, what is it made of, who is it for?"
                rows={4}
                aria-invalid={!!errors.description}
                className={`border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring/50 w-full resize-y rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] ${
                  errors.description ? "border-destructive focus-visible:ring-destructive/30" : ""
                }`}
              />
            </Field>
          </section>
        </form>

        <DialogFooter className="bg-background gap-2 border-t px-6 py-3 sm:items-center">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={busy}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Saving…" : product ? "Save changes" : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}