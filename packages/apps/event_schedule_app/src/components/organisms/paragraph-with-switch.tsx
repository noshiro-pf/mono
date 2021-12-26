import { memoNamed } from '@noshiro/react-utils';
import { IList } from '@noshiro/ts-utils';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Description } from '../atoms';
import { SwitchWithoutLabelStyled } from '../bp';

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
        <SwitchWithoutLabelStyled
          checked={props.show}
          inline={true}
          onChange={props.onToggle}
        />
      </SwitchWrapper>
      {props.description === undefined
        ? undefined
        : IList.map(props.description, (d, i) => (
            <Description key={i} text={d} />
          ))}
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
