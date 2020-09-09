import { memoNamed } from '@mono/react-utils';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { BpSwitchWithoutLabel } from '../atoms/blueprint-js-wrapper/bp-switch-without-label';
import { Description } from '../atoms/description';

const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  & > * {
    margin-right: 5px;
  }
`;

export const ParagraphWithSwitch = memoNamed<{
  title: string;
  description?: string;
  show: boolean;
  onToggle: () => void;
  elementToToggle: ReactNode;
}>(
  'ParagraphWithSwitch',
  ({ title, description, show, onToggle, elementToToggle }) => (
    <div>
      <SwitchWrapper>
        <div>{title}</div>
        <BpSwitchWithoutLabel
          inline={true}
          checked={show}
          onToggle={onToggle}
        />
      </SwitchWrapper>
      {description === undefined ? undefined : (
        <Description text={description} />
      )}
      {show === undefined ? undefined : elementToToggle}
    </div>
  )
);
