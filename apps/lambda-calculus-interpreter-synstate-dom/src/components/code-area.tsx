import { type Bindable, constant, type JSX } from 'synstate-dom';
import * as styles from './code-area.module.css';

type Props = Readonly<{
  value: Bindable<string>;
  valueChange?: (value: string) => void;
  minHeightPx: number;
  maxHeightPx: number;
  e2eId: string;
}>;

export const CodeArea = ({
  value,
  valueChange,
  minHeightPx,
  maxHeightPx,
  e2eId,
}: Props): JSX.Element => (
  <textarea
    class={constant(styles.textArea)}
    data-e2e={constant(e2eId)}
    style={{
      'min-height': constant(`${minHeightPx}px`),
      'max-height': constant(`${maxHeightPx}px`),
    }}
    value={value}
    // Without a handler the area shows output only.
    readOnly={constant(valueChange === undefined)}
    onInput={(ev) => {
      valueChange?.(ev.currentTarget.value);
    }}
  />
);
