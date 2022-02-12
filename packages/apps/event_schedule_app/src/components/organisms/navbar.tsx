import type { PopperModifiers } from '@blueprintjs/core';
import { AnchorButton, Menu, MenuItem, Popover } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { useStreamValue } from '@noshiro/syncflow-react-hooks';
import { useRouterLinkClick } from '@noshiro/tiny-router-react-hooks';
import styled, { css } from 'styled-components';
import { dict, routes } from '../../constants';
import { isDevelopment } from '../../env';
import { router, signOut, UpdateUserInfoDialogState, user$ } from '../../store';
import { NoWrapSpan } from '../atoms';
import {
  DeleteAccountDialog,
  UpdateDisplayNameDialog,
  UpdateEmailDialog,
  UpdatePasswordDialog,
} from './update-user-info-dialog';

const dc = dict.header;

const popoverModifiers: PopperModifiers = {
  arrow: undefined,
} as const;

export const NavBar = memoNamed('NavBar', () => {
  const user = useStreamValue(user$);

  const handleSignInClick = useRouterLinkClick({
    replace: false,
    pushFn: router.push,
    redirectFn: router.redirect,
  });

  const handleRegisterClick = useRouterLinkClick({
    replace: false,
    pushFn: router.push,
    redirectFn: router.redirect,
  });

  const openingDialog = useStreamValue(
    UpdateUserInfoDialogState.openingDialog$
  );

  return (
    <Wrapper>
      <Row>
        <Item>
          <AnchorButton
            href={routes.createPage}
            icon='add'
            intent={'primary'}
            rel='noopener noreferrer'
            target='_blank'
          >
            <NoWrapSpan>{dc.createNew}</NoWrapSpan>
          </AnchorButton>
        </Item>
      </Row>
      <Row>
        {user === undefined ? (
          <>
            <ItemAnchor href={routes.signInPage} onClick={handleSignInClick}>
              {dc.auth.signIn}
            </ItemAnchor>
            <ItemAnchor
              href={routes.registerPage}
              onClick={handleRegisterClick}
            >
              {dc.auth.register}
            </ItemAnchor>
          </>
        ) : (
          <>
            {isDevelopment ? <ItemAnchor>{dc.list}</ItemAnchor> : undefined}
            <Item>
              <span>{dc.auth.userName.prefix}</span>
              <Popover
                content={
                  <Menu>
                    <MenuItem text={dc.auth.menu.accountSettings}>
                      <MenuItem
                        text={dc.auth.menu.changeDisplayName}
                        onClick={UpdateUserInfoDialogState.changeUsername}
                      />
                      <MenuItem
                        text={dc.auth.menu.changeEmail}
                        onClick={UpdateUserInfoDialogState.changeEmail}
                      />
                      <MenuItem
                        text={dc.auth.menu.changePassword}
                        onClick={UpdateUserInfoDialogState.changePassword}
                      />
                      <MenuItem
                        text={dc.auth.menu.deleteAccount}
                        onClick={UpdateUserInfoDialogState.deleteAccount}
                      />
                    </MenuItem>
                    <MenuItem text={dc.auth.menu.signOut} onClick={signOut} />
                  </Menu>
                }
                minimal={true}
                modifiers={popoverModifiers}
                position={'bottom-left'}
                transitionDuration={50}
              >
                <Anchor>{user.displayName}</Anchor>
              </Popover>
              <span>{dc.auth.userName.suffix}</span>
            </Item>

            <UpdateDisplayNameDialog
              dialogIsOpen={openingDialog === 'updateDisplayName'}
              user={user}
            />
            <UpdateEmailDialog
              dialogIsOpen={openingDialog === 'updateEmail'}
              user={user}
            />
            <UpdatePasswordDialog
              dialogIsOpen={openingDialog === 'updatePassword'}
              user={user}
            />
            <DeleteAccountDialog
              dialogIsOpen={openingDialog === 'deleteAccount'}
              user={user}
            />
          </>
        )}
      </Row>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  background-color: #333;
  color: white;
  font-size: 12px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

const Row = styled.div`
  display: flex;
`;

const itemCss = css`
  padding: 0 10px;
  display: flex;
  align-items: center;
  height: 30px;
  white-space: nowrap;
`;

const Item = styled.div`
  ${itemCss}
`;

const Anchor = styled.a`
  color: white;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const ItemAnchor = styled(Anchor)`
  ${itemCss}
  text-decoration: none;

  &:hover {
    text-decoration: none;
    background-color: rgba(255, 255, 255, 0.15);
  }
`;
