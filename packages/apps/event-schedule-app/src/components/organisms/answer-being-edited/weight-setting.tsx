import { WeightNumericInput } from '../../molecules';

const dc = dict.answerPage.answerBeingEdited;

export type WeightSettingProps = Readonly<{
  weight: Weight;
  onWeightChange: (v: Weight) => void;
}>;

export const WeightSetting = memoNamed<WeightSettingProps>(
  'WeightSetting',
  ({ weight, onWeightChange }) => (
    <div
      css={css`
        display: flex;
        align-items: center;
      `}
    >
      <div
        css={css`
          flex: 0 0 120px;
        `}
      >
        <WeightNumericInput weight={weight} onWeightChange={onWeightChange} />
      </div>
      <div
        css={css`
          margin-left: 5px;
        `}
      >
        {dc.weight.suffix}
      </div>
    </div>
  ),
);
