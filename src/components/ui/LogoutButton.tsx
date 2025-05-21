// Logout button component that handles user logout
import { useAuth } from '../../contexts/AuthContext';

interface LogoutButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

const LogoutButton = ({
  className = '',
  variant = 'primary',
  size = 'md'
}: LogoutButtonProps) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Base styles
  let baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  // Variant styles
  const variantStyles = {
    primary: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-800 text-white hover:bg-gray-700',
    text: 'text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent'
  };

  const buttonClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  return (
    <button
      onClick={handleLogout}
      className={buttonClasses}
      aria-label="Logout"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
