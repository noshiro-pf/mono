import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../constants/texts';
import { IAnswerSymbolType } from '../../types/record/answer-symbol';
import { IYmdHmType } from '../../types/record/ymd-hm';
import { ForciblyUpdatedValue } from '../../utils/forcibly-updated-value';
import { IList } from '../../utils/immutable';
import { BpDatetimePicker } from '../atoms/blueprint-js-wrapper/bp-datetime-picker';
import { BpPasswordInput } from '../molecules/bp-password-input';
import { ParagraphWithSwitch } from '../molecules/paragraph-with-switch';
import { WidthRestrictedInputWrapper } from '../styled/width-restricted-input-wrapper';
import { SymbolSettings } from './symbol-settings/symbol-settings';

const vt = texts.createEventPage.section3;

const Root = styled.div`
  padding: 10px;

  & > * {
    margin-bottom: 15px;
  }
`;

export const EventSettings = memoNamed<{
  useAnswerDeadline: boolean;
  onToggleAnswerDeadline: () => void;
  answerDeadline: IYmdHmType | undefined;
  onAnswerDeadlineChange: (value: IYmdHmType | undefined) => void;
  usePassword: boolean;
  onToggleUsePassword: () => void;
  password: string;
  onPasswordChange: (value: string) => void;
  customizeSymbolSettings: boolean;
  onToggleCustomizeSymbolSettings: () => void;
  answerSymbolList: ForciblyUpdatedValue<IList<IAnswerSymbolType>>;
  onAnswerSymbolListChange: (value: IList<IAnswerSymbolType>) => void;
}>(
  'EventSettings',
  ({
    useAnswerDeadline,
    onToggleAnswerDeadline,
    answerDeadline,
    onAnswerDeadlineChange,
    usePassword,
    onToggleUsePassword,
    password,
    onPasswordChange,
    customizeSymbolSettings,
    onToggleCustomizeSymbolSettings,
    answerSymbolList,
    onAnswerSymbolListChange,
  }) => (
    <Root>
      <ParagraphWithSwitch
        title={vt.answerDeadline}
        description={vt.howAnswerDeadlineIsUsed}
        show={useAnswerDeadline}
        onToggle={onToggleAnswerDeadline}
        elementToToggle={
          <BpDatetimePicker
            ymdhm={answerDeadline}
            onYmdHmChange={onAnswerDeadlineChange}
          />
        }
      />
      <ParagraphWithSwitch
        title={vt.usePassword}
        description={vt.howPasswordIsUsed}
        show={usePassword}
        onToggle={onToggleUsePassword}
        elementToToggle={
          <WidthRestrictedInputWrapper>
            <BpPasswordInput
              password={password}
              onPasswordChange={onPasswordChange}
            />
          </WidthRestrictedInputWrapper>
        }
      />
      <ParagraphWithSwitch
        title={vt.symbolSettings}
        show={customizeSymbolSettings}
        onToggle={onToggleCustomizeSymbolSettings}
        elementToToggle={
          <SymbolSettings
            answerSymbolList={answerSymbolList}
            onAnswerSymbolListChange={onAnswerSymbolListChange}
          />
        }
      />
    </Root>
  )
);
