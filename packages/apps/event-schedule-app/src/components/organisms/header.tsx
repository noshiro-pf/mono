import { Icon } from '@blueprintjs/core';
import { NavBar } from './navbar';

type Props = Readonly<{
  title: string;
}>;

export const Header = memoNamed<Props>('Header', ({ title }) => (
  <div>
    <NavBar />
    <div
      css={css`
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        margin: 0 20px;
      `}
    >
      <Title>
        <Icon icon={'timeline-events'} size={28} />
        <div>{title}</div>
      </Title>
    </div>
  </div>
));

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
