import { Switch } from 'blueprint-synstate';
import type { InitializedObservable } from 'synstate';
import {
  constant,
  For,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { Description } from '../atoms/index.mjs';
import * as styles from './paragraph-with-switch.module.css';

type Props = Readonly<{
  title: string;
  /** Lines under the title; an `InlineMap` of them for lines that change. */
  description?: InitializedObservable<readonly string[]> | readonly string[];
  toggleState: Bindable<boolean>;
  onToggle: () => void;
  elementToToggle: Child;
}>;

/** A setting turned on and off by the switch beside its title. */
export const ParagraphWithSwitch = ({
  elementToToggle,
  onToggle,
  title,
  toggleState,
  description,
}: Props): JSX.Element => (
  <div>
    <div class={constant(styles.titleRow)}>
      <div>{constant(title)}</div>
      <Switch
        aria-label={constant(title)}
        checked={toggleState}
        class={styles.switchControl}
        inline
        onChange={onToggle}
      />
    </div>
    {description === undefined ? (
      []
    ) : isLines(description) ? (
      description.map((d) => <Description text={constant(d)} />)
    ) : (
      <For items={description} key={(_, index) => index}>
        {(line$) => <Description text={line$} />}
      </For>
    )}
    {elementToToggle}
  </div>
);

const isLines = (
  description: InitializedObservable<readonly string[]> | readonly string[],
): description is readonly string[] => Arr.isArray(description);
