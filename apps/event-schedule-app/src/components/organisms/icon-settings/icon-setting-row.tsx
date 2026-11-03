import { InputGroup } from 'blueprint-synstate';
import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';
import { CustomIcon } from '../../atoms/index.mjs';
import {
  AnswerIconFairPointInput,
  AnswerIconGoodPoint,
  AnswerIconPoorPoint,
} from '../../molecules/index.mjs';
import * as styles from './icon-settings.module.css';

type Props = Readonly<
  {
    answerIcon: Bindable<AnswerIconSetting>;
    onDescriptionChange: (value: string) => void;
  } & (
    | {
        iconId: 'fair';
        onPointChange: (value: AnswerIconPoint) => void;
      }
    | {
        // good と poor の点数は固定なので変更ハンドラを持たない
        iconId: 'good' | 'poor';
        onPointChange?: undefined;
      }
  )
>;

export const AnswerIconRow = ({
  iconId,
  answerIcon,
  onDescriptionChange,
  onPointChange,
}: Props): JSX.Element => (
  <div class={constant(styles.row)}>
    <div class={constant(styles.icon)}>
      <CustomIcon iconName={iconId} />
    </div>
    <div class={constant(styles.description)}>
      <InputGroup
        value={mapBindable(answerIcon, (a) => a.description)}
        onInput={({ currentTarget }) => {
          onDescriptionChange(currentTarget.value);
        }}
      />
    </div>
    <div class={constant(styles.point)}>
      {onPointChange !== undefined ? (
        <div data-e2e={constant('fair-point-input')}>
          <AnswerIconFairPointInput
            disabled={constant(false)}
            value={mapBindable(answerIcon, (a) => a.point)}
            onValueChange={onPointChange}
          />
        </div>
      ) : iconId === 'good' ? (
        <AnswerIconGoodPoint />
      ) : (
        <AnswerIconPoorPoint />
      )}
    </div>
  </div>
);
