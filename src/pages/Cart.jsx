import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, MapPin, Leaf, Zap, Clock, ChevronRight, X, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import BottomNav from '../components/BottomNav';

const IIT_DELHI_LAT = 28.5456;
const IIT_DELHI_LNG = 77.1926;

const Cart = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const { items, restaurantId, restaurantName, updateQuantity, removeItem, clearCart, getTotal, getItemCount, getCartItems } = useCart();

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('Hostel 3, IIT Delhi');
  const [selectedOption, setSelectedOption] = useState('batch'); // 'batch' or 'rush'

  const subtotal = getTotal();
  const deliveryFee = selectedOption === 'batch' ? 20 : 40;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    // Always show the batch vs rush choice
    setShowBatchModal(true);
  };

  const placeOrder = async (isBatched) => {
    setLoading(true);
    try {
      const orderData = {
        restaurant_id: restaurantId,
        items: getCartItems(),
        delivery_address: deliveryAddress,
        delivery_lat: IIT_DELHI_LAT + (Math.random() - 0.5) * 0.004,
        delivery_lng: IIT_DELHI_LNG + (Math.random() - 0.5) * 0.004,
        is_batched: isBatched,
        batch_id: null,
      };

      const response = await api.post('/orders', orderData);

      clearCart();
      toast.success(
        isBatched
          ? 'Eco-Batch order placed! Waiting for batch...'
          : 'Rush order placed!'
      );
      navigate(`/order/${response.data.id}`);
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
      setShowBatchModal(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex flex-col">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#E5E7EB] btn-press"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5 text-[#122618]" />
          </button>
          <h1 className="text-xl font-bold text-[#122618] font-['Syne']">Your Cart</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-[#F0F2F0] rounded-full flex items-center justify-center mb-4">
            <Leaf className="w-10 h-10 text-[#8FA392]" />
          </div>
          <h2 className="text-xl font-bold text-[#122618] font-['Syne'] mb-2">Cart is empty</h2>
          <p className="text-[#5C6B5F] mb-6">Add some delicious food and save the planet!</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-[#1A4D2E] text-white rounded-full px-8 h-12 font-bold btn-press"
            data-testid="browse-restaurants-btn"
          >
            Browse Restaurants
          </Button>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-40">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 bg-white border-b border-[#E5E7EB]">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-[#F9F9F7] rounded-full flex items-center justify-center btn-press"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5 text-[#122618]" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#122618] font-['Syne']">Your Cart</h1>
          <p className="text-sm text-[#5C6B5F]">{restaurantName}</p>
        </div>
      </div>

      {/* Cart items */}
      <div className="p-4 space-y-3">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-white rounded-xl p-4 border border-[#E5E7EB] flex items-center gap-4"
            data-testid={`cart-item-${item.id}`}
          >
            <div className="flex-1">
              <h3 className="font-semibold text-[#122618]">{item.name}</h3>
              <p className="text-[#1A4D2E] font-bold">₹{item.price}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#F9F9F7] rounded-full p-1">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center btn-press"
                  data-testid={`decrease-${item.id}`}
                >
                  <Minus className="w-4 h-4 text-[#5C6B5F]" />
                </button>
                <span className="font-semibold text-[#122618] min-w-[24px] text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center btn-press"
                  data-testid={`increase-${item.id}`}
                >
                  <Plus className="w-4 h-4 text-[#5C6B5F]" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center btn-press"
                data-testid={`remove-${item.id}`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delivery address */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-[#1A4D2E]" />
            <span className="font-semibold text-[#122618]">Delivery Address</span>
          </div>
          <Input
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="border-[#E5E7EB] rounded-xl"
            placeholder="Enter your delivery address"
            data-testid="delivery-address-input"
          />
        </div>
      </div>

      {/* Eco-batch info card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mb-4"
      >
        <div className="bg-gradient-to-r from-[#1A4D2E] to-[#2A6E45] rounded-2xl p-4 text-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C1F03C] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#1A4D2E]" />
            </div>
            <div>
              <p className="font-bold text-lg">Eco-Batch & Save!</p>
              <p className="text-white/80 text-sm mt-1">
                Choose Eco-Batch at checkout to share your delivery, save ₹20 and reduce CO₂ emissions.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bill summary */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-xl p-4 border border-[#E5E7EB]">
          <h3 className="font-bold text-[#122618] mb-3">Bill Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#5C6B5F]">Subtotal ({getItemCount()} items)</span>
              <span className="text-[#122618]">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C6B5F]">Delivery Fee</span>
              <span className={selectedOption === 'batch' ? 'text-[#1A4D2E]' : 'text-[#122618]'}>
                ₹{deliveryFee}
                {selectedOption === 'batch' && <span className="text-xs ml-1">(Eco-saved!)</span>}
              </span>
            </div>
            <div className="border-t border-[#E5E7EB] pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-[#122618]">Total</span>
                <span className="text-[#1A4D2E]">₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout button */}
      <div className="fixed bottom-24 left-0 right-0 p-4 z-40 max-w-lg mx-auto">
        <Button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-[#1A4D2E] text-white font-bold text-base shadow-xl btn-press"
          data-testid="checkout-btn"
        >
          {loading ? 'Placing Order...' : `Place Order • ₹${total}`}
        </Button>
      </div>

      {/* Batching Modal */}
      <AnimatePresence>
        {showBatchModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={() => setShowBatchModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8"
              data-testid="batching-modal"
            >
              {/* Close button */}
              <button
                onClick={() => setShowBatchModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F9F9F7] flex items-center justify-center"
                data-testid="close-modal-btn"
              >
                <X className="w-4 h-4 text-[#5C6B5F]" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#122618] font-['Syne']">Choose Your Delivery</h2>
                <p className="text-[#5C6B5F] mt-1">Make an impact with your choice</p>
              </div>

              {/* Options */}
              <div className="space-y-4">
                {/* Eco-Batch Option */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOption('batch')}
                  className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all ${selectedOption === 'batch'
                    ? 'border-[#C1F03C] bg-[#C1F03C]/10'
                    : 'border-[#E5E7EB] bg-white'
                    }`}
                  data-testid="batch-option"
                >
                  {selectedOption === 'batch' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#C1F03C] flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-[#1A4D2E]"
                      >
                        ✓
                      </motion.div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#C1F03C] flex items-center justify-center">
                      <Leaf className="w-7 h-7 text-[#1A4D2E]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#122618] text-lg">Eco-Batch</span>
                        <span className="px-2 py-0.5 bg-[#C1F03C] text-[#1A4D2E] text-xs font-bold rounded-full">RECOMMENDED</span>
                      </div>
                      <p className="text-[#5C6B5F] text-sm mt-1">
                        Wait up to 5 min for batch
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-[#1A4D2E]">
                          <span className="font-bold text-lg">₹{20}</span>
                          <span className="text-xs">delivery</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#1A4D2E] bg-[#1A4D2E]/10 px-2 py-1 rounded-lg">
                          <Leaf className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            Save ~142g CO₂ per batch
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Rush Option */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOption('rush')}
                  className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all ${selectedOption === 'rush'
                    ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                    : 'border-[#E5E7EB] bg-white'
                    }`}
                  data-testid="rush-option"
                >
                  {selectedOption === 'rush' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF6B35] flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-3 h-3 text-white"
                      >
                        ✓
                      </motion.div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FF6B35]/20 flex items-center justify-center">
                      <Zap className="w-7 h-7 text-[#FF6B35]" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-[#122618] text-lg">Rush Delivery</span>
                      <p className="text-[#5C6B5F] text-sm mt-1">
                        Get it as fast as possible
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1 text-[#FF6B35]">
                          <span className="font-bold text-lg">₹{40}</span>
                          <span className="text-xs">delivery</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#5C6B5F] bg-[#F9F9F7] px-2 py-1 rounded-lg">
                          <span className="text-xs">285g CO₂ emission</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Confirm button */}
              <Button
                onClick={() => placeOrder(selectedOption === 'batch')}
                disabled={loading}
                className={`w-full h-14 rounded-2xl font-bold text-base mt-6 btn-press ${selectedOption === 'batch'
                  ? 'bg-[#C1F03C] text-[#1A4D2E] hover:bg-[#B2E030] shadow-[0_4px_14px_rgba(193,240,60,0.4)]'
                  : 'bg-[#1A4D2E] text-white hover:bg-[#143D24]'
                  }`}
                data-testid="confirm-order-btn"
              >
                {loading ? (
                  'Placing Order...'
                ) : selectedOption === 'batch' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Leaf className="w-5 h-5" />
                    Confirm Eco-Batch • ₹{subtotal + 20}
                  </span>
                ) : (
                  `Confirm Rush • ₹${subtotal + 40}`
                )}
              </Button>

              {selectedOption === 'batch' && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-[#1A4D2E] text-sm mt-4 font-medium"
                >
                  You're making a difference! 🌱
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
};

export default Cart;
