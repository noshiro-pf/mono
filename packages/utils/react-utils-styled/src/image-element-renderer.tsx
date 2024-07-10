import styled from '@emotion/styled';
import { memoNamed } from '@noshiro/react-utils';
import { useEffect, useRef } from 'react';

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
    const elementRef = useRef<Mutable<HTMLDivElement>>(null);

    useEffect(() => {
      if (elementRef.current == null) return;
      elementRef.current.innerHTML = ''; // reset
      elementRef.current.append(imageElement);
    }, [imageElement]);

    return <Root ref={elementRef} />;
  },
);
