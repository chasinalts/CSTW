import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const RoleBasedRedirect = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.is_owner || currentUser.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/home" replace />;
};

export default RoleBasedRedirect;
