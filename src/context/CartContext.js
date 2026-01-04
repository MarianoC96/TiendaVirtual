import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estados iniciales del carrito
const initialState = {
  items: [],
  total: 0,
  itemCount: 0,
  isOpen: false,
};

// Tipos de acciones para el reducer
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  TOGGLE_CART: 'TOGGLE_CART',
  LOAD_CART: 'LOAD_CART',
};

// Reducer para manejar las acciones del carrito
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      const quantityToAdd = action.payload.quantity || 1;
      const stockAvailable = action.payload.stock;

      console.log('Adding item:', action.payload.name, 'Stock:', stockAvailable, 'Quantity:', quantityToAdd);

      // Solo validar si hay stock definido explícitamente y es 0
      if (stockAvailable === 0) {
        alert('Este producto no tiene stock disponible.');
        return state;
      }

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantityToAdd;

        // Solo verificar límite de stock si stockAvailable es un número válido
        if (stockAvailable !== null && stockAvailable !== undefined && newQuantity > stockAvailable) {
          alert(`No puedes agregar más cantidad de la disponible en stock (${stockAvailable}).`);
          return state;
        }

        // Si el producto ya existe, aumentar la cantidad
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: newQuantity }
            : item
        );

        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        };
      } else {
        if (stockAvailable !== null && stockAvailable !== undefined && quantityToAdd > stockAvailable) {
          alert(`La cantidad solicitada excede el stock disponible (${stockAvailable}).`);
          return state; // O podríamos agregar solo el máximo disponible
        }

        // Si es un producto nuevo, agregarlo al carrito
        const newItem = {
          ...action.payload,
          quantity: quantityToAdd,
          addedAt: new Date().toISOString(),
        };

        const updatedItems = [...state.items, newItem];

        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems),
        };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const updatedItems = state.items.filter(item => item.id !== action.payload.id);

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems),
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;

      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, remover el item
        return cartReducer(state, { type: CART_ACTIONS.REMOVE_ITEM, payload: { id } });
      }

      const updatedItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );

      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems),
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0,
      };

    case CART_ACTIONS.TOGGLE_CART:
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case CART_ACTIONS.LOAD_CART:
      return {
        ...state,
        items: action.payload.items || [],
        total: calculateTotal(action.payload.items || []),
        itemCount: calculateItemCount(action.payload.items || []),
      };

    default:
      return state;
  }
};

// Función para calcular el total del carrito
const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const price = item.originalPrice && item.discount > 0 ? item.price : item.price;
    return total + (price * item.quantity);
  }, 0);
};

// Función para calcular el número total de items
const calculateItemCount = (items) => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

// Crear el contexto
const CartContext = createContext();

// Hook personalizado para usar el contexto del carrito
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider del contexto del carrito
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, (initial) => {
    // Inicialización vaga (Lazy init) para cargar desde localStorage antes del primer render
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        return {
          ...initial,
          ...parsedCart,
          items: parsedCart.items || [],
          // Recalcular para asegurar consistencia
          total: calculateTotal(parsedCart.items || []),
          itemCount: calculateItemCount(parsedCart.items || []),
        };
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        return initial;
      }
    }
    return initial;
  });

  // Guardar carrito en localStorage cuando cambie el estado
  useEffect(() => {
    const cartToSave = {
      items: state.items,
      total: state.total,
      itemCount: state.itemCount,
    };
    localStorage.setItem('shopping-cart', JSON.stringify(cartToSave));
  }, [state.items, state.total, state.itemCount]);

  // Funciones para interactuar con el carrito
  const addItem = (product, quantity = 1) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { ...product, quantity },
    });
  };

  const removeItem = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { id: productId },
    });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { id: productId, quantity },
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const toggleCart = () => {
    dispatch({ type: CART_ACTIONS.TOGGLE_CART });
  };

  // Función para obtener item específico del carrito
  const getCartItem = (productId) => {
    return state.items.find(item => item.id === productId);
  };

  // Función para verificar si un producto está en el carrito
  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  // Función para obtener la cantidad de un producto en el carrito
  const getItemQuantity = (productId) => {
    const item = getCartItem(productId);
    return item ? item.quantity : 0;
  };

  // Función para calcular descuentos totales
  const getTotalSavings = () => {
    return state.items.reduce((savings, item) => {
      if (item.originalPrice && item.discount > 0) {
        const discountAmount = item.originalPrice - item.price;
        return savings + (discountAmount * item.quantity);
      }
      return savings;
    }, 0);
  };

  // Valor del contexto
  const value = {
    // Estado
    items: state.items,
    cartItems: state.items, // Alias para compatibilidad
    total: state.total,
    cartTotal: state.total, // Alias para compatibilidad
    itemCount: state.itemCount,
    isOpen: state.isOpen,

    // Acciones
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,

    // Utilidades
    getCartItem,
    isInCart,
    getItemQuantity,
    getTotalSavings,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
