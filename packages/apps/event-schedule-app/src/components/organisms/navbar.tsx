import { AnchorButton, Icon, Menu, MenuItem } from '@blueprintjs/core';
import { Popover2 } from '@blueprintjs/popover2';
import { Routes, aboutThisAppUrl, feedbackUrl } from '../../constants';
import { Auth, UpdateUserInfoDialogStore, router } from '../../store';
import { NoWrapSpan } from '../atoms';
import { ForNonLoggedInUserDialog } from './button-with-confirm';
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
  const fireAuthUser = Auth.useFireAuthUser();

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
    UpdateUserInfoDialogStore.openingDialog$
  );

  const passwordProviderIncluded = Auth.usePasswordProviderIncluded();

  const forNonLoggedInUserDialogState = useBoolState(false);

  return (
    <div
      css={css`
        background-color: #333;
        color: white;
        font-size: 12px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      `}
    >
      <Row>
        <Item>
          <AnchorButton
            href={Routes.routes.createPage}
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
        <div
          css={css`
            display: flex;
          `}
        >
          {fireAuthUser === undefined ? (
            <>
              <ItemAnchor onClick={forNonLoggedInUserDialogState.setTrue}>
                {dc.list}
              </ItemAnchor>
              <ForNonLoggedInUserDialog
                cancel={forNonLoggedInUserDialogState.setFalse}
                isOpen={forNonLoggedInUserDialogState.state}
              />

              <ItemAnchor
                href={Routes.routes.signInPage}
                onClick={handleSignInClick}
              >
                {dc.auth.signIn}
              </ItemAnchor>
              <ItemAnchor
                href={Routes.routes.registerPage}
                onClick={handleRegisterClick}
              >
                {dc.auth.register}
              </ItemAnchor>
            </>
          ) : (
            <>
              <ItemAnchor
                href={Routes.routes.eventListPage}
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
                          onClick={UpdateUserInfoDialogStore.changeUsername}
                        />
                        {passwordProviderIncluded ? (
                          <>
                            <MenuItem
                              text={dc.auth.menu.changeEmail}
                              onClick={UpdateUserInfoDialogStore.changeEmail}
                            />
                            <MenuItem
                              text={dc.auth.menu.changePassword}
                              onClick={UpdateUserInfoDialogStore.changePassword}
                            />
                            <MenuItem
                              intent={'danger'}
                              text={dc.auth.menu.deleteAccount}
                              onClick={UpdateUserInfoDialogStore.deleteAccount}
                            />
                          </>
                        ) : (
                          <MenuItem
                            intent={'danger'}
                            text={dc.auth.menu.deleteAccount}
                            onClick={
                              UpdateUserInfoDialogStore.deleteAccountCreatedWithGoogle
                            }
                          />
                        )}
                      </MenuItem>
                      <MenuItem
                        text={dc.auth.menu.signOut}
                        onClick={Auth.signOutClick}
                      />
                    </Menu>
                  }
                  minimal={true}
                  modifiers={popoverModifiers}
                  position={'bottom-left'}
                  transitionDuration={50}
                >
                  <Anchor>{fireAuthUser.displayName}</Anchor>
                </Popover2>
                <span>{dc.auth.userName.suffix}</span>
              </Item>

              <UpdateDisplayNameDialog
                dialogIsOpen={openingDialog === 'updateDisplayName'}
              />
              <UpdateEmailDialog
                currentEmail={fireAuthUser.email}
                dialogIsOpen={openingDialog === 'updateEmail'}
              />
              <UpdatePasswordDialog
                currentEmail={fireAuthUser.email}
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
        </div>

        <div
          css={css`
            display: flex;
          `}
        >
          <Item>
            <AnchorButton
              href={feedbackUrl}
              icon={<Icon color={'white'} icon={'send-message'} />}
              minimal={true}
              rel={'noopener noreferrer'}
              target={'_blank'}
              title={dc.feedback}
            />
          </Item>

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
        </div>
      </Row2>
    </div>
  );
});

const Row = styled.div`
  display: flex;
`;

const Row2 = styled(Row)`
  flex: 1;
  justify-content: space-between;
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
