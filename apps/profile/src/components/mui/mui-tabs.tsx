import { MuiTabs as SharedMuiTabs } from 'mui-look';
import type { InitializedObservable } from 'synstate';
import type { JSX } from 'synstate-dom';
import { indicator, list, root, scroller, tab } from './mui-tabs.module.css';

type Props = Readonly<{
  labels: readonly string[];
  tabIndex: InitializedObservable<number>;
  /** Called when another tab is clicked; the selected one does nothing. */
  tabIndexChange: (tabIndex: number) => void;
}>;

/**
 * mui-look's `MuiTabs` in the look of MUI v4's scrollable `Tabs` with the
 * default theme. Every tab has the same width, which the stylesheet sets, so
 * the indicator is placed by the selected index alone.
 */
export const MuiTabs = (props: Props): JSX.Element => (
  <SharedMuiTabs {...props} classes={classes} />
);

const classes = { root, scroller, list, tab, indicator } as const;
