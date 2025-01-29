import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '../stores/authStore';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <Outlet /> : <Navigate to="/owner-login" replace />;
};

export default ProtectedRoute;
