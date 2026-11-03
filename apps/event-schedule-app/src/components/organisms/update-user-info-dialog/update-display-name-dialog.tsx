import { Button, FormGroup, InputGroup } from 'blueprint-synstate';
import { constant, view, type Bindable, type JSX } from 'synstate-dom';
import { dict } from '../../../constants/index.mjs';
import { UpdateDisplayNamePageStore } from '../../../store/index.mjs';
import { UpdateUserInfoDialogTemplate } from './update-user-info-dialog-template.js';
import * as styles from './update-user-info-dialog.module.css';

const dc = dict.accountSettings;

type Props = Readonly<{ dialogIsOpen: Bindable<boolean> }>;

const { state } = UpdateDisplayNamePageStore;

export const UpdateDisplayNameDialog = ({
  dialogIsOpen,
}: Props): JSX.Element => {
  const isWaitingResponse = view(state, (s) => s.formState.isWaitingResponse);

  const intent = view(state, (s) => s.displayNameFormIntent);

  return (
    <UpdateUserInfoDialogTemplate
      body={
        <div class={constant(styles.displayNameBody)}>
          <FormGroup
            class={styles.field}
            helperText={view(state, (s) => s.formState.displayName.error)}
            intent={intent}
            label={constant(dc.updateDisplayName.newDisplayName)}
          >
            <InputGroup
              autoFocus
              data-e2e={constant('new-display-name')}
              disabled={isWaitingResponse}
              intent={intent}
              type={'text'}
              value={view(state, (s) => s.formState.displayName.inputValue)}
              onInput={({ currentTarget }) => {
                UpdateDisplayNamePageStore.inputDisplayNameHandler(
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
          intent={'primary'}
          loading={isWaitingResponse}
          text={constant(dc.button.update)}
          onClick={UpdateDisplayNamePageStore.enterClickHandler}
        />
      }
      title={dc.updateDisplayName.title}
    />
  );
};
