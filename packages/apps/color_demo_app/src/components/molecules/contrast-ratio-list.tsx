import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';

const Root = styled.div`
  padding: 10px;
  display: flex;
`;

type Props = Readonly<{ contrastRatioList: readonly number[] }>;

export const ContrastRatioList = memoNamed<Props>(
  'ContrastRatioList',
  (props) => (
    <Root>
      <div>{'隣り合う二色のコントラスト比：'}</div>
      {'['}
      {IList.map(props.contrastRatioList, (r, i) => (
        <div key={i}>{`${r.toFixed(2)}, `}&nbsp;</div>
      ))}
      {']'}
    </Root>
  )
);
