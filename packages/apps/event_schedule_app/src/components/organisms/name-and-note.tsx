import { FormGroup } from '@blueprintjs/core';
import { BpInput, BpTextArea } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../constants';
import { useFormError } from '../../hooks';
import { WidthRestrictedInputWrapper } from '../styled';

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
          helperText={
            showError
              ? texts.eventSettingsPage.errorMessages.titleIsEmpty
              : undefined
          }
          intent={showError ? 'danger' : 'primary'}
          label={vt.eventName}
        >
          <BpInput
            placeholder={vt.eventNamePlaceholder}
            value={title}
            onBlur={onBlur}
            onValueChange={onTitleChangeLocal}
          />
        </FormGroup>
        <FormGroup intent={'primary'} label={vt.notes}>
          <BpTextArea
            fill={true}
            placeholder={vt.notesPlaceholder}
            value={notes}
            onValueChange={onNotesChange}
          />
        </FormGroup>
      </Root>
    );
  }
);

const Root = styled(WidthRestrictedInputWrapper)`
  padding: 10px;
`;
