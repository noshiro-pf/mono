import { FormGroup } from '@blueprintjs/core';
import { BpInput, BpTextArea } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import styled from 'styled-components';
import { texts } from '../../constants/texts';
import { WidthRestrictedInputWrapper } from '../styled/width-restricted-input-wrapper';

const vt = texts.eventSettingsPage.section1;

type Props = Readonly<{
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}>;

export const NameAndNotes = memoNamed<Props>('NameAndNotes', (props) => (
  <Root>
    <FormGroup label={vt.eventName}>
      <BpInput
        placeholder={vt.eventNamePlaceholder}
        value={props.title}
        onValueChange={props.onTitleChange}
        autoFocus={true}
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
