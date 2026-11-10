import { Button, FormGroup, InputGroup } from 'blueprint-synstate';
import { map } from 'synstate';
import { constant, type Bindable, type JSX } from 'synstate-dom';
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
  const isWaitingResponse = state.pipe(
    map((s) => s.formState.isWaitingResponse),
  );

  const intent = state.pipe(map((s) => s.displayNameFormIntent));

  return (
    <UpdateUserInfoDialogTemplate
      body={
        <div class={constant(styles.displayNameBody)}>
          <FormGroup
            class={styles.field}
            helperText={state.pipe(map((s) => s.formState.displayName.error))}
            intent={intent}
            label={constant(dc.updateDisplayName.newDisplayName)}
          >
            <InputGroup
              // eslint-disable-next-line synstate-dom-a11y/no-autofocus -- focus moves into a dialog as it opens, as the WAI-ARIA dialog pattern asks
              autoFocus
              data-e2e={constant('new-display-name')}
              disabled={isWaitingResponse}
              intent={intent}
              type={'text'}
              value={state.pipe(map((s) => s.formState.displayName.inputValue))}
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
          disabled={state.pipe(map((s) => s.enterButtonDisabled))}
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
