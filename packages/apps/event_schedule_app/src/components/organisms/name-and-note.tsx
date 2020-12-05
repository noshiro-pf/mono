import { FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../constants/texts';
import { BpInput } from '../atoms/blueprint-js-wrapper/bp-input';
import { BpTextArea } from '../atoms/blueprint-js-wrapper/bp-textarea';
import { WidthRestrictedInputWrapper } from '../styled/width-restricted-input-wrapper';

const vt = texts.createEventPage.section1;

interface Props {
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

export const NameAndNotes = memoNamed<Props>('NameAndNotes', (props) => (
  <Root>
    <FormGroup label={vt.eventName}>
      <BpInput
        placeholder={vt.eventNamePlaceholder}
        value={props.title}
        onValueChange={props.onTitleChange}
      />
    </FormGroup>
    <FormGroup label={vt.notes}>
      <BpTextArea
        placeholder={vt.notesPlaceholder}
        value={props.notes}
        onValueChange={props.onNotesChange}
        fill={true}
      />
    </FormGroup>
  </Root>
));

const Root = styled(WidthRestrictedInputWrapper)`
  padding: 10px;
`;
