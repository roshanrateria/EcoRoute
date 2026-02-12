import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Star, Leaf, Filter, ChevronRight, Package, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import BottomNav from '../components/BottomNav';

const ecoScoreColors = {
  'A+': { bg: 'bg-[#C1F03C]', text: 'text-[#1A4D2E]' },
  'A': { bg: 'bg-[#C1F03C]/70', text: 'text-[#1A4D2E]' },
  'B': { bg: 'bg-[#FFB020]', text: 'text-[#1A4D2E]' },
};

const cuisineFilters = ['All', 'Healthy', 'Indian', 'Italian', 'Chinese', 'American', 'South Indian', 'Cafe', 'Street Food'];

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const { user, api } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState([]);
  const [batchCounts, setBatchCounts] = useState({});

  const fetchActiveOrders = useCallback(async () => {
    try {
      const response = await api.get('/orders');
      const active = response.data.filter(o => o.status !== 'delivered');
      setActiveOrders(active);
    } catch (error) {
      console.error('Failed to fetch active orders:', error);
    }
  }, [api]);

  const fetchBatchCounts = useCallback(async () => {
    try {
      const response = await api.get('/restaurants/batch-counts');
      setBatchCounts(response.data);
    } catch (error) {
      console.error('Failed to fetch batch counts:', error);
    }
  }, [api]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await api.get('/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchRestaurants();
    fetchActiveOrders();
    fetchBatchCounts();
  }, [fetchRestaurants, fetchActiveOrders, fetchBatchCounts]);

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  const calculateCarbonSavings = (restaurant) => {
    // Simulated savings based on eco score
    const base = { 'A+': 95, 'A': 75, 'B': 45 };
    return base[restaurant.eco_score] || 50;
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-24">
      {/* Header */}
      <div className="bg-[#1A4D2E] px-4 pt-12 pb-6">

        {/* Active Order Banner */}
        {activeOrders.length > 0 && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4"
          >
            {activeOrders.slice(0, 1).map(order => (
              <button
                key={order.id}
                onClick={() => navigate(`/order/${order.id}`)}
                className="w-full bg-[#C1F03C] rounded-xl p-3 flex items-center gap-3 btn-press"
                data-testid="active-order-banner"
              >
                <div className="w-9 h-9 rounded-lg bg-[#1A4D2E] flex items-center justify-center">
                  <Package className="w-4 h-4 text-[#C1F03C]" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[#1A4D2E] text-sm font-bold">
                    {order.status === 'waiting_for_batch' ? 'Batch in progress' : order.restaurant_name}
                  </p>
                  <p className="text-[#1A4D2E]/60 text-xs">
                    {order.status === 'waiting_for_batch' ? 'Tap to view batch status' : 'Track your order →'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#1A4D2E]" />
              </button>
            ))}
          </motion.div>
        )}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-[#C1F03C] text-sm font-medium">Hello, {user?.name?.split(' ')[0] || 'there'}!</p>
            <h1 className="text-white text-xl font-bold font-['Syne']">What's for today?</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/10 rounded-full px-3 py-1.5 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-[#C1F03C]" />
              <span className="text-white text-sm font-medium">
                {((user?.total_co2_saved || 0) / 1000).toFixed(1)}kg saved
              </span>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8FA392]" />
          <Input
            type="text"
            placeholder="Search restaurants, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 h-12 rounded-full bg-white border-0 shadow-lg focus:ring-2 focus:ring-[#C1F03C]"
            data-testid="search-input"
          />
        </motion.div>
      </div>

      {/* Cuisine filters */}
      <div className="px-4 py-4 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          {cuisineFilters.map((cuisine) => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisine(cuisine)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all btn-press ${selectedCuisine === cuisine
                ? 'bg-[#1A4D2E] text-white'
                : 'bg-white text-[#5C6B5F] border border-[#E5E7EB]'
                }`}
              data-testid={`cuisine-filter-${cuisine.toLowerCase().replace(' ', '-')}`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurants */}
      <div className="px-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#122618] font-['Syne']">
            Nearby Restaurants
          </h2>
          <span className="text-sm text-[#5C6B5F]">{filteredRestaurants.length} places</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="h-40 shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 shimmer rounded" />
                  <div className="h-4 w-1/2 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredRestaurants.map((restaurant, index) => (
              <motion.div
                key={restaurant.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] card-hover cursor-pointer"
                data-testid={`restaurant-card-${restaurant.id}`}
              >
                {/* Image */}
                <div className="relative h-40">
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Eco Score Badge */}
                  <div className={`absolute top-3 right-3 ${ecoScoreColors[restaurant.eco_score].bg} ${ecoScoreColors[restaurant.eco_score].text} px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 eco-badge-pulse`}>
                    <Leaf className="w-4 h-4" />
                    {restaurant.eco_score}
                  </div>
                  {/* Carbon savings indicator */}
                  <div className="absolute bottom-3 left-3 glass rounded-full px-3 py-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#C1F03C]" />
                    <span className="text-xs font-medium text-[#122618]">
                      Save ~{calculateCarbonSavings(restaurant)}g CO₂
                    </span>
                    {(batchCounts[restaurant.id] || 0) > 0 && (
                      <>
                        <span className="text-[#8FA392]">•</span>
                        <span className="text-xs font-bold text-[#1A4D2E] flex items-center gap-0.5">
                          <Users className="w-3 h-3" />
                          {batchCounts[restaurant.id]} nearby!
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-[#122618] text-lg">{restaurant.name}</h3>
                      <p className="text-[#5C6B5F] text-sm">{restaurant.cuisine}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#F9F9F7] px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-[#FFB020] fill-current" />
                      <span className="text-sm font-semibold text-[#122618]">{restaurant.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-[#5C6B5F]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{restaurant.delivery_time_mins} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{restaurant.address.split(',')[0]}</span>
                    </div>
                    <span className="ml-auto font-medium">₹{restaurant.avg_price} for two</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-[#F0F2F0] rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-[#8FA392]" />
            </div>
            <p className="text-[#5C6B5F]">No restaurants found</p>
            <p className="text-sm text-[#8FA392] mt-1">Try a different search or filter</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
