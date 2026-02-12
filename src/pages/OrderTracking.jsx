import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Leaf, Phone, CheckCircle2, Zap, Users, Timer, Plus, Share2, Copy, MessageCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const restaurantIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #1A4D2E; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const deliveryIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #C1F03C; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A4D2E" stroke-width="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const riderIcon = new L.DivIcon({
  className: 'custom-marker rider-pulse',
  html: `<div style="background: #FF6B35; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 12px rgba(255,107,53,0.5); animation: pulse 2s infinite;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <circle cx="18.5" cy="17.5" r="3.5"/>
      <circle cx="5.5" cy="17.5" r="3.5"/>
      <circle cx="15" cy="5" r="1"/>
      <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const batchIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: #2A6E45; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z"/>
    </svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// Map auto-fit component
const MapController = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);

  return null;
};

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: CheckCircle2 },
  { key: 'preparing', label: 'Being Prepared', icon: Clock },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rushLoading, setRushLoading] = useState(false);
  const [extendLoading, setExtendLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchTracking = useCallback(async () => {
    try {
      const response = await api.get(`/orders/${id}/tracking`);
      setTracking(response.data);
    } catch (error) {
      console.error('Failed to fetch tracking:', error);
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => {
    fetchTracking();
    // Poll for updates every 3 seconds
    intervalRef.current = setInterval(fetchTracking, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchTracking]);

  const handleRush = async () => {
    setRushLoading(true);
    try {
      await api.post(`/orders/${id}/rush`);
      toast.success('Switched to rush delivery!');
      fetchTracking();
    } catch (error) {
      toast.error('Failed to switch to rush');
    } finally {
      setRushLoading(false);
    }
  };

  const handleExtend = async () => {
    setExtendLoading(true);
    try {
      await api.post(`/orders/${id}/extend-batch`);
      toast.success('Batch window extended by 3 minutes!');
      fetchTracking();
    } catch (error) {
      toast.error('Failed to extend batch');
    } finally {
      setExtendLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!tracking) return 0;
    return statusSteps.findIndex(step => step.key === tracking.status);
  };

  const getRouteCoordinates = () => {
    if (!tracking) return [];

    const coords = [[tracking.restaurant.lat, tracking.restaurant.lng]];

    if (tracking.batched_deliveries?.length > 0) {
      tracking.batched_deliveries.forEach(d => {
        if (d.id !== id) {
          coords.push([d.lat, d.lng]);
        }
      });
    }

    coords.push([tracking.delivery.lat, tracking.delivery.lng]);
    return coords;
  };

  const getMapBounds = () => {
    if (!tracking) return null;

    const points = [
      [tracking.restaurant.lat, tracking.restaurant.lng],
      [tracking.delivery.lat, tracking.delivery.lng],
    ];

    if (tracking.rider) {
      points.push([tracking.rider.lat, tracking.rider.lng]);
    }

    if (tracking.batched_deliveries?.length > 0) {
      tracking.batched_deliveries.forEach(d => {
        points.push([d.lat, d.lng]);
      });
    }

    return L.latLngBounds(points);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7]">
        <div className="h-[50vh] shimmer" />
        <div className="p-4 space-y-4">
          <div className="h-8 w-3/4 shimmer rounded" />
          <div className="h-24 shimmer rounded-xl" />
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#5C6B5F]">Order not found</p>
          <Button
            onClick={() => navigate('/')}
            className="mt-4 bg-[#1A4D2E] text-white rounded-full"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // ============ BATCH WAITING SCREEN ============
  if (tracking.status === 'waiting_for_batch' && tracking.batch_info) {
    const { batch_info } = tracking;
    const timeRemaining = batch_info.time_remaining_seconds;
    const progress = 1 - (timeRemaining / 300); // 300 = 5 min

    return (
      <div className="min-h-screen bg-[#F9F9F7] pb-24">
        {/* Header */}
        <div className="bg-[#1A4D2E] px-4 pt-12 pb-8 rounded-b-[32px]">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white font-['Syne']">
              Eco-Batch in Progress
            </h1>
          </div>

          {/* Timer Circle */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative w-36 h-36">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
                <circle
                  cx="50" cy="50" r="44"
                  fill="none"
                  stroke="#C1F03C"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 276.46} ${276.46}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Timer className="w-5 h-5 text-[#C1F03C] mb-1" />
                <span className="text-3xl font-bold text-white font-['Syne'] tabular-nums">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-white/60 text-xs">remaining</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="px-4 py-6 space-y-4">
          {/* Batch Status Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C1F03C] flex items-center justify-center">
                <Users className="w-6 h-6 text-[#1A4D2E]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#122618] text-lg">
                  {batch_info.batch_size} order{batch_info.batch_size > 1 ? 's' : ''} batched
                </h3>
                <p className="text-[#5C6B5F] text-sm">
                  Waiting for more orders nearby...
                </p>
              </div>
            </div>

            {/* Batch members */}
            <div className="space-y-2">
              {batch_info.members?.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 bg-[#F9F9F7] rounded-xl p-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1A4D2E] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">#{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#122618]">
                      {member.id === id ? 'Your Order' : `Nearby Order`}
                    </p>
                    <p className="text-xs text-[#8FA392]">{member.delivery_address}</p>
                  </div>
                  {member.id === id && (
                    <span className="text-[10px] bg-[#C1F03C] text-[#1A4D2E] px-2 py-0.5 rounded-full font-bold">YOU</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CO2 Savings Growing */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-[#1A4D2E] to-[#2A6E45] rounded-2xl p-5 text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#C1F03C] flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#1A4D2E]" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Estimated CO₂ Savings</p>
                <motion.p
                  key={batch_info.estimated_co2_saved}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="font-bold text-2xl font-['Syne']"
                >
                  {batch_info.estimated_co2_saved?.toFixed(0)}g
                </motion.p>
              </div>
            </div>
            <p className="text-white/60 text-xs mt-3">
              💡 The more orders batched, the higher the savings!
            </p>
          </motion.div>

          {/* Restaurant info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 border border-[#E5E7EB]"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F9F9F7] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#1A4D2E]" />
              </div>
              <div>
                <p className="font-medium text-[#122618]">Pickup: {tracking.restaurant.name}</p>
                <p className="text-[#5C6B5F] text-sm">Drop: {tracking.delivery.address}</p>
              </div>
            </div>
          </motion.div>

          {/* Invite Friends to Batch */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C1F03C] to-[#1A4D2E] flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#122618]">Invite Friends to Batch!</p>
                  <p className="text-xs text-[#8FA392]">More people = more savings for everyone</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const msg = `🌿 I just ordered from ${tracking.restaurant.name} on EcoRoute! Join my eco-batch to save CO₂ and split delivery costs. Order now before the timer runs out! 🚀`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="flex-1 h-11 rounded-xl bg-[#25D366] text-white text-sm font-semibold flex items-center justify-center gap-1.5 btn-press"
                  data-testid="share-whatsapp"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button
                  onClick={() => {
                    const msg = `🌿 Join my eco-batch from ${tracking.restaurant.name} on EcoRoute! Save CO₂ together!`;
                    if (navigator.share) {
                      navigator.share({ title: 'EcoRoute Batch', text: msg });
                    } else {
                      navigator.clipboard.writeText(msg);
                      toast.success('Invite copied to clipboard!');
                    }
                  }}
                  className="flex-1 h-11 rounded-xl bg-[#F0F2F0] text-[#1A4D2E] text-sm font-semibold flex items-center justify-center gap-1.5 btn-press"
                  data-testid="share-copy"
                >
                  <Copy className="w-4 h-4" />
                  Copy Invite
                </button>
              </div>
            </div>
            <div className="bg-[#F9F9F7] px-4 py-2.5 flex items-center gap-2">
              <div className="flex -space-x-2">
                {['🧑', '👩', '🧑‍🦱'].map((emoji, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-[#C1F03C] flex items-center justify-center text-xs border-2 border-white">
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#5C6B5F]">
                <span className="font-semibold text-[#1A4D2E]">12 people</span> shared batches this hour on campus
              </p>
            </div>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-3"
          >
            <Button
              onClick={handleExtend}
              disabled={extendLoading}
              className="flex-1 h-12 rounded-xl bg-white border-2 border-[#1A4D2E] text-[#1A4D2E] font-semibold btn-press"
              data-testid="extend-btn"
            >
              <Plus className="w-4 h-4 mr-1" />
              {extendLoading ? 'Extending...' : 'Wait 3 min More'}
            </Button>
            <Button
              onClick={handleRush}
              disabled={rushLoading}
              className="flex-1 h-12 rounded-xl bg-[#FF6B35] text-white font-semibold btn-press hover:bg-[#E85A2A]"
              data-testid="rush-btn"
            >
              <Zap className="w-4 h-4 mr-1" />
              {rushLoading ? 'Switching...' : 'Rush Now'}
            </Button>
          </motion.div>

          <p className="text-center text-xs text-[#8FA392]">
            Batch will auto-dispatch when timer ends
          </p>
        </div>

        <BottomNav />
      </div>
    );
  }

  // ============ NORMAL TRACKING (dispatched) ============
  const currentStep = getCurrentStepIndex();
  const routeCoords = getRouteCoordinates();
  const mapBounds = getMapBounds();

  return (
    <div className="min-h-screen bg-[#F9F9F7] pb-24">
      {/* Map */}
      <div className="relative h-[50vh]">
        <MapContainer
          center={[tracking.rider?.lat || tracking.restaurant.lat, tracking.rider?.lng || tracking.restaurant.lng]}
          zoom={15}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <MapController bounds={mapBounds} />

          {/* Route line */}
          <Polyline
            positions={routeCoords}
            color="#1A4D2E"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />

          {/* Restaurant marker */}
          <Marker position={[tracking.restaurant.lat, tracking.restaurant.lng]} icon={restaurantIcon}>
            <Popup>{tracking.restaurant.name}</Popup>
          </Marker>

          {/* Batched delivery markers */}
          {tracking.batched_deliveries?.map((delivery, index) => (
            delivery.id !== id && (
              <Marker
                key={delivery.id}
                position={[delivery.lat, delivery.lng]}
                icon={batchIcon}
              >
                <Popup>Batched Order #{index + 1}</Popup>
              </Marker>
            )
          ))}

          {/* User's delivery marker */}
          <Marker position={[tracking.delivery.lat, tracking.delivery.lng]} icon={deliveryIcon}>
            <Popup>Your Delivery</Popup>
          </Marker>

          {/* Rider marker */}
          {tracking.rider && (
            <Marker position={[tracking.rider.lat, tracking.rider.lng]} icon={riderIcon}>
              <Popup>Your Rider</Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 z-[1000] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg btn-press"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5 text-[#122618]" />
        </button>

        {/* Batched indicator */}
        {tracking.is_batched && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-4 right-4 z-[1000] glass rounded-full px-4 py-2 flex items-center gap-2"
          >
            <Leaf className="w-4 h-4 text-[#1A4D2E]" />
            <span className="text-sm font-medium text-[#1A4D2E]">
              Eco-Batched ({tracking.batched_deliveries?.length || 1} orders)
            </span>
          </motion.div>
        )}
      </div>

      {/* Tracking info */}
      <div className="px-4 py-6 space-y-6 -mt-8 relative z-10">
        {/* Status card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-5 shadow-lg border border-[#E5E7EB]"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-xl text-[#122618] font-['Syne']">
                {statusSteps[currentStep]?.label || 'Processing'}
              </h2>
              <p className="text-[#5C6B5F] text-sm">
                From {tracking.restaurant.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[#1A4D2E] font-bold">
                {Math.max(0, Math.round((1 - tracking.progress) * (tracking.is_batched ? 40 : 30)))} min
              </p>
              <p className="text-xs text-[#5C6B5F]">estimated</p>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className="relative">
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`absolute top-1/2 left-full w-full h-0.5 -translate-y-1/2 ${index < currentStep ? 'bg-[#C1F03C]' : 'bg-[#E5E7EB]'
                          }`}
                        style={{ width: 'calc(100% + 20px)' }}
                      />
                    )}

                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${isCompleted
                        ? 'bg-[#C1F03C]'
                        : 'bg-[#F0F2F0]'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isCompleted ? 'text-[#1A4D2E]' : 'text-[#8FA392]'}`} />
                    </motion.div>
                  </div>
                  <span className={`text-xs mt-2 text-center ${isCompleted ? 'text-[#1A4D2E] font-medium' : 'text-[#8FA392]'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Delivery address */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 border border-[#E5E7EB]"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C1F03C] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[#1A4D2E]" />
            </div>
            <div>
              <p className="font-medium text-[#122618]">Delivering to</p>
              <p className="text-[#5C6B5F] text-sm">{tracking.delivery.address}</p>
            </div>
          </div>
        </motion.div>

        {/* Carbon savings (if batched and has savings) */}
        {tracking.is_batched && tracking.co2_saved > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-[#1A4D2E] to-[#2A6E45] rounded-2xl p-5 text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#C1F03C] flex items-center justify-center">
                <Leaf className="w-6 h-6 text-[#1A4D2E]" />
              </div>
              <div>
                <p className="font-bold text-lg">You're saving the planet!</p>
                <p className="text-white/80 text-sm">
                  This batched delivery saves ~{tracking.co2_saved?.toFixed(0)}g CO₂
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Contact rider */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            className="w-full h-14 rounded-2xl bg-white border border-[#E5E7EB] text-[#122618] font-semibold btn-press"
            data-testid="contact-rider-btn"
          >
            <Phone className="w-5 h-5 mr-2" />
            Contact Rider
          </Button>
        </motion.div>
      </div>

      <BottomNav />

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4); }
          50% { box-shadow: 0 0 0 15px rgba(255, 107, 53, 0); }
        }
        .rider-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;
