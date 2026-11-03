import { Button, FormGroup, InputGroup } from 'blueprint-synstate';
import { constant, view, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { DeleteAccountCreatedWithGoogleStore } from '../../../store/index.mjs';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template.js';
import * as styles from './update-user-info-dialog.module.css';

const dc = dict.accountSettings;

type Props = Readonly<{ dialogIsOpen: Bindable<boolean> }>;

const { state } = DeleteAccountCreatedWithGoogleStore;

export const DeleteAccountCreatedWithGoogleDialog = ({
  dialogIsOpen,
}: Props): JSX.Element => {
  const isWaitingResponse = view(state, (s) => s.isWaitingResponse);

  const intent = view(state, (s) => s.emailFormIntent);

  return (
    <UpdateUserInfoDialogTemplate
      body={
        <div class={constant(styles.deleteAccountGoogleBody)}>
          <FormGroup
            class={styles.field}
            helperText={view(state, (s) => s.formState.error)}
            intent={intent}
            label={constant(dc.deleteAccount.verifyEmail)}
          >
            <InputGroup
              // suppress auto complete
              autoComplete={'new-password'}
              autoFocus
              disabled={isWaitingResponse}
              intent={intent}
              type={'email'}
              value={view(state, (s) => s.formState.inputValue)}
              onInput={({ currentTarget }) => {
                DeleteAccountCreatedWithGoogleStore.inputEmailHandler(
                  currentTarget.value,
                );
              }}
            />
          </FormGroup>
        </div>
      }
      dialogIsOpen={dialogIsOpen}
      isWaitingResponse={isWaitingResponse}
      submitButton={
        <Button
          disabled={view(state, (s) => s.enterButtonDisabled)}
          intent={'danger'}
          loading={isWaitingResponse}
          text={constant(dc.button.deleteAccount)}
          onClick={DeleteAccountCreatedWithGoogleStore.enterClickHandler}
        />
      }
      title={dc.deleteAccount.title}
    />
  );
};
