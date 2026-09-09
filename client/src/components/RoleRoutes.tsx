import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex-center">Loading...</div>;
  return user?.isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export function DeliveryRoute() {
  const { partner, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex-center">Loading...</div>;
  return partner ? <Outlet /> : <Navigate to="/delivery/login" replace />;
}

export function SellerRoute() {
  const { seller, user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex-center">Loading...</div>;
  return seller && user ? <Outlet /> : <Navigate to="/seller/login" replace />;
}

