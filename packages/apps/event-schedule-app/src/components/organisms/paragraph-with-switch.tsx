import { Description } from '../atoms';
import { SwitchWithoutLabelStyled } from '../bp';

type Props = Readonly<{
  title: string;
  description?: readonly string[];
  toggleState: boolean;
  onToggle: () => void;
  hideContentIfToggleIsFalse: boolean;
  elementToToggle: React.ReactNode;
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
      <div
        css={css`
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          & > * {
            margin-right: 5px;
          }
        `}
      >
        <div>{title}</div>
        <SwitchWithoutLabelStyled
          checked={toggleState}
          inline={true}
          onChange={onToggle}
        />
      </div>
      {description === undefined
        ? undefined
        : // eslint-disable-next-line react/no-array-index-key
          description.map((d, i) => <Description key={i} text={d} />)}
      {hideContentIfToggleIsFalse && !toggleState ? undefined : elementToToggle}
    </div>
  ),
);
