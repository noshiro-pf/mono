import { mountable, mountChild, type JSX } from 'synstate-dom-next';
import { counter, map, withInitialValue } from 'synstate-next';

// A canvas drawn by hand, with a caption the JSX way.
export const Sparkline = ({
  points,
}: Readonly<{ points: readonly number[] }>): JSX.Element =>
  mountable(() => {
    const figure = document.createElement('figure');

    const canvas = document.createElement('canvas');

    const context = canvas.getContext('2d');

    for (const [x, y] of points.entries()) {
      context?.fillRect(x * 4, 40 - y, 3, y);
    }

    figure.append(canvas);

    // Mounted in this description's owner: the counter, and the text that
    // follows it, go when the sparkline is unmounted.
    mountChild(
      <figcaption>
        {counter(1000)
          .pipe(map((s) => `drawn ${s + 1} s ago`))
          .pipe(withInitialValue('drawn just now'))}
      </figcaption>,
      figure,
    );

    return figure;
  });
