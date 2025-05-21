import { forwardRef, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'color'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const disabledStyles = 'opacity-60 cursor-not-allowed pointer-events-none';

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled || isLoading ? disabledStyles : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner
              size="sm"
              color={variant === 'secondary' || variant === 'ghost' ? 'gray' : 'white'}
            />
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Icon-only button variant
export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3'
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={sizes[size]}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Button group for connected buttons
interface ButtonGroupProps {
  children: ReactNode;
  attached?: boolean;
  vertical?: boolean;
}

export const ButtonGroup = ({
  children,
  attached = false,
  vertical = false,
}: ButtonGroupProps) => {
  return (
    <div
      className={`
        inline-flex
        ${vertical ? 'flex-col' : ''}
        ${attached ? vertical ? '-space-y-px' : '-space-x-px' : vertical ? 'space-y-2' : 'space-x-2'}
      `}
    >
      {children}
    </div>
  );
};

export default Button;