import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../../constants/texts';
import { IAnswerSymbol } from '../../../types/record/base/answer-symbol';
import { IYmdHm } from '../../../types/record/ymd-hm';
import { IList } from '../../../utils/immutable';
import { BpDatetimePicker } from '../../atoms/blueprint-js-wrapper/bp-datetime-picker';
// import { BpPasswordInput } from '../../molecules/bp-password-input';
import { ParagraphWithSwitch } from './paragraph-with-switch';
// import { WidthRestrictedInputWrapper } from '../../styled/width-restricted-input-wrapper';
import { SymbolSettings } from '../symbol-settings/symbol-settings';

const vt = texts.createEventPage.section3;

interface Props {
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: IYmdHm | undefined;
  onAnswerDeadlineChange: (value: IYmdHm | undefined) => void;
  usePassword: boolean;
  onToggleUsePassword: () => void;
  password: string;
  onPasswordChange: (value: string) => void;
  customizeSymbolSettings: boolean;
  onToggleCustomizeSymbolSettings: () => void;
  answerSymbolList: IList<IAnswerSymbol>;
  onAnswerSymbolListChange: (value: IList<IAnswerSymbol>) => void;
}

export const EventSettings = memoNamed<Props>('EventSettings', (props) => (
  <Root>
    <ParagraphWithSwitch
      title={vt.answerDeadline}
      description={vt.howAnswerDeadlineIsUsed}
      show={props.useAnswerDeadline}
      onToggle={props.onToggleAnswerDeadline}
      elementToToggle={
        <BpDatetimePicker
          ymdhm={props.answerDeadline}
          onYmdHmChange={props.onAnswerDeadlineChange}
          disabled={!props.useAnswerDeadline}
        />
      }
    />
    {/* <ParagraphWithSwitch
      title={vt.usePassword}
      description={vt.howPasswordIsUsed}
      show={props.usePassword}
      onToggle={props.onToggleUsePassword}
      elementToToggle={
        <WidthRestrictedInputWrapper>
          <BpPasswordInput
            password={props.password}
            onPasswordChange={props.onPasswordChange}
            disabled={!props.usePassword}
          />
        </WidthRestrictedInputWrapper>
      }
    /> */}
    <ParagraphWithSwitch
      title={vt.symbolSettings}
      show={props.customizeSymbolSettings}
      onToggle={props.onToggleCustomizeSymbolSettings}
      elementToToggle={
        <SymbolSettings
          answerSymbolList={props.answerSymbolList}
          onAnswerSymbolListChange={props.onAnswerSymbolListChange}
          disabled={!props.customizeSymbolSettings}
        />
      }
    />
  </Root>
));

const Root = styled.div`
  padding: 10px;

  & > * {
    margin-bottom: 15px;
  }
`;
