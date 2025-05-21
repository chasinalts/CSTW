import React from 'react';
import { motion } from 'framer-motion';

interface HolographicTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'label';
  variant?: 'title' | 'subtitle' | 'text';
  className?: string;
  animated?: boolean;
  htmlFor?: string; // For label elements
}

const HolographicText: React.FC<HolographicTextProps> = ({
  text,
  as = 'div',
  variant = 'text',
  className = '',
  animated = true,
  htmlFor,
  ...props
}) => {
  // Determine the CSS classes based on the variant
  const variantClasses = {
    title: 'holographic-title',
    subtitle: 'holographic-subtitle',
    text: ''
  };

  // Animation variants
  const animationVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  };

  // Create the component based on the 'as' prop
  const Component = as;

  return animated ? (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animationVariants}
      transition={{ duration: 0.5 }}
      className="inline-block"
    >
      <Component
        className={`holographic-text ${variantClasses[variant]} ${className}`}
        data-text={text}
        htmlFor={htmlFor}
        {...props}
      >
        {text}
      </Component>
    </motion.div>
  ) : (
    <Component
      className={`holographic-text ${variantClasses[variant]} ${className}`}
      data-text={text}
      htmlFor={htmlFor}
      {...props}
    >
      {text}
    </Component>
  );
};

export default HolographicText;
