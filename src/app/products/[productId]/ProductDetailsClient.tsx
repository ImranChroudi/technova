"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ProductType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, Share2, Minus, Plus, Truck, Shield, RotateCcw, Check, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ReviewTab } from "./_components/review-tab";

type ProductDetailsClientProps = {
  product: ProductType;
};

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const productImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : ["/placeholder-product.jpg"];

  const handleAddToCart = async () => {
    try {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) setQuantity(quantity + 1);
  };
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };
  const nextImage = () => setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
  const prevImage = () => setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-muted relative aspect-square overflow-hidden rounded-2xl border">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImageIndex}
                  className="relative h-full w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {product.image ? (
                    <Image
                      src={productImages[selectedImageIndex]}
                      alt={product.title}
                      fill
                      className="object-contain p-6"
                      loading="eager"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="bg-muted flex h-full w-full items-center justify-center">
                      <span className="text-muted-foreground text-sm">No image available</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {productImages.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-background/80 absolute top-1/2 left-4 -translate-y-1/2 backdrop-blur-sm"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-background/80 absolute top-1/2 right-4 -translate-y-1/2 backdrop-blur-sm"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 cursor-pointer backdrop-blur-sm"
                  onClick={() => setIsFavorited(!isFavorited)}
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" className="bg-background/80 cursor-pointer backdrop-blur-sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    className={`aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImageIndex === index ? "border-primary" : "border-border hover:border-primary/40"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <motion.h1
                className="text-foreground mb-2 text-3xl md:text-4xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {product.title}
              </motion.h1>

              <motion.div
                className="mb-6 flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-foreground text-3xl font-bold">
                  ${product.price.toFixed(2)}
                </span>
                {product.stock > 0 ? (
                  <Badge className="bg-success/10 text-success border-success/20">
                    In stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge variant="destructive">Out of stock</Badge>
                )}
              </motion.div>
            </div>

            <motion.p
              className="text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {product.description}
            </motion.p>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div>
                <h3 className="mb-3 text-sm font-medium">Quantity</h3>
                <div className="flex items-center gap-3">
                  <div className="border-border flex items-center rounded-lg border">
                    <Button variant="ghost" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[48px] px-3 py-2 text-center font-medium">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={incrementQuantity} disabled={quantity >= product.stock}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className="text-muted-foreground text-sm">
                    {product.stock} items available
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full cursor-pointer"
                disabled={!product.stock || product.stock === 0}
                onClick={handleAddToCart}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to cart — ${(product.price * quantity).toFixed(2)}
                  </>
                )}
              </Button>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {[
                { icon: Truck, title: "Free shipping", desc: "Orders over $50" },
                { icon: Shield, title: "Secure payment", desc: "SSL encrypted" },
                { icon: RotateCcw, title: "30-day returns", desc: "No questions asked" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-center gap-3">
                  <Icon className="text-primary h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-muted-foreground text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="description" className="mb-12">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {product.description}
                    </p>
                    {product.sku && (
                      <div className="border-border mt-4 border-t pt-4">
                        <p className="text-muted-foreground text-sm">
                          <strong className="text-foreground">SKU:</strong> {product.sku}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ReviewTab product={product} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}