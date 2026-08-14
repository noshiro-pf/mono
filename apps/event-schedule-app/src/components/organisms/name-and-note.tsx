import { FormGroup } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { BpInput, BpTextArea } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { useFormError } from '../../hooks/index.mjs';
import { WidthRestrictedInputWrapper } from '../styled/index.mjs';

const dc = dict.eventSettingsPage.section1;

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
      onTitleChange,
    );

    return (
      <WidthRestrictedInputWrapper
        css={css`
          padding: 10px;
        `}
      >
        <FormGroup
          helperText={
            showError
              ? dict.eventSettingsPage.errorMessages.titleIsEmpty
              : undefined
          }
          intent={showError ? 'danger' : 'primary'}
          label={dc.eventName}
          labelInfo={dc.eventNameInfo}
        >
          <BpInput
            data-e2e={'title'}
            placeholder={dc.eventNamePlaceholder}
            value={title}
            onBlur={onBlur}
            onValueChange={onTitleChangeLocal}
          />
        </FormGroup>
        <FormGroup intent={'primary'} label={dc.notes}>
          <BpTextArea
            autoResize
            data-e2e={'note'}
            fill
            placeholder={dc.notesPlaceholder}
            value={notes}
            onValueChange={onNotesChange}
          />
        </FormGroup>
      </WidthRestrictedInputWrapper>
    );
  },
);
