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
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
  getCustomizationData: () => CustomizationData[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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

      const existingItem = currentItems.find(item =>
        item.product.id === product.id && !item.product.customization?.uploadedImage
      );
      if (existingItem) {
        return currentItems.map(item =>
          item.product.id === product.id && !item.product.customization?.uploadedImage
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentItems, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: number) => {
    setItems(currentItems => currentItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const isInCart = (productId: number) => items.some(item => item.product.id === productId);

  const getItemQuantity = (productId: number) => {
    const item = items.find(item => item.product.id === productId);
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
