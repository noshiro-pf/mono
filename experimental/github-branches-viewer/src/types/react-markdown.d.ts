declare module 'react-markdown' {
  import { type ReactElement } from 'react';

  export type ReactMarkdownProps = {
    children: string;
    components?: Record<string, React.ComponentType<any>>;
  };

  export default function ReactMarkdown(
    props: ReactMarkdownProps,
  ): ReactElement;
}
