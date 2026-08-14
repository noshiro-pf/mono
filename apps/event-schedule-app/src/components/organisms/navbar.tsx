import {
  AnchorButton,
  Icon,
  Menu,
  MenuItem,
  PopoverNext,
} from '@blueprintjs/core';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useBoolState } from 'better-react-use-state';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { useRouterLinkClick } from 'tiny-router-react-hooks';
import {
  Routes,
  aboutThisAppUrl,
  feedbackUrl,
} from '../../constants/index.mjs';
import { Auth, Router, UpdateUserInfoDialogStore } from '../../store/index.mjs';
import { NoWrapSpan } from '../atoms/index.mjs';
import { ForNonLoggedInUserDialog } from './button-with-confirm/index.mjs';
import {
  DeleteAccountCreatedWithGoogleDialog,
  DeleteAccountDialog,
  UpdateDisplayNameDialog,
  UpdateEmailDialog,
  UpdatePasswordDialog,
} from './update-user-info-dialog/index.mjs';

const dc = dict.header;

export const NavBar = memoNamed('NavBar', () => {
  const fireAuthUser = Auth.useFireAuthUser();

  const routerLinkClickHandler = useRouterLinkClick({
    replace: false,
    pushFn: Router.push,
    redirectFn: Router.redirect,
  });

  const openingDialog = UpdateUserInfoDialogStore.useOpeningDialogType();

  const passwordProviderIncluded = Auth.usePasswordProviderIncluded();

  const forNonLoggedInUserDialogState = useBoolState(false);

  const popoverContent = React.useMemo(
    () => (
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
              onClick={UpdateUserInfoDialogStore.deleteAccountCreatedWithGoogle}
            />
          )}
        </MenuItem>
        <MenuItem text={dc.auth.menu.signOut} onClick={Auth.signOutClick} />
      </Menu>
    ),
    [passwordProviderIncluded],
  );

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
              <ItemAnchor onClick={forNonLoggedInUserDialogState[1].setTrue}>
                {dc.list}
              </ItemAnchor>
              <ForNonLoggedInUserDialog
                cancel={forNonLoggedInUserDialogState[1].setFalse}
                isOpen={forNonLoggedInUserDialogState[0]}
              />

              <ItemAnchor
                href={Routes.routes.signInPage}
                onClick={routerLinkClickHandler}
              >
                {dc.auth.signIn}
              </ItemAnchor>
              <ItemAnchor
                href={Routes.routes.registerPage}
                onClick={routerLinkClickHandler}
              >
                {dc.auth.register}
              </ItemAnchor>
            </>
          ) : (
            <>
              <ItemAnchor
                href={Routes.routes.eventListPage}
                onClick={routerLinkClickHandler}
              >
                {dc.list}
              </ItemAnchor>
              <Item>
                <span>{dc.auth.userName.prefix}</span>
                <PopoverNext
                  arrow={false}
                  content={popoverContent}
                  placement={'bottom-start'}
                  transitionDuration={50}
                >
                  <Anchor>{fireAuthUser.displayName}</Anchor>
                </PopoverNext>
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
              icon={sendFeedbackIcon}
              rel={'noopener noreferrer'}
              target={'_blank'}
              title={dc.feedback}
              variant={'minimal'}
            />
          </Item>

          <Item>
            <AnchorButton
              href={aboutThisAppUrl}
              icon={helpIcon}
              rel={'noopener noreferrer'}
              target={'_blank'}
              title={dc.help}
              variant={'minimal'}
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

const sendFeedbackIcon = <Icon color={'white'} icon={'send-message'} />;

const helpIcon = <Icon color={'white'} icon={'help'} />;
