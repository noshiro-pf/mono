import { Description } from '../atoms';
import { SwitchWithoutLabelStyled } from '../bp';

type Props = Readonly<{
  title: string;
  description?: readonly string[];
  toggleState: boolean;
  onToggle: () => void;
  hideContentIfToggleIsFalse: boolean;
  elementToToggle: ReactNode;
}>;

export const ParagraphWithSwitch = memoNamed<Props>(
  'ParagraphWithSwitch',
  (props) => (
    <div>
      <SwitchWrapper>
        <div>{props.title}</div>
        <SwitchWithoutLabelStyled
          checked={props.toggleState}
          inline={true}
          onChange={props.onToggle}
        />
      </SwitchWrapper>
      {props.description === undefined
        ? undefined
        : IList.map(props.description, (d, i) => (
            <Description key={i} text={d} />
          ))}
      {props.hideContentIfToggleIsFalse && !props.toggleState
        ? undefined
        : props.elementToToggle}
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
