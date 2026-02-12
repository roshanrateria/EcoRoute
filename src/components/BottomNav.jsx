import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ShoppingBag, BarChart3, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/cart', icon: ShoppingBag, label: 'Cart' },
    { path: '/dashboard', icon: BarChart3, label: 'Impact' },
    { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { getItemCount } = useCart();
    const cartCount = getItemCount();

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div
                className="mx-2 mb-2 rounded-2xl border border-white/40"
                style={{
                    background: 'rgba(255, 255, 255, 0.80)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: '0 -2px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)',
                }}
            >
                <nav className="flex items-center justify-around h-16 px-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const isCart = item.path === '/cart';

                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className="relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all active:scale-90"
                                data-testid={`nav-${item.label.toLowerCase()}`}
                            >
                                {/* Active pill background */}
                                {active && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0.5 bg-[#1A4D2E] rounded-xl"
                                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                    />
                                )}

                                {/* Icon */}
                                <div className="relative z-10">
                                    <Icon
                                        className={`w-[20px] h-[20px] transition-colors duration-200 ${active ? 'text-[#C1F03C]' : 'text-[#6B7C6E]'
                                            }`}
                                        strokeWidth={active ? 2.5 : 1.8}
                                    />

                                    {/* Cart badge */}
                                    {isCart && cartCount > 0 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] rounded-full bg-[#C1F03C] flex items-center justify-center"
                                        >
                                            <span className="text-[9px] font-bold text-[#1A4D2E] leading-none px-0.5">
                                                {cartCount > 9 ? '9+' : cartCount}
                                            </span>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`text-[10px] mt-0.5 font-semibold relative z-10 leading-tight transition-colors duration-200 ${active ? 'text-white' : 'text-[#8FA392]'
                                        }`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default BottomNav;
