/**
 * The smallest application each library can be measured on: a button that
 * shows a count and adds one to it when clicked. `scripts/measure-bundle-size.mts`
 * bundles it to tell what a library costs before any application code.
 */
export type CounterFramework = Readonly<{
  name: string;
  /** Mounts the button into `container`; the result unmounts it. */
  mount: (container: HTMLElement) => () => void;
}>;
