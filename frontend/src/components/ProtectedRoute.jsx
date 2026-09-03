import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, isDemo } = useAuth();
  return user || isDemo ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
