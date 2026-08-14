import { css } from '@emotion/react';
import { SwitchWithoutLabelStyled } from 'react-blueprintjs-utils';
import { memoNamed } from 'react-utils';
import { mapOptional } from '../../utils-ported/index.mjs';
import { Description } from '../atoms/index.mjs';

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
          inline
          onChange={onToggle}
        />
      </div>
      {mapOptional(
        description,
        // eslint-disable-next-line react/no-array-index-key
        (s) => s.map((d, i) => <Description key={i} text={d} />),
      )}
      {hideContentIfToggleIsFalse && !toggleState ? undefined : elementToToggle}
    </div>
  ),
);
