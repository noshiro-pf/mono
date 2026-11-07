import { constant, mountable, mountChild, type JSX } from 'synstate-dom-next';

// Mounts `children`, or `fallback` when mounting them throws. What the children
// made before the throw is disposed by `mountChild`, so nothing of them stays.
export const ErrorBoundary = ({
  children,
  fallback,
}: Readonly<{ children: JSX.Element; fallback: JSX.Element }>): JSX.Element =>
  mountable(() => {
    const box = document.createElement('div');

    try {
      mountChild(children, box);
    } catch (error) {
      console.error(error);

      mountChild(fallback, box);
    }

    return box;
  });

export const Page = (): JSX.Element => (
  <ErrorBoundary fallback={<p>{constant('Something went wrong.')}</p>}>
    <Chart />
  </ErrorBoundary>
);

const Chart = (): JSX.Element => {
  throw new Error('no data');
};
