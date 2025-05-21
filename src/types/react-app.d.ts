/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace React {
  interface StatelessComponent<P = {}> {
    (props: P & { children?: React.ReactNode }, context?: any): React.ReactElement<any, any> | null;
    propTypes?: React.WeakValidationMap<P>;
    contextTypes?: React.ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  interface FC<P = {}> extends StatelessComponent<P> {}
  interface FunctionComponent<P = {}> extends StatelessComponent<P> {}
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.less" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.styl" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.css" {
  const css: string;
  export default css;
}

declare module "*.scss" {
  const css: string;
  export default css;
}

declare module "*.sass" {
  const css: string;
  export default css;
}

declare module "*.less" {
  const css: string;
  export default css;
}

declare module "*.styl" {
  const css: string;
  export default css;
}
