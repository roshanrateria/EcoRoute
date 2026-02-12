import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';

import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Restaurant from './pages/Restaurant';
import Cart from './pages/Cart';
import OrderTracking from './pages/OrderTracking';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

import './App.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1A4D2E] flex items-center justify-center animate-pulse">
            <svg className="w-7 h-7 text-[#C1F03C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 22c1.25-1.25 2-3 2-5V7c0-1.1.9-2 2-2h3c.9 0 1.7.5 2 1.2l.3.8H17c1.1 0 2 .9 2 2v2" />
              <path d="M7 8h.01M12 8h.01" />
              <path d="M17 21l-3-3h-1a2 2 0 01-2-2v-3a2 2 0 012-2h6a2 2 0 012 2v3a2 2 0 01-2 2h-1l-1 1z" />
            </svg>
          </div>
          <p className="text-[#8FA392] text-sm font-medium">Loading EcoRoute...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const onboarded = localStorage.getItem('ecoroute_onboarded');
    return <Navigate to={onboarded ? '/login' : '/onboarding'} replace />;
  }

  return children;
};

// Public route - redirect to home if authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Check onboarding
const OnboardingCheck = () => {
  const onboarded = localStorage.getItem('ecoroute_onboarded');
  if (onboarded) {
    return <Navigate to="/login" replace />;
  }
  return <Onboarding />;
};

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route path="/onboarding" element={<OnboardingCheck />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant/:id"
          element={
            <ProtectedRoute>
              <Restaurant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:id"
          element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={localStorage.getItem('ecoroute_onboarded') ? '/login' : '/onboarding'}
              replace
            />
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="App max-w-lg mx-auto relative min-h-screen bg-[#F9F9F7]">
            <AppRoutes />
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: "'Manrope', sans-serif",
                borderRadius: '16px',
                fontSize: '14px',
              },
              className: 'sonner-toast',
            }}
            richColors
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
