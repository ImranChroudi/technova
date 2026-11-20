'use client';
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from 'react';
import { ProductType } from '../types';
import * as cartService from '@/services/cart/cartService';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { track } from '@/lib/analytics';

// Define CartItem interface extending ProductType with quantity for UI consumption
export interface CartItem extends ProductType {
  quantity: number;
  cart_item_id?: number; // Database ID for the cart item (logged-in only)
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductType) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, amount: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'guest_cart';

function loadGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCartId, setActiveCartId] = useState<number | null>(null);
  const { user } = useAuth();
  const prevUserRef = useRef<string | null>(null);

  // Recompute totals whenever items change
  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setSubtotal(total);
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    setTotalItems(itemCount);
  }, [cartItems]);

  // Load cart when user changes
  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      setIsLoading(true);

      if (!user) {
        // Guest: load from localStorage
        const items = loadGuestCart();
        if (!cancelled) {
          setCartItems(items);
          setActiveCartId(null);
          setIsLoading(false);
        }
        prevUserRef.current = null;
        return;
      }

      // Logged in: load (or create) DB cart
      try {
        const cart = await cartService.getOrCreateCart();
        if (cancelled) return;
        if (cart) {
          setActiveCartId(cart.id);
          const items = await cartService.getCartItems(cart.id);
          const formattedItems: CartItem[] = items.map((item) => ({
            ...item.product,
            quantity: item.quantity,
            cart_item_id: item.id,
          }));

          // Merge any guest cart that existed before login
          const guestItems = loadGuestCart();
          if (guestItems.length > 0) {
            for (const g of guestItems) {
              await cartService.addItemToCart(
                cart.id,
                g.product_id,
                g.price,
                g.quantity
              );
            }
            localStorage.removeItem(GUEST_CART_KEY);
            // reload after merge
            const merged = await cartService.getCartItems(cart.id);
            const mergedFormatted: CartItem[] = merged.map((item) => ({
              ...item.product,
              quantity: item.quantity,
              cart_item_id: item.id,
            }));
            if (!cancelled) setCartItems(mergedFormatted);
          } else {
            if (!cancelled) setCartItems(formattedItems);
          }
        } else {
          if (!cancelled) setCartItems([]);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Failed to load your cart');
        if (!cancelled) setCartItems([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }

      prevUserRef.current = user.id;
    }

    loadCart();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const addToCart = async (product: ProductType) => {
    track({ type: 'add_to_cart', props: { product_id: product.product_id, price: product.price } });

    if (!user) {
      // Guest: localStorage
      setCartItems((prev) => {
        const idx = prev.findIndex((i) => i.product_id === product.product_id);
        let next: CartItem[];
        if (idx !== -1) {
          next = [...prev];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        } else {
          next = [...prev, { ...product, quantity: 1 }];
        }
        saveGuestCart(next);
        return next;
      });
      toast.success('Added to cart');
      return;
    }

    if (!activeCartId) {
      const cart = await cartService.createCart();
      if (!cart) {
        toast.error('Failed to create cart');
        return;
      }
      setActiveCartId(cart.id);
    }

    try {
      const cartId = activeCartId ?? (await cartService.getOrCreateCart())?.id;
      if (!cartId) {
        toast.error('Failed to create cart');
        return;
      }
      if (activeCartId !== cartId) setActiveCartId(cartId);

      const result = await cartService.addItemToCart(
        cartId,
        product.product_id,
        product.price,
        1
      );

      if (result) {
        setCartItems((prev) => {
          const idx = prev.findIndex((i) => i.product_id === product.product_id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + 1, cart_item_id: result.id };
            return next;
          }
          return [...prev, { ...product, quantity: 1, cart_item_id: result.id }];
        });
        toast.success('Added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) {
      setCartItems((prev) => {
        const next = prev.filter((i) => i.product_id !== productId);
        saveGuestCart(next);
        return next;
      });
      toast.success('Item removed');
      return;
    }

    if (!activeCartId) return;
    try {
      const item = cartItems.find((i) => i.product_id === productId);
      if (item?.cart_item_id) {
        const success = await cartService.removeCartItem(item.cart_item_id);
        if (success) {
          setCartItems((prev) => prev.filter((i) => i.product_id !== productId));
          toast.success('Item removed');
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    }
  };

  const updateQuantity = async (productId: string, amount: number) => {
    if (!user) {
      setCartItems((prev) => {
        const idx = prev.findIndex((i) => i.product_id === productId);
        if (idx === -1) return prev;
        const newQty = prev[idx].quantity + amount;
        let next: CartItem[];
        if (newQty <= 0) {
          next = prev.filter((i) => i.product_id !== productId);
        } else {
          next = [...prev];
          next[idx] = { ...next[idx], quantity: newQty };
        }
        saveGuestCart(next);
        return next;
      });
      return;
    }

    if (!activeCartId) return;
    try {
      const item = cartItems.find((i) => i.product_id === productId);
      if (!item || !item.cart_item_id) return;
      const newQuantity = item.quantity + amount;
      if (newQuantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      const result = await cartService.updateCartItemQuantity(item.cart_item_id, newQuantity);
      if (result) {
        setCartItems((prev) =>
          prev.map((i) => (i.product_id === productId ? { ...i, quantity: newQuantity } : i))
        );
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    if (!user) {
      setCartItems([]);
      saveGuestCart([]);
      toast.success('Cart cleared');
      return;
    }
    if (!activeCartId) return;
    try {
      const success = await cartService.clearCart(activeCartId);
      if (success) {
        setCartItems([]);
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}