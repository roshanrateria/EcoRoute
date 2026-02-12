import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Clock, MapPin, Leaf, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import BottomNav from '../components/BottomNav';

const ecoScoreColors = {
  'A+': { bg: 'bg-[#C1F03C]', text: 'text-[#1A4D2E]' },
  'A': { bg: 'bg-[#C1F03C]/70', text: 'text-[#1A4D2E]' },
  'B': { bg: 'bg-[#FFB020]', text: 'text-[#1A4D2E]' },
};

const Restaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const { items, addItem, updateQuantity, getTotal, getItemCount, restaurantId } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedItems, setAddedItems] = useState({});

  const fetchRestaurant = useCallback(async () => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
      toast.error('Failed to load restaurant');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [api, id, navigate]);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

  const handleAddItem = (item) => {
    addItem(item, restaurant);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
    toast.success(`${item.name} added to cart`);
  };

  const getItemQuantity = (itemId) => {
    const cartItem = items.find(i => i.id === itemId);
    return cartItem?.quantity || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7]">
        <div className="h-64 shimmer" />
        <div className="p-4 space-y-4">
          <div className="h-8 w-3/4 shimmer rounded" />
          <div className="h-4 w-1/2 shimmer rounded" />
          <div className="h-32 shimmer rounded-xl" />
          <div className="h-32 shimmer rounded-xl" />
        </div>
      </div>
    );
  }

  if (!restaurant) return null;

  const categories = ['All', ...new Set(restaurant.menu.map(item => item.category))];
  const filteredMenu = selectedCategory === 'All'
    ? restaurant.menu
    : restaurant.menu.filter(item => item.category === selectedCategory);

  const cartItemCount = getItemCount();
  const cartTotal = getTotal();
  const showCartBar = restaurantId === id && cartItemCount > 0;

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-40">
      {/* Hero Image */}
      <div className="relative h-64">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center btn-press"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5 text-[#122618]" />
        </button>

        {/* Eco Score */}
        <div className={`absolute top-4 right-4 ${ecoScoreColors[restaurant.eco_score].bg} ${ecoScoreColors[restaurant.eco_score].text} px-4 py-2 rounded-full font-bold flex items-center gap-2`}>
          <Leaf className="w-5 h-5" />
          Eco {restaurant.eco_score}
        </div>

        {/* Restaurant info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h1 className="text-2xl font-bold font-['Syne']">{restaurant.name}</h1>
          <p className="text-white/80 text-sm">{restaurant.cuisine}</p>
        </div>
      </div>

      {/* Restaurant details */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-[#F9F9F7] px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 text-[#FFB020] fill-current" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-[#5C6B5F] text-sm">
                <Clock className="w-4 h-4" />
                <span>{restaurant.delivery_time_mins} min</span>
              </div>
            </div>
            <span className="text-[#5C6B5F] text-sm">₹{restaurant.avg_price} for two</span>
          </div>

          <div className="flex items-center gap-2 text-[#5C6B5F] text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{restaurant.address}</span>
          </div>

          <p className="text-[#5C6B5F] text-sm mt-3">{restaurant.description}</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 pb-2 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all btn-press ${selectedCategory === category
                  ? 'bg-[#1A4D2E] text-white'
                  : 'bg-white text-[#5C6B5F] border border-[#E5E7EB]'
                }`}
              data-testid={`category-${category.toLowerCase().replace(' ', '-')}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="px-4 py-4 space-y-4">
        <h2 className="text-lg font-bold text-[#122618] font-['Syne']">Menu</h2>

        {filteredMenu.map((item, index) => {
          const quantity = getItemQuantity(item.id);
          const isAdded = addedItems[item.id];

          return (
            <motion.div
              key={item.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] flex"
              data-testid={`menu-item-${item.id}`}
            >
              {/* Image */}
              <div className="w-28 h-28 flex-shrink-0">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex-1 p-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#122618] text-sm">{item.name}</h3>
                    {item.is_veg && (
                      <div className="w-4 h-4 border border-[#1A4D2E] flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-[#1A4D2E]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[#8FA392] text-xs mt-1 line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-[#122618]">₹{item.price}</span>

                  {quantity === 0 ? (
                    <Button
                      onClick={() => handleAddItem(item)}
                      size="sm"
                      className={`h-8 px-4 rounded-full font-semibold text-xs btn-press transition-all ${isAdded
                          ? 'bg-[#C1F03C] text-[#1A4D2E]'
                          : 'bg-[#1A4D2E] text-white hover:bg-[#143D24]'
                        }`}
                      data-testid={`add-item-${item.id}`}
                    >
                      {isAdded ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3" /> Added
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add
                        </span>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#1A4D2E] rounded-full h-8 px-1">
                      <button
                        onClick={() => updateQuantity(item.id, quantity - 1)}
                        className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        data-testid={`decrease-${item.id}`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white font-semibold text-sm min-w-[20px] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleAddItem(item)}
                        className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        data-testid={`increase-${item.id}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating cart bar */}
      <AnimatePresence>
        {showCartBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-40 max-w-lg mx-auto"
          >
            <Button
              onClick={() => navigate('/cart')}
              className="w-full h-14 rounded-2xl bg-[#1A4D2E] text-white font-bold shadow-xl btn-press flex items-center justify-between px-5"
              data-testid="view-cart-btn"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span>{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</span>
              </div>
              <span>₹{cartTotal} →</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Restaurant;
