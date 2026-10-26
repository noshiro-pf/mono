/**
 * A scenario: a screen whose figures are derived from a few inputs through a
 * graph (with diamonds of many lengths, or where most changes stop partway),
 * as opposed to the table of js-framework-benchmark, where each row depends
 * on its own data only.
 *
 * Every scenario computes many values and shows few of them ("compute big,
 * display small"), so that what is timed is mostly the propagation through
 * the graph rather than the DOM.
 */
export type ScenarioFramework<App> = Readonly<{
  name: string;
  /** Mounts the screen, with its initial inputs, into `container`. */
  mount: (container: HTMLElement) => App;
}>;

/** What every scenario app provides besides its own inputs. */
export type ScenarioAppBase = Readonly<{ dispose: () => void }>;

/**
 * A change to the inputs of a freshly mounted screen, and the change back.
 * Both are timed, alternately: they reach the same figures, so each costs
 * what the other does.
 */
export type ScenarioCase<App> = Readonly<{
  name: string;
  apply: (app: App) => void;
  /** Brings the inputs back to the initial ones. */
  revert: (app: App) => void;
  /** The text of every cell of every row once `apply` has run. */
  expected: Cells;
}>;

export type Scenario<App extends ScenarioAppBase> = Readonly<{
  /** The name of the timed `mount`, which builds the whole graph. */
  buildName: string;
  /** The text of every cell of every row right after `mount`. */
  initial: Cells;
  cases: readonly ScenarioCase<App>[];
  frameworks: readonly ScenarioFramework<App>[];
}>;

/** The text of each cell, row by row, in document order. */
export type Cells = readonly (readonly string[])[];
