import {
  AnchorButton,
  Icon,
  Menu,
  MenuItem,
  Popover,
} from 'blueprint-synstate';
import { createState } from 'synstate';
import { constant, If, view, type JSX, type View } from 'synstate-dom';
import {
  aboutThisAppUrl,
  dict,
  feedbackUrl,
  routes,
} from '../../constants/index.mjs';
import {
  Auth,
  Router,
  UpdateUserInfoDialogStore,
  type UpdateUserInfoDialogType,
} from '../../store/index.mjs';
import { NoWrapSpan } from '../atoms/index.mjs';
import { Link } from '../router-components.mjs';
import { ForNonLoggedInUserDialog } from './button-with-confirm/index.mjs';
import * as styles from './navbar.module.css';
import {
  DeleteAccountCreatedWithGoogleDialog,
  DeleteAccountDialog,
  UpdateDisplayNameDialog,
  UpdateEmailDialog,
  UpdatePasswordDialog,
} from './update-user-info-dialog/index.mjs';

const dc = dict.header;

export const NavBar = (): JSX.Element => {
  const [forNonLoggedInUserDialogIsOpen$, setForNonLoggedInUserDialogIsOpen] =
    createState(false);

  const openingDialog$ = UpdateUserInfoDialogStore.openingDialogType$;

  const isOpening = (type: UpdateUserInfoDialogType): View<boolean> =>
    view(openingDialog$, (opening) => opening === type);

  return (
    <div class={constant(styles.navbar)}>
      <div class={constant(styles.row)}>
        <div class={constant(styles.item)}>
          <AnchorButton
            href={constant(Router.toUrl(routes.create.href()))}
            icon={'add'}
            intent={'primary'}
            rel={'noopener noreferrer'}
            target={'_blank'}
          >
            <NoWrapSpan>{constant(dc.createNew)}</NoWrapSpan>
          </AnchorButton>
        </div>
      </div>
      <div class={constant(styles.row2)}>
        <div class={constant(styles.flex)}>
          <If
            cond={view(Auth.fireAuthUser$, (user) => user === undefined)}
            then={
              <>
                <a
                  class={constant(styles.itemAnchor)}
                  data-e2e={constant('nav-event-list')}
                  onClick={() => {
                    setForNonLoggedInUserDialogIsOpen(true);
                  }}
                >
                  {constant(dc.list)}
                </a>
                <ForNonLoggedInUserDialog
                  cancel={() => {
                    setForNonLoggedInUserDialogIsOpen(false);
                  }}
                  isOpen={forNonLoggedInUserDialogIsOpen$}
                />
                <Link
                  class={constant(styles.itemAnchor)}
                  data-e2e={constant('nav-sign-in')}
                  to={routes.signIn.href()}
                >
                  {constant(dc.auth.signIn)}
                </Link>
                <Link
                  class={constant(styles.itemAnchor)}
                  data-e2e={constant('nav-register')}
                  to={routes.register.href()}
                >
                  {constant(dc.auth.register)}
                </Link>
              </>
            }
            else={
              <>
                <Link
                  class={constant(styles.itemAnchor)}
                  data-e2e={constant('nav-event-list')}
                  to={routes.eventList.href()}
                >
                  {constant(dc.list)}
                </Link>
                <div class={constant(styles.item)}>
                  <span>{constant(dc.auth.userName.prefix)}</span>
                  <Popover
                    arrow={false}
                    content={<UserMenu />}
                    placement={'bottom-start'}
                    transitionDuration={50}
                  >
                    <a
                      class={constant(styles.anchor)}
                      data-e2e={constant('nav-user-menu')}
                    >
                      {view(Auth.displayName$, (name) => name ?? '')}
                    </a>
                  </Popover>
                  <span>{constant(dc.auth.userName.suffix)}</span>
                </div>
                <UpdateDisplayNameDialog
                  dialogIsOpen={isOpening('updateDisplayName')}
                />
                <UpdateEmailDialog
                  currentEmail={Auth.email$}
                  dialogIsOpen={isOpening('updateEmail')}
                />
                <UpdatePasswordDialog
                  currentEmail={Auth.email$}
                  dialogIsOpen={isOpening('updatePassword')}
                />
                <DeleteAccountDialog
                  dialogIsOpen={isOpening('deleteAccount')}
                />
                <DeleteAccountCreatedWithGoogleDialog
                  dialogIsOpen={isOpening('deleteAccountCreatedWithGoogle')}
                />
              </>
            }
          />
        </div>

        <div class={constant(styles.flex)}>
          <div class={constant(styles.item)}>
            <AnchorButton
              href={constant(feedbackUrl)}
              iconElement={<Icon color={'white'} icon={'send-message'} />}
              rel={'noopener noreferrer'}
              target={'_blank'}
              title={constant(dc.feedback)}
              variant={constant('minimal')}
            />
          </div>

          <div class={constant(styles.item)}>
            <AnchorButton
              href={constant(aboutThisAppUrl)}
              iconElement={<Icon color={'white'} icon={'help'} />}
              rel={'noopener noreferrer'}
              target={'_blank'}
              title={constant(dc.help)}
              variant={constant('minimal')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/** The signed-in user's menu: the account settings, and signing out. */
const UserMenu = (): JSX.Element => (
  <Menu>
    <MenuItem text={constant(dc.auth.menu.accountSettings)}>
      <MenuItem
        text={constant(dc.auth.menu.changeDisplayName)}
        onClick={UpdateUserInfoDialogStore.changeUsername}
      />
      <If
        cond={Auth.passwordProviderIncluded$}
        then={
          <>
            <MenuItem
              text={constant(dc.auth.menu.changeEmail)}
              onClick={UpdateUserInfoDialogStore.changeEmail}
            />
            <MenuItem
              text={constant(dc.auth.menu.changePassword)}
              onClick={UpdateUserInfoDialogStore.changePassword}
            />
            <MenuItem
              intent={'danger'}
              text={constant(dc.auth.menu.deleteAccount)}
              onClick={UpdateUserInfoDialogStore.deleteAccount}
            />
          </>
        }
        else={
          <MenuItem
            intent={'danger'}
            text={constant(dc.auth.menu.deleteAccount)}
            onClick={UpdateUserInfoDialogStore.deleteAccountCreatedWithGoogle}
          />
        }
      />
    </MenuItem>
    <MenuItem
      text={constant(dc.auth.menu.signOut)}
      onClick={Auth.signOutClick}
    />
  </Menu>
);
