import { Icon } from '@blueprintjs/core';
import { NavBar } from './navbar';

type Props = Readonly<{
  title: string;
}>;

export const Header = memoNamed<Props>('Header', ({ title }) => (
  <div>
    <NavBar />
    <Wrapper>
      <Title>
        <Icon icon={'timeline-events'} iconSize={28} />
        <div>{title}</div>
      </Title>
    </Wrapper>
  </div>
));

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin: 0 20px;
`;

const Title = styled.span`
  display: flex;
  align-items: center;
  & > * {
    margin-right: 10px;
  }

  margin: 20px 0;

  /* h1 style */
  font-size: 2em;
  font-weight: bold;
  color: black !important;
  text-decoration: none !important;
`;
