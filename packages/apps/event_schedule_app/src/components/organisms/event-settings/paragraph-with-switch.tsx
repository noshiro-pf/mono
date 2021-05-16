import { BpSwitchWithoutLabel } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Description } from '../../atoms/description';

type Props = Readonly<{
  title: string;
  description?: string;
  show: boolean;
  onToggle: () => void;
  elementToToggle: ReactNode;
}>;

export const ParagraphWithSwitch = memoNamed<Props>(
  'ParagraphWithSwitch',
  (props) => (
    <div>
      <SwitchWrapper>
        <div>{props.title}</div>
        <BpSwitchWithoutLabel
          inline={true}
          checked={props.show}
          onToggle={props.onToggle}
        />
      </SwitchWrapper>
      {props.description === undefined ? undefined : (
        <Description text={props.description} />
      )}
      {props.show === undefined ? undefined : props.elementToToggle}
    </div>
  )
);

const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  & > * {
    margin-right: 5px;
  }
`;
