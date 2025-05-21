/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Removed Supabase references
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_AUDIENCE: string;
  readonly VITE_TURSO_DATABASE_URL: string;
  readonly VITE_TURSO_AUTH_TOKEN: string;
  readonly VITE_APP_TITLE: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// This file ensures TypeScript recognizes various module types

// React module declaration
declare module 'react' {
  // Import all React types
  import React from 'react';

  // Re-export everything
  export = React;
  export as namespace React;

  // Explicitly declare common React exports to ensure they're recognized
  export const useState: typeof React.useState;
  export const useEffect: typeof React.useEffect;
  export const useContext: typeof React.useContext;
  export const useReducer: typeof React.useReducer;
  export const useCallback: typeof React.useCallback;
  export const useMemo: typeof React.useMemo;
  export const useRef: typeof React.useRef;
  export const useImperativeHandle: typeof React.useImperativeHandle;
  export const useLayoutEffect: typeof React.useLayoutEffect;
  export const useDebugValue: typeof React.useDebugValue;
  export const lazy: typeof React.lazy;
  export const Suspense: typeof React.Suspense;
  export const memo: typeof React.memo;
  export const forwardRef: typeof React.forwardRef;
  export const createContext: typeof React.createContext;
  export const Component: typeof React.Component;
  export const PureComponent: typeof React.PureComponent;
  export const Fragment: typeof React.Fragment;
  export const StrictMode: typeof React.StrictMode;
  export const createElement: typeof React.createElement;
  export const cloneElement: typeof React.cloneElement;
  export const createRef: typeof React.createRef;
  export const Children: typeof React.Children;
}

// React DOM module declaration
declare module 'react-dom' {
  import ReactDOM from 'react-dom';
  export = ReactDOM;
  export as namespace ReactDOM;

  export const render: typeof ReactDOM.render;
  export const hydrate: typeof ReactDOM.hydrate;
  export const createPortal: typeof ReactDOM.createPortal;
  export const findDOMNode: typeof ReactDOM.findDOMNode;
  export const unmountComponentAtNode: typeof ReactDOM.unmountComponentAtNode;
  export const flushSync: typeof ReactDOM.flushSync;
}

// React JSX Runtime module declaration
declare module 'react/jsx-runtime' {
  export const jsx: unknown;
  export const jsxs: unknown;
  export const Fragment: unknown;
}

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: unknown;
  export default content;
}
