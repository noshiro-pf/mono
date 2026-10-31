import * as React from 'react';
import { traceCode } from './simulate-trace.mjs';
import { colors } from './trace-shared.mjs';

type Props = Readonly<{ active: readonly string[] }>;

/** The source, with the lines this step runs highlighted and in view. */
export const TraceCode = React.memo<Props>((props) => {
  const { active } = props;

  const ref = React.useRef<HTMLPreElement>(null);

  React.useLayoutEffect(() => {
    const pre = ref.current;

    const ids = traceCode.map(([id]) => id).filter((id) => active.includes(id));

    const first = ids.at(0);

    const last = ids.at(-1);

    if (pre === null || first === undefined || last === undefined) {
      return;
    }

    const firstLine = pre.querySelector<HTMLElement>(
      `[data-line="${CSS.escape(first)}"]`,
    );

    const lastLine = pre.querySelector<HTMLElement>(
      `[data-line="${CSS.escape(last)}"]`,
    );

    if (firstLine === null || lastLine === null) {
      return;
    }

    const firstTop = firstLine.offsetTop;

    const bottom = lastLine.offsetTop + lastLine.offsetHeight;

    // Centers the lines run, or, when they do not fit, keeps the last ones in
    // view: those are the lines the step is about. Scrolls the pane only, never
    // the page.
    pre.scrollTop = Math.max(
      0,
      bottom - firstTop <= pre.clientHeight
        ? firstTop - (pre.clientHeight - (bottom - firstTop)) / 2
        : bottom - pre.clientHeight,
    );
  }, [active]);

  return (
    <pre ref={ref} className={'propagation-trace-code'} style={codeStyle}>
      {traceCode.map(([id, text]) => (
        <span
          key={id}
          data-line={id}
          style={active.includes(id) ? codeLineActiveStyle : codeLineStyle}
        >
          {text === '' ? ' ' : text}
        </span>
      ))}
    </pre>
  );
});

TraceCode.displayName = 'TraceCode';

const codeStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  padding: '0.5rem 0',
  fontSize: '0.75rem',
  lineHeight: 1.45,
  background: colors.background,
  color: colors.muted,
  borderRadius: '6px',
  overflow: 'auto',
  position: 'relative',
} as const;

const codeLineStyle: React.CSSProperties = {
  padding: '0 0.75rem',
  whiteSpace: 'pre',
  marginTop: 0,
} as const;

const codeLineActiveStyle: React.CSSProperties = {
  ...codeLineStyle,
  background: 'rgba(255, 64, 129, 0.25)',
  color: colors.text,
} as const;
