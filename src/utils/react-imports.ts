import React from 'react';

// Re-export hooks from React
export const {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
  createContext
} = React;

// Define event types using React's namespace
export interface ChangeEvent<T = Element> extends React.SyntheticEvent<T> {
  target: EventTarget & T;
}

export interface FormEvent<T = Element> extends React.SyntheticEvent<T> {
  target: EventTarget & T;
}

export interface MouseEvent<T = Element> extends React.SyntheticEvent<T> {
  target: EventTarget & T;
}

export interface KeyboardEvent<T = Element> extends React.SyntheticEvent<T> {
  target: EventTarget & T;
}

// Export other common types
export type ReactNode = React.ReactNode;
export type FC<P = {}> = React.FC<P>;
export type ComponentType<P = {}> = React.ComponentType<P>;
export type Context<T> = React.Context<T>;
