import * as React from 'react';
import { describeRoutes, type AnyRoutes, type Router } from 'synstate-router';
import { useObservableValue } from '../internal/index.mjs';

type Props = Readonly<{
  /** The router to show. */
  router: Router<AnyRoutes>;
}>;

/**
 * A panel that shows the location, the match, the route tree with the matched
 * branch marked, and the last redirects: why a URL matched, or did not, without
 * a debugger. For development only: import it behind `import.meta.env.DEV` with
 * `React.lazy`, so that a production build drops it.
 */
export const RouterDevtools = React.memo<Props>((props) => {
  const { router } = props;

  const location = useObservableValue(router.location);

  const m = useObservableValue(router.match);

  const branch = useObservableValue(router.branch);

  const redirects = useObservableValue(router.redirects);

  const tree = React.useMemo(() => describeRoutes(router.routes), [router]);

  const onBranch = React.useMemo(
    () => new Set(branch.map(({ id }) => id)),
    [branch],
  );

  return (
    <details data-e2e={'router-devtools'} style={panelStyle}>
      <summary>{`Router: ${m.route ?? 'not found'}`}</summary>
      <dl>
        <dt>{'Location'}</dt>
        <dd>
          <code>{location.href}</code>
        </dd>
        <dt>{'Match'}</dt>
        <dd>
          <pre>{JSON.stringify(m, showable, 2)}</pre>
        </dd>
      </dl>
      <table>
        <caption>{'Routes'}</caption>
        <thead>
          <tr>
            <th scope={'col'}>{'Id'}</th>
            <th scope={'col'}>{'Pattern'}</th>
            <th scope={'col'}>{'Search'}</th>
          </tr>
        </thead>
        <tbody>
          {tree.map((node) => (
            <tr
              key={node.id}
              aria-current={onBranch.has(node.id) ? 'location' : undefined}
              style={onBranch.has(node.id) ? matchedStyle : undefined}
            >
              <td>{node.page ? node.id : `${node.id} (page: false)`}</td>
              <td>
                <code>{node.pattern}</code>
              </td>
              <td>{node.search.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <ol aria-label={'Last redirects'}>
        {redirects.map(({ from, to }, index) => (
          // The same redirect can repeat, so the position is the key.
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>{`${from} → ${to}`}</li>
        ))}
      </ol>
    </details>
  );
});

RouterDevtools.displayName = 'RouterDevtools';

/**
 * A value `JSON.stringify` can write: a `bigint`, which a typed history state
 * may hold, would make it throw.
 */
const showable = (_key: string, value: unknown): unknown =>
  typeof value === 'bigint' ? (`${value.toString()}n` as const) : value;

const panelStyle: React.CSSProperties = {
  font: '12px monospace',
  position: 'fixed',
  right: 0,
  bottom: 0,
  maxHeight: '50vh',
  overflow: 'auto',
  background: 'Canvas',
  color: 'CanvasText',
  border: '1px solid GrayText',
  padding: '4px 8px',
} as const;

const matchedStyle: React.CSSProperties = { fontWeight: 'bold' } as const;
