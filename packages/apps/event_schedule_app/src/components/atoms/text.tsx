import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';

interface Props {
  text: string;
}

export const Text = memoNamed<Props>('Text', (props) => (
  <Root>{props.text}</Root>
));

const Root = styled.div`
  margin-bottom: 5px;
`;
