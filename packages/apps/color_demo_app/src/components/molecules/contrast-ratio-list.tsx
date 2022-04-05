import { memoNamed } from '@noshiro/react-utils';
import type { Mappable } from '@noshiro/ts-utils-additional';
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
      <div>{'隣り合う二色のコントラスト比：'}</div>
      {'['}
      {props.contrastRatioList.map((r, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>{`${r.toFixed(2)}, `}&nbsp;</div>
      ))}
      {']'}
    </Root>
  )
);
