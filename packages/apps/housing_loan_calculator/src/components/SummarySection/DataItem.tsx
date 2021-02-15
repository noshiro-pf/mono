import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';

const DataTitle = styled.dt`
  padding: 5px;
`;

const DataDescription = styled.dd`
  padding: 5px;
`;

type Props = Readonly<{
  title: string;
  description: string;
}>;

export const DataItem = memoNamed<Props>(
  'DataItem',
  ({ title, description }) => (
    <>
      <DataTitle>{title}</DataTitle>
      <DataDescription>{description}</DataDescription>
    </>
  )
);
