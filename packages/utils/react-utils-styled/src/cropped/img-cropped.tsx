import { memoNamed } from '@mono/react-utils';
import { Rect } from '@mono/ts-utils';
import React from 'react';
import styled from 'styled-components';
import { DivCropped } from './div-cropped';

const Img = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  /* object-fit: contain; */
`;

type Props = Readonly<{
  src: string;
  cropRectRelative: Rect;
}>;

export const ImgCropped = memoNamed<Props>(
  'ImgCropped',
  ({ src, cropRectRelative }: Props) => (
    <DivCropped cropRectRelative={cropRectRelative}>
      <Img src={src} />
    </DivCropped>
  )
);
