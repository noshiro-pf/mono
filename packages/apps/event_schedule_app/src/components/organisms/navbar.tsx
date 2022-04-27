import { AnchorButton, Icon, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { useRouterLinkClick } from '@noshiro/tiny-router-react-hooks';
import { css } from 'styled-components';
import { aboutThisAppUrl, routes } from '../../constants';
import {
  router,
  signOutClick,
  UpdateUserInfoDialogState,
  useFireAuthUser,
  usePasswordProviderIncluded,
} from '../../store';
import { NoWrapSpan } from '../atoms';
import {
  DeleteAccountCreatedWithGoogleDialog,
  DeleteAccountDialog,
  UpdateDisplayNameDialog,
  UpdateEmailDialog,
  UpdatePasswordDialog,
} from './update-user-info-dialog';

const dc = dict.header;

const popoverModifiers = {
  arrow: undefined,
} as const;

export const NavBar = memoNamed('NavBar', () => {
  const user = useFireAuthUser();

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

  const handleEventListButtonClick = useRouterLinkClick({
    replace: false,
    pushFn: router.push,
    redirectFn: router.redirect,
  });

  const openingDialog = useObservableValue(
    UpdateUserInfoDialogState.openingDialog$
  );

  const passwordProviderIncluded = usePasswordProviderIncluded();

  return (
    <Wrapper>
      <Row>
        <Item>
          <AnchorButton
            href={routes.createPage}
            icon={'add'}
            intent={'primary'}
            rel={'noopener noreferrer'}
            target={'_blank'}
          >
            <NoWrapSpan>{dc.createNew}</NoWrapSpan>
          </AnchorButton>
        </Item>
      </Row>
      <Row2>
        <UserAccount>
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
              <ItemAnchor
                href={routes.eventListPage}
                onClick={handleEventListButtonClick}
              >
                {dc.list}
              </ItemAnchor>
              <Item>
                <span>{dc.auth.userName.prefix}</span>
                <Popover2
                  content={
                    <Menu>
                      <MenuItem text={dc.auth.menu.accountSettings}>
                        <MenuItem
                          text={dc.auth.menu.changeDisplayName}
                          onClick={UpdateUserInfoDialogState.changeUsername}
                        />
                        {passwordProviderIncluded ? (
                          <>
                            <MenuItem
                              text={dc.auth.menu.changeEmail}
                              onClick={UpdateUserInfoDialogState.changeEmail}
                            />
                            <MenuItem
                              text={dc.auth.menu.changePassword}
                              onClick={UpdateUserInfoDialogState.changePassword}
                            />
                            <MenuItem
                              intent={'danger'}
                              text={dc.auth.menu.deleteAccount}
                              onClick={UpdateUserInfoDialogState.deleteAccount}
                            />
                          </>
                        ) : (
                          <MenuItem
                            intent={'danger'}
                            text={dc.auth.menu.deleteAccount}
                            onClick={
                              UpdateUserInfoDialogState.deleteAccountCreatedWithGoogle
                            }
                          />
                        )}
                      </MenuItem>
                      <MenuItem
                        text={dc.auth.menu.signOut}
                        onClick={signOutClick}
                      />
                    </Menu>
                  }
                  minimal={true}
                  modifiers={popoverModifiers}
                  position={'bottom-left'}
                  transitionDuration={50}
                >
                  <Anchor>{user.displayName}</Anchor>
                </Popover2>
                <span>{dc.auth.userName.suffix}</span>
              </Item>

              <UpdateDisplayNameDialog
                dialogIsOpen={openingDialog === 'updateDisplayName'}
              />
              <UpdateEmailDialog
                currentEmail={user.email}
                dialogIsOpen={openingDialog === 'updateEmail'}
              />
              <UpdatePasswordDialog
                currentEmail={user.email}
                dialogIsOpen={openingDialog === 'updatePassword'}
              />
              <DeleteAccountDialog
                dialogIsOpen={openingDialog === 'deleteAccount'}
              />
              <DeleteAccountCreatedWithGoogleDialog
                dialogIsOpen={
                  openingDialog === 'deleteAccountCreatedWithGoogle'
                }
              />
            </>
          )}
        </UserAccount>

        <Item>
          <AnchorButton
            href={aboutThisAppUrl}
            icon={<Icon color={'white'} icon={'help'} />}
            minimal={true}
            rel={'noopener noreferrer'}
            target={'_blank'}
            title={dc.help}
          />
        </Item>
      </Row2>
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

const Row2 = styled(Row)`
  flex: 1;
  justify-content: space-between;
`;

const UserAccount = styled.div`
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
