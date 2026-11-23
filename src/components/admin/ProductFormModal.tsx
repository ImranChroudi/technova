"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductData) => Promise<void>;
  product?: ProductWithDetails | null;
  title: string;
}

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

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  title,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    image: "",
    stock: "",
    sku: "",
    category_id: "no-category",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);  // remote URLs only
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Use the query hook to fetch categories
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories();

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
      setFormData({
        title: "",
        description: "",
        price: "",
        image: "",
        images: [],
        stock: "",
        sku: "",
        category_id: "no-category",
      });
      setImages([]);
    }
    setImageFile(null);
    setPendingFiles([]);
    setImagePreview(product?.image || null);
    setErrors({});
  }, [product, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = "Price must be a positive number";
      }
    }

    if (!formData.stock.trim()) {
      newErrors.stock = "Stock is required";
    } else {
      const stock = parseInt(formData.stock);
      if (isNaN(stock) || stock < 0) {
        newErrors.stock = "Stock must be a non-negative number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          category_id: formData.category_id !== "no-category" ? parseInt(formData.category_id) : null,
        }),
      });
      const data = await res.json();
      if (data.title) setFormData((p) => ({ ...p, title: data.title }));
      if (data.description) setFormData((p) => ({ ...p, description: data.description }));
      if (typeof data.price === "number" && data.price > 0) setFormData((p) => ({ ...p, price: data.price.toString() }));
      toast.success(data.source === "ai" ? "AI suggestions applied — review & edit before saving" : "Basic cleanup applied");
    } catch (e) {
      console.error(e);
      toast.error("Failed to enhance product");
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      setUploadingImage(true);
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
      setUploadingImage(false);

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md relative">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {product ? "Edit product details" : "Create a new product"}
          </DialogDescription>
        </DialogHeader>

        {enhancing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 rounded-lg bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Enhancing product with AI…</p>
            <p className="text-xs text-muted-foreground">Analyzing title, description & price</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleEnhance}
              disabled={enhancing || loading}
              className="gap-2"
            >
              {enhancing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enhancing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Enhance with AI
                </>
              )}
            </Button>
          </div>

          <div>
            <Label htmlFor="title">Product Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter product title"
              className={
                errors.title
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                  : ""
              }
            />
            {errors.title && (
              <p className="mt-1 text-sm text-rose-600">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter product description"
              rows={3}
              className={`w-full rounded-md border px-3 py-2 focus:ring-2 focus:outline-none ${
                errors.description
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-slate-300 focus:ring-blue-500"
              }`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0.00"
                className={
                  errors.price
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    : ""
                }
              />
              {errors.price && (
                <p className="mt-1 text-sm text-rose-600">{errors.price}</p>
              )}
            </div>

            <div>
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="0"
                className={
                  errors.stock
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    : ""
                }
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-rose-600">{errors.stock}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => handleInputChange("sku", e.target.value)}
              placeholder="Product SKU (optional)"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            {categoriesError && (
              <div className="border-destructive/30 bg-destructive/10 mt-1 mb-2 space-y-2 rounded-md border p-2 text-sm">
                <p className="text-destructive">{categoriesError.message}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => void refetchCategories()}
                >
                  Retry categories
                </Button>
              </div>
            )}
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                handleInputChange("category_id", value ?? "")
              }
              disabled={categoriesLoading || !!categoriesError}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
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
          </div>

          <div>
            <Label>Images (up to 5)</Label>
            {/* Remote images gallery */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt={`img-${i}`} className={`h-16 w-16 rounded-md object-cover border cursor-pointer ${i === 0 ? "ring-2 ring-primary" : ""}`} onClick={() => {
                      const reordered = [img, ...images.filter((_, idx) => idx !== i)];
                      setImages(reordered);
                      setFormData((p) => ({ ...p, image: reordered[0] }));
                      setImagePreview(reordered[0]);
                    }} title="Click to set as main" />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
                      onClick={() => {
                        const next = images.filter((_, idx) => idx !== i);
                        setImages(next);
                        setFormData((p) => ({ ...p, image: next[0] || "" }));
                        setImagePreview(next[0] || null);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Pending files preview */}
            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(f)} alt={`pending-${i}`} className="h-16 w-16 rounded-md object-cover border opacity-70" />
                    <button
                      type="button"
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
                      onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mb-2">Click a saved image to set as main. First image is the main.</p>

            <input
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary file:cursor-pointer"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                const remaining = 5 - (images.length + pendingFiles.length);
                const toAdd = files.slice(0, Math.max(0, remaining));
                setPendingFiles((prev) => [...prev, ...toAdd]);
                if (toAdd.length && !imagePreview) setImagePreview(URL.createObjectURL(toAdd[0]));
                e.target.value = "";
              }}
            />
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => {
                handleInputChange("image", e.target.value);
                if (e.target.value) {
                  setImagePreview(e.target.value);
                  setImages((prev) => (prev.length ? prev : [e.target.value]));
                }
              }}
              placeholder="Or paste main image URL"
              className="mt-2"
            />
            {uploadingImage && <p className="text-xs text-muted-foreground mt-1">Uploading images...</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || enhancing}>
              {loading ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
