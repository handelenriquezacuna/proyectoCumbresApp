declare module 'react-katex' {
  import type { ReactElement, ReactNode } from 'react';

  export interface KatexProps {
    math?: string;
    children?: ReactNode;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
    settings?: Record<string, unknown>;
    as?: string;
  }

  export const InlineMath: (props: KatexProps) => ReactElement;
  export const BlockMath: (props: KatexProps) => ReactElement;
}
