import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');

  const addItem = useCallback((item, restaurant) => {
    // If cart has items from different restaurant, clear it first
    if (restaurantId && restaurantId !== restaurant.id) {
      setItems([{
        ...item,
        quantity: 1,
        restaurant_id: restaurant.id
      }]);
      setRestaurantId(restaurant.id);
      setRestaurantName(restaurant.name);
      return;
    }

    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(i => i.id === item.id);
      
      if (existingIndex >= 0) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      }
      
      return [...prevItems, { ...item, quantity: 1, restaurant_id: restaurant.id }];
    });

    if (!restaurantId) {
      setRestaurantId(restaurant.id);
      setRestaurantName(restaurant.name);
    }
  }, [restaurantId]);

  const removeItem = useCallback((itemId) => {
    setItems(prevItems => {
      const updated = prevItems.filter(i => i.id !== itemId);
      if (updated.length === 0) {
        setRestaurantId(null);
        setRestaurantName('');
      }
      return updated;
    });
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName('');
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [items]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getCartItems = useCallback(() => {
    return items.map(item => ({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      restaurant_id: item.restaurant_id
    }));
  }, [items]);

  const value = {
    items,
    restaurantId,
    restaurantName,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    getCartItems,
    isEmpty: items.length === 0
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
