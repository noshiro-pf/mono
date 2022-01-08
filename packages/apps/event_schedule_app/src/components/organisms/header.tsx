import { AnchorButton, Icon } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { dict, routes } from '../../constants';
import { isDevelopment, isProduction } from '../../env';
import { NoWrapSpan } from '../atoms';
import { NavBar } from './navbar';

const dc = dict.header;

type Props = DeepReadonly<{
  title: string;
  showCreateNewButton: boolean;
}>;

export const Header = memoNamed<Props>(
  'Header',
  ({ title, showCreateNewButton }) => (
    <div>
      {isDevelopment ? <NavBar /> : undefined}
      <Wrapper>
        <Title
          href={routes.createPage}
          rel='noopener noreferrer'
          target='_blank'
        >
          <Icon icon={'timeline-events'} iconSize={28} />
          <div>{title}</div>
        </Title>
        {isProduction && showCreateNewButton ? (
          <AnchorButton
            href={routes.createPage}
            icon='add'
            intent={'primary'}
            rel='noopener noreferrer'
            target='_blank'
          >
            <NoWrapSpan>{dc.createNew}</NoWrapSpan>
          </AnchorButton>
        ) : undefined}
      </Wrapper>
    </div>
  )
);

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin: 0 20px;
`;

const Title = styled.a`
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
