'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CustomizationData {
  uploadedImage: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  previewBase64: string | null;
}

// Selected variant info for cart
interface SelectedVariant {
  id: number;
  type: 'size' | 'capacity' | 'dimensions';
  label: string;
  price: number;
}

interface Product {
  id: number;
  name: string;
  price: number;
  original_price?: number | null;
  discount_percentage?: number;
  image_url?: string;
  short_description?: string;
  stock?: number;
  in_stock?: boolean;
  customization?: CustomizationData;
  category_id?: number;
  discount_info?: {
    id?: number;
    applies_to?: string;
    amount: number;
    type: string;
    value: number;
    label: string;
  };
  // Variant fields
  has_variants?: boolean;
  variant_type?: 'size' | 'capacity' | 'dimensions' | null;
  selected_variant?: SelectedVariant;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  isInCart: (productId: number, variantId?: number) => boolean;
  getItemQuantity: (productId: number, variantId?: number) => number;
  getCustomizationData: () => CustomizationData[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Generate unique key for cart item (handles variants and customizations)
function getCartItemKey(item: CartItem): string {
  const productId = item.product.id;
  const variantId = item.product.selected_variant?.id;
  const hasCustomization = !!item.product.customization?.uploadedImage;

  if (hasCustomization) {
    // Customized items are always unique
    return `${productId}-custom-${Date.now()}-${Math.random()}`;
  }
  if (variantId) {
    return `${productId}-variant-${variantId}`;
  }
  return `${productId}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (product: Product) => {
    setItems(currentItems => {
      // For customized items, always add as new entry
      if (product.customization?.uploadedImage) {
        return [...currentItems, { product, quantity: 1 }];
      }

      // For variant items, match by product ID AND variant ID
      if (product.selected_variant) {
        const existingItem = currentItems.find(item =>
          item.product.id === product.id &&
          item.product.selected_variant?.id === product.selected_variant?.id &&
          !item.product.customization?.uploadedImage
        );

        if (existingItem) {
          return currentItems.map(item =>
            item.product.id === product.id &&
              item.product.selected_variant?.id === product.selected_variant?.id &&
              !item.product.customization?.uploadedImage
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...currentItems, { product, quantity: 1 }];
      }

      // Standard product without variant
      const existingItem = currentItems.find(item =>
        item.product.id === product.id &&
        !item.product.customization?.uploadedImage &&
        !item.product.selected_variant
      );

      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id &&
            !item.product.customization?.uploadedImage &&
            !item.product.selected_variant
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: number, variantId?: number) => {
    setItems(currentItems => currentItems.filter(item => {
      if (item.product.id !== productId) return true;
      if (variantId !== undefined) {
        return item.product.selected_variant?.id !== variantId;
      }
      return false;
    }));
  };

  const updateQuantity = (productId: number, quantity: number, variantId?: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item => {
        if (item.product.id !== productId) return item;
        if (variantId !== undefined) {
          if (item.product.selected_variant?.id === variantId) {
            return { ...item, quantity };
          }
          return item;
        }
        if (!item.product.selected_variant) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const isInCart = (productId: number, variantId?: number) => {
    return items.some(item => {
      if (item.product.id !== productId) return false;
      if (variantId !== undefined) {
        return item.product.selected_variant?.id === variantId;
      }
      return !item.product.selected_variant;
    });
  };

  const getItemQuantity = (productId: number, variantId?: number) => {
    const item = items.find(item => {
      if (item.product.id !== productId) return false;
      if (variantId !== undefined) {
        return item.product.selected_variant?.id === variantId;
      }
      return !item.product.selected_variant;
    });
    return item?.quantity ?? 0;
  };

  const getCustomizationData = () => {
    return items
      .filter(item => item.product.customization?.uploadedImage)
      .map(item => item.product.customization as CustomizationData);
  };

  return (
    <CartContext.Provider value={{
      items,
      total,
      itemCount,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      getItemQuantity,
      getCustomizationData
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
