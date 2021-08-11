import { BpSwitchWithoutLabel } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Description } from '../../atoms';

type Props = Readonly<{
  title: string;
  description?: readonly string[];
  show: boolean;
  disabledInsteadOfHidden: boolean;
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
          checked={props.show}
          inline={true}
          onToggle={props.onToggle}
        />
      </SwitchWrapper>
      {props.description === undefined
        ? undefined
        : props.description.map((d, i) => <Description key={i} text={d} />)}
      {props.disabledInsteadOfHidden
        ? props.elementToToggle
        : props.show
        ? props.elementToToggle
        : undefined}
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
