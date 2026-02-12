import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Leaf, MapPin, CreditCard, Clock, ChevronRight, LogOut,
    Settings, Shield, Bell, HelpCircle, Star, Package
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import BottomNav from '../components/BottomNav';

const Profile = () => {
    const navigate = useNavigate();
    const { user, api, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [freshUser, setFreshUser] = useState(null);

    const fetchOrders = useCallback(async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }, [api]);

    const fetchFreshUser = useCallback(async () => {
        try {
            const response = await api.get('/auth/me');
            setFreshUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    }, [api]);

    useEffect(() => {
        fetchOrders();
        fetchFreshUser();
    }, [fetchOrders, fetchFreshUser]);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const savedAddresses = [
        { label: 'Hostel 3', address: 'Hostel 3, IIT Delhi, New Delhi', isDefault: true },
        { label: 'Library', address: 'Central Library, IIT Delhi', isDefault: false },
    ];

    const menuItems = [
        { icon: Package, label: 'Order History', count: orders.length, action: 'orders' },
        { icon: MapPin, label: 'Saved Addresses', count: savedAddresses.length, action: 'addresses' },
        { icon: CreditCard, label: 'Payment Methods', count: 2, action: 'payments' },
        { icon: Bell, label: 'Notifications', action: 'notifications' },
        { icon: Shield, label: 'Privacy & Security', action: 'privacy' },
        { icon: HelpCircle, label: 'Help & Support', action: 'help' },
        { icon: Settings, label: 'Settings', action: 'settings' },
    ];

    const [expandedSection, setExpandedSection] = useState(null);

    const getStatusColor = (status) => {
        const colors = {
            waiting_for_batch: 'bg-amber-100 text-amber-700',
            pending: 'bg-yellow-100 text-yellow-700',
            preparing: 'bg-blue-100 text-blue-700',
            out_for_delivery: 'bg-purple-100 text-purple-700',
            delivered: 'bg-green-100 text-green-700',
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status) => {
        const labels = {
            waiting_for_batch: 'Batching',
            pending: 'Pending',
            preparing: 'Preparing',
            out_for_delivery: 'On the way',
            delivered: 'Delivered',
        };
        return labels[status] || status;
    };

    return (
        <div className="min-h-screen bg-[#F9F9F7] pb-24">
            {/* Header */}
            <div className="bg-[#1A4D2E] px-4 pt-12 pb-8 rounded-b-[32px]">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-4"
                >
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-2xl bg-[#C1F03C] flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-[#1A4D2E] font-['Syne']">
                            {user?.name?.charAt(0) || 'U'}
                        </span>
                    </div>

                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white font-['Syne']">
                            {user?.name || 'User'}
                        </h1>
                        <p className="text-white/70 text-sm">{user?.email || 'user@email.com'}</p>
                    </div>
                </motion.div>

                {/* Quick stats */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 mt-5"
                >
                    <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-white font-bold text-lg font-['Syne']">
                            {(freshUser || user)?.total_orders || 0}
                        </p>
                        <p className="text-white/60 text-xs">Orders</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-white font-bold text-lg font-['Syne']">
                            {(((freshUser || user)?.total_co2_saved || 0) / 1000).toFixed(1)}kg
                        </p>
                        <p className="text-white/60 text-xs">CO₂ Saved</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-[#C1F03C] fill-current" />
                            <p className="text-white font-bold text-lg font-['Syne']">
                                #{(freshUser || user)?.eco_rank || '-'}
                            </p>
                        </div>
                        <p className="text-white/60 text-xs">Rank</p>
                    </div>
                </motion.div>
            </div>

            {/* Menu items */}
            <div className="px-4 py-6 space-y-3">
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isExpanded = expandedSection === item.action;

                    return (
                        <motion.div
                            key={item.action}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.05 * index }}
                        >
                            <button
                                onClick={() => {
                                    if (item.action === 'orders') {
                                        setExpandedSection(isExpanded ? null : 'orders');
                                    }
                                }}
                                className="w-full bg-white rounded-xl p-4 border border-[#E5E7EB] flex items-center gap-4 hover:shadow-sm transition-all btn-press"
                                data-testid={`profile-${item.action}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#F9F9F7] flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-[#1A4D2E]" />
                                </div>
                                <div className="flex-1 text-left">
                                    <span className="font-medium text-[#122618]">{item.label}</span>
                                </div>
                                {item.count !== undefined && (
                                    <span className="text-sm text-[#8FA392] font-medium">{item.count}</span>
                                )}
                                <ChevronRight
                                    className={`w-5 h-5 text-[#8FA392] transition-transform ${isExpanded ? 'rotate-90' : ''
                                        }`}
                                />
                            </button>

                            {/* Order history expanded */}
                            {isExpanded && item.action === 'orders' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    className="overflow-hidden mt-2 space-y-2"
                                >
                                    {loading ? (
                                        <div className="space-y-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="h-16 shimmer rounded-xl" />
                                            ))}
                                        </div>
                                    ) : orders.length === 0 ? (
                                        <div className="text-center py-6 bg-white rounded-xl border border-[#E5E7EB]">
                                            <p className="text-[#8FA392] text-sm">No orders yet</p>
                                        </div>
                                    ) : (
                                        orders.slice(0, 5).map((order) => (
                                            <motion.button
                                                key={order.id}
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                onClick={() => navigate(`/order/${order.id}`)}
                                                className="w-full bg-white rounded-xl p-4 border border-[#E5E7EB] flex items-center gap-3 text-left hover:shadow-sm transition-all"
                                                data-testid={`order-${order.id}`}
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-[#122618] text-sm">
                                                        {order.restaurant_name}
                                                    </p>
                                                    <p className="text-xs text-[#8FA392] mt-0.5">
                                                        {order.items?.length || 0} items • ₹{order.total_amount + order.delivery_fee}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                                                        {getStatusLabel(order.status)}
                                                    </span>
                                                    {order.is_batched && (
                                                        <div className="flex items-center gap-1 mt-1 justify-end">
                                                            <Leaf className="w-3 h-3 text-[#C1F03C]" />
                                                            <span className="text-xs text-[#1A4D2E]">Batched</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}

                {/* Saved addresses section */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6"
                >
                    <h3 className="text-sm font-semibold text-[#8FA392] uppercase tracking-wider mb-3 px-1">
                        Quick Addresses
                    </h3>
                    <div className="space-y-2">
                        {savedAddresses.map((addr, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 border border-[#E5E7EB] flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#C1F03C]/20 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-[#1A4D2E]" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-[#122618] text-sm">{addr.label}</span>
                                        {addr.isDefault && (
                                            <span className="text-[10px] bg-[#C1F03C] text-[#1A4D2E] px-2 py-0.5 rounded-full font-bold">
                                                DEFAULT
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#8FA392] mt-0.5">{addr.address}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Eco impact card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-[#1A4D2E] to-[#2A6E45] rounded-2xl p-5 mt-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#C1F03C] flex items-center justify-center">
                            <Leaf className="w-7 h-7 text-[#1A4D2E]" />
                        </div>
                        <div className="flex-1 text-white">
                            <p className="font-bold text-lg">Your Eco Journey</p>
                            <p className="text-white/70 text-sm mt-0.5">
                                You've saved {(((freshUser || user)?.total_co2_saved || 0) / 1000).toFixed(1)}kg CO₂ with {(freshUser || user)?.total_orders || 0} orders
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full mt-4 h-11 rounded-xl bg-[#C1F03C] text-[#1A4D2E] font-bold hover:bg-[#B2E030] btn-press"
                        data-testid="view-impact-btn"
                    >
                        View Full Impact →
                    </Button>
                </motion.div>

                {/* Logout */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="pt-4"
                >
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full h-12 rounded-xl border-red-200 text-red-500 hover:bg-red-50 font-medium"
                        data-testid="logout-btn"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Log Out
                    </Button>
                </motion.div>

                {/* App version */}
                <p className="text-center text-xs text-[#8FA392] mt-4 pb-4">
                    EcoRoute v1.0.0 • AMD Slingshot 2026
                </p>
            </div>

            <BottomNav />
        </div>
    );
};

export default Profile;
