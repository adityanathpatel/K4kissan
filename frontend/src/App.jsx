import React, { useState } from 'react';
import './i18n/config';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerSection from './pages/FarmerSection';
import BuyerDashboard from './pages/BuyerDashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import FarmerOrders from './pages/FarmerOrders';
import TransporterDashboard from './pages/TransporterDashboard';
import Analytics from './pages/Analytics';

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import OfflineBanner from './components/OfflineBanner';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';

function App() {
  const isOnline = useOnlineStatus();
  const [splashDone, setSplashDone] = useState(false);

  return (
    <ErrorBoundary>
      {/* ── Splash Video: plays first on initial website open, fades out in the last 1 second ── */}
      {!splashDone && (
        <SplashScreen onDone={() => setSplashDone(true)} />
      )}

      {/* ── Main App: visible underneath splash; interactive once splash completes ── */}
      <div
        style={{
          opacity: 1,
          // Pointer events are blocked during splash so user doesn't interact until ready
          pointerEvents: splashDone ? 'auto' : 'none',
        }}
      >
        <BrowserRouter>
          <OfflineBanner isOnline={isOnline} />
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Landing />} />
                  <Route path="login" element={<Auth />} />
                  <Route path="signup" element={<Auth />} />
                  <Route path="farmer" element={<ProtectedRoute roles={['Farmer']}><FarmerSection /></ProtectedRoute>} />
                  <Route path="farmer-dashboard" element={<ProtectedRoute roles={['Farmer']}><FarmerDashboard /></ProtectedRoute>} />
                  <Route path="products" element={<ProtectedRoute roles={['Buyer']}><BuyerDashboard /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="chat/:conversationId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="farmer-orders" element={<ProtectedRoute><FarmerOrders /></ProtectedRoute>} />
                  <Route path="map" element={<ProtectedRoute roles={['Transporter']}><TransporterDashboard /></ProtectedRoute>} />
                  <Route path="analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                </Route>
              </Routes>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </ErrorBoundary>
  );
}

export default App;
