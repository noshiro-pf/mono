import { FormGroup, InputGroup, TextArea } from 'blueprint-synstate';
import { map } from 'synstate';
import {
  constant,
  mapBindable,
  toObservable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { dict } from '../../constants/index.mjs';
import { createFormError } from '../../hooks/index.mjs';
import { WidthRestrictedInputWrapper } from '../styled/index.mjs';
import * as styles from './name-and-note.module.css';

const dc = dict.eventSettingsPage.section1;

type Props = Readonly<{
  title: Bindable<string>;
  onTitleChange: (value: string) => void;
  notes: Bindable<string>;
  onNotesChange: (value: string) => void;
}>;

export const NameAndNotes = ({
  title,
  onTitleChange,
  notes,
  onNotesChange,
}: Props): JSX.Element => {
  const [showError$, touch] = createFormError(
    toObservable(title).pipe(map((v) => v === '')),
  );

  return (
    <WidthRestrictedInputWrapper class={styles.wrapper}>
      <FormGroup
        helperText={mapBindable(showError$, (e) =>
          e ? dict.eventSettingsPage.errorMessages.titleIsEmpty : undefined,
        )}
        intent={mapBindable(showError$, (e) => (e ? 'danger' : 'primary'))}
        label={constant(dc.eventName)}
        labelInfo={constant(dc.eventNameInfo)}
      >
        <InputGroup
          data-e2e={constant('title')}
          placeholder={constant(dc.eventNamePlaceholder)}
          value={title}
          onBlur={touch}
          onInput={({ currentTarget }) => {
            onTitleChange(currentTarget.value);

            touch();
          }}
        />
      </FormGroup>
      <FormGroup intent={'primary'} label={constant(dc.notes)}>
        <TextArea
          autoResize
          data-e2e={constant('note')}
          fill
          placeholder={constant(dc.notesPlaceholder)}
          value={notes}
          onInput={({ currentTarget }) => {
            onNotesChange(currentTarget.value);
          }}
        />
      </FormGroup>
    </WidthRestrictedInputWrapper>
  );
};
