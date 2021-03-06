import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { descriptionFontColor } from '../../constants';

type Props = Readonly<{
  text: string;
  error?: boolean;
  color?: string;
}>;

export const Description = memoNamed<Props>(
  'Description',
  ({ text, error = false, color }) => (
    <Root
      style={{
        color:
          color ??
          (error ? descriptionFontColor.error : descriptionFontColor.normal),
      }}
    >
      {text}
    </Root>
  )
);

const Root = styled.div`
  font-size: smaller;
  margin-bottom: 5px;
`;
