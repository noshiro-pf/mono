import { FormGroup } from '@blueprintjs/core';
import { BpInput, BpTextArea } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../constants/texts';
import { useFormError } from '../../utils/use-form-error-hook';
import { WidthRestrictedInputWrapper } from '../styled/width-restricted-input-wrapper';

const vt = texts.eventSettingsPage.section1;

type Props = Readonly<{
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}>;

export const NameAndNotes = memoNamed<Props>(
  'NameAndNotes',
  ({ title, onTitleChange, notes, onNotesChange }) => {
    const [showError, onTitleChangeLocal, onBlur] = useFormError(
      title,
      (v) => v === '',
      onTitleChange
    );

    return (
      <Root>
        <FormGroup
          label={vt.eventName}
          helperText={
            showError
              ? texts.eventSettingsPage.errorMessages.titleIsEmpty
              : undefined
          }
          intent={showError ? 'danger' : 'primary'}
        >
          <BpInput
            placeholder={vt.eventNamePlaceholder}
            value={title}
            onValueChange={onTitleChangeLocal}
            autoFocus={true}
            onBlur={onBlur}
          />
        </FormGroup>
        <FormGroup label={vt.notes} intent={'primary'}>
          <BpTextArea
            placeholder={vt.notesPlaceholder}
            value={notes}
            onValueChange={onNotesChange}
            fill={true}
          />
        </FormGroup>
      </Root>
    );
  }
);

const Root = styled(WidthRestrictedInputWrapper)`
  padding: 10px;
`;
