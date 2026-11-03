// Compares each component's markup with Blueprint React's for the same props,
// since the library promises Blueprint's markup so that Blueprint's style
// sheets draw it, and a test written from what its author expected can drift
// from Blueprint unnoticed. `visual-parity.test.tsx` compares how the same
// cases are drawn.
import type { ReactElement } from 'react';
import { render, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { cases, mountBlueprint } from './blueprint-cases.js';
import { linesOf } from './markup-lines.mjs';

describe('markup', () => {
  test.each(cases)('%s matches Blueprint React', (_name, theirs, ours) => {
    const blueprint = renderBlueprint(theirs.element);

    const synstate = renderSynstate(ours);

    assert.deepStrictEqual(
      synstate,
      theirs.deliberate.reduce<readonly string[]>(
        (lines, adjust) =>
          Arr.generate(function* () {
            for (const line of lines) {
              const adjusted = adjust(line);

              if (adjusted !== undefined) {
                yield adjusted;
              }
            }
          }),
        blueprint,
      ),
    );
  });
});

/**
 * A container in the document, removed when the test finishes, failed or not,
 * so that a failing case leaves nothing behind for the cases after it.
 */
const attached = (): HTMLDivElement => {
  const container = document.createElement('div');

  document.body.append(container);

  onTestFinished(() => {
    container.remove();
  });

  return container;
};

const renderBlueprint = (element: () => ReactElement): readonly string[] => {
  const container = attached();

  onTestFinished(mountBlueprint(element, container));

  return linesOf(container);
};

const renderSynstate = (app: () => JSX.Element): readonly string[] => {
  const container = attached();

  onTestFinished(render(app, container));

  return linesOf(container);
};
