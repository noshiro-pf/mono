import styled from '@emotion/styled';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { type Mutable } from 'ts-type-forge';

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  & > * {
    flex: 1;
  }
`;

type Props = Readonly<{
  imageElement: HTMLImageElement;
}>;

export const ImageElementRenderer = memoNamed<Props>(
  'ImageElementRenderer',
  ({ imageElement }) => {
    const elementRef = React.useRef<Mutable<HTMLDivElement>>(null);

    React.useEffect(() => {
      if (elementRef.current == null) return;

      // `replaceChildren()` rather than `innerHTML = ''`: it empties the node
      // without going through the HTML parser, which is what the lint rule is
      // guarding against.
      elementRef.current.replaceChildren(imageElement);
    }, [imageElement]);

    return <Root ref={elementRef} />;
  },
);
