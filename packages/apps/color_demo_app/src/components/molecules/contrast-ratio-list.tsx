import { memoNamed } from '@mono/react-utils';
import { Mappable } from '@mono/ts-utils';
import React from 'react';
import styled from 'styled-components';

const Root = styled.div`
  padding: 10px;
  display: flex;
`;

type Props = Readonly<{ contrastRatioList: Mappable<number> }>;

export const ContrastRatioList = memoNamed<Props>(
  'ContrastRatioList',
  (props) => (
    <Root>
      <div>隣り合う二色のコントラスト比：</div>[
      {props.contrastRatioList.map((r, i) => (
        <div key={i}>{`${r.toFixed(2)}, `}&nbsp;</div>
      ))}
      ]
    </Root>
  )
);
