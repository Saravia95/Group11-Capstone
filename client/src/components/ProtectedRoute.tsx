import { Navigate, Outlet } from 'react-router';
import { Role, useAuthStore } from '../stores/authStore';

const ProtectedRoute = () => {
  const { user } = useAuthStore();

  return user?.role === Role.Admin ? <Outlet /> : <Navigate to="/owner-login" replace />;
};

export default ProtectedRoute;
