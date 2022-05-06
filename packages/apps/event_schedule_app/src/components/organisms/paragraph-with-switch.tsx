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
  ({
    elementToToggle,
    hideContentIfToggleIsFalse,
    onToggle,
    title,
    toggleState,
    description,
  }) => (
    <div>
      <SwitchWrapper>
        <div>{title}</div>
        <SwitchWithoutLabelStyled
          checked={toggleState}
          inline={true}
          onChange={onToggle}
        />
      </SwitchWrapper>
      {description === undefined
        ? undefined
        : IList.map(description, (d, i) => <Description key={i} text={d} />)}
      {hideContentIfToggleIsFalse && !toggleState ? undefined : elementToToggle}
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
