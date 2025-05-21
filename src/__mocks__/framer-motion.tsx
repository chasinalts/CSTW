// Mock for framer-motion
import React from 'react';
import { vi } from 'vitest';

// Mock AnimatePresence component
export const AnimatePresence = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Mock motion components
export const motion = new Proxy(
  {},
  {
    get: (_, prop) => {
      return ({ children, ...props }: { children?: React.ReactNode } & Record<string, any>) => {
        const Component = prop as keyof JSX.IntrinsicElements;
        return <Component {...props}>{children}</Component>;
      };
    },
  }
);

// Mock useAnimation hook
export const useAnimation = () => {
  return {
    start: vi.fn(),
    stop: vi.fn(),
    set: vi.fn(),
  };
};

// Mock useMotionValue hook
export const useMotionValue = (initial: any) => {
  return {
    get: () => initial,
    set: vi.fn(),
    onChange: vi.fn(),
  };
};

// Mock useTransform hook
export const useTransform = () => {
  return {
    get: vi.fn(),
    set: vi.fn(),
  };
};

// Mock useInView hook
export const useInView = () => {
  return [true, { ref: { current: null } }];
};

// Mock useScroll hook
export const useScroll = () => {
  return {
    scrollX: { get: () => 0, onChange: vi.fn() },
    scrollY: { get: () => 0, onChange: vi.fn() },
  };
};

// Mock variants
export const Variants = {};

// Mock transition presets
export const transition = {
  spring: {},
  tween: {},
};

// Mock prefersReducedMotion
export const usePrefersReducedMotion = () => false;

// Export default
export default {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  useInView,
  useScroll,
  Variants,
  transition,
  usePrefersReducedMotion,
};
