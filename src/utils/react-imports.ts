// React imports helper
import React from 'react';

// Re-export React
export default React;

// Re-export React hooks and components
export const useState = React.useState;
export const useEffect = React.useEffect;
export const useRef = React.useRef;
export const useCallback = React.useCallback;
export const useMemo = React.useMemo;
export const useContext = React.useContext;
export const useReducer = React.useReducer;
export const createContext = React.createContext;
export const forwardRef = React.forwardRef;
export const Fragment = React.Fragment;
export const Component = React.Component;

// Re-export React types
export type ReactNode = React.ReactNode;
export type RefObject<T> = React.RefObject<T>;
export type ChangeEvent<T> = React.ChangeEvent<T>;
export type FormEvent<T> = React.FormEvent<T>;
export type ErrorInfo = React.ErrorInfo;
export type InputHTMLAttributes<T> = React.InputHTMLAttributes<T>;
export type SelectHTMLAttributes<T> = React.SelectHTMLAttributes<T>;
export type DragEvent<T> = React.DragEvent<T>;
export type JSX = React.JSX;
