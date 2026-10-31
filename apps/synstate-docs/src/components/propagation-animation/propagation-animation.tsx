import * as React from 'react';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { Lang } from '../constants.mjs';
import { AnimationDrawing } from './animation-drawing.jsx';
import { colors } from './animation-shared.mjs';
import type { Trace } from './frame.mjs';
import {
  diamondScenario,
  filterDiamondScenario,
  rxjsDiamondScenario,
} from './scenarios.mjs';
import { simulatePriorityQueue } from './simulate-priority-queue.mjs';
import { simulateRxjs } from './simulate-rxjs.mjs';
import { simulateSynState } from './simulate-synstate.mjs';
import { StableCaption } from './stable-caption.jsx';

type Props = Readonly<{
  animation: AnimationName;
  lang: Lang;
}>;

/**
 * Steps through how one propagation algorithm updates a small graph, with a
 * caption and the pseudo-code line for each step.
 */
export const PropagationAnimation = React.memo<Props>((props) => {
  const { animation, lang } = props;

  const anim = React.useMemo(() => animations[animation](), [animation]);

  const animFrames = anim.frames;

  const captions = React.useMemo(
    () => animFrames.map((f) => f.caption[lang]),
    [animFrames, lang],
  );

  const lastIndex = Math.max(0, animFrames.length - 1);

  const [index, setIndex] = React.useState(0);

  const [playing, setPlaying] = React.useState(false);

  const reduceMotion = React.useMemo(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  React.useEffect(() => {
    if (!playing) {
      return undefined;
    }

    if (index >= lastIndex) {
      setPlaying(false);

      return undefined;
    }

    const timer = setTimeout(() => {
      setIndex((i) => Math.min(lastIndex, i + 1));
    }, stepIntervalMs);

    return () => {
      clearTimeout(timer);
    };
  }, [playing, index, lastIndex]);

  const togglePlay = React.useCallback(() => {
    if (playing) {
      setPlaying(false);
    } else {
      if (index >= lastIndex) {
        setIndex(0);
      }

      setPlaying(true);
    }
  }, [playing, index, lastIndex]);

  const goFirst = React.useCallback(() => {
    setPlaying(false);

    setIndex(0);
  }, []);

  const goPrev = React.useCallback(() => {
    setPlaying(false);

    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = React.useCallback(() => {
    setPlaying(false);

    setIndex((i) => Math.min(lastIndex, i + 1));
  }, [lastIndex]);

  const goLast = React.useCallback(() => {
    setPlaying(false);

    setIndex(lastIndex);
  }, [lastIndex]);

  const frame = animFrames[index];

  if (frame === undefined) {
    return undefined;
  }

  const isFirst = index === 0;

  const isLast = index === lastIndex;

  return (
    <figure style={figureStyle}>
      <AnimationDrawing
        animation={anim}
        frame={frame}
        reduceMotion={reduceMotion}
      />
      <div style={belowStyle}>
        <StableCaption
          captions={captions}
          current={frame.caption[lang]}
          style={captionStyle}
        />
        <pre style={codeStyle}>
          {anim.code.map(([id, text]) => (
            <span
              key={id}
              style={
                frame.code.includes(id) ? codeLineActiveStyle : codeLineStyle
              }
            >
              {text === '' ? ' ' : text}
            </span>
          ))}
        </pre>
      </div>
      <div style={controlsStyle}>
        <button
          aria-label={'First step'}
          disabled={isFirst}
          style={isFirst ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={goFirst}
        >
          {'⏮'}
        </button>
        <button
          aria-label={'Previous step'}
          disabled={isFirst}
          style={isFirst ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={goPrev}
        >
          {'◀ Prev'}
        </button>
        <button
          aria-label={playing ? 'Pause' : 'Play'}
          style={playButtonStyle}
          type={'button'}
          onClick={togglePlay}
        >
          {playing ? '❚❚ Pause' : isLast ? '↻ Replay' : '▶ Play'}
        </button>
        <button
          aria-label={'Next step'}
          disabled={isLast}
          style={isLast ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={goNext}
        >
          {'Next ▶'}
        </button>
        <button
          aria-label={'Last step'}
          disabled={isLast}
          style={isLast ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={goLast}
        >
          {'⏭'}
        </button>
        <span
          style={counterStyle}
        >{`${(index + 1).toString()} / ${animFrames.length.toString()}`}</span>
      </div>
    </figure>
  );
});

PropagationAnimation.displayName = 'PropagationAnimation';

export type AnimationName =
  'rxjs' | 'priorityQueue' | 'synstateDiamond' | 'synstateFilterDiamond';

const animations: ReadonlyRecord<AnimationName, () => Trace> = {
  rxjs: () => simulateRxjs(rxjsDiamondScenario),
  priorityQueue: () => simulatePriorityQueue(diamondScenario),
  synstateDiamond: () => simulateSynState(diamondScenario, { tokens: false }),
  synstateFilterDiamond: () =>
    simulateSynState(filterDiamondScenario, { tokens: true }),
} as const;

const stepIntervalMs = 2200;

const figureStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '0.75rem',
  margin: '1.5rem 0',
} as const;

const belowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.75rem',
  alignItems: 'flex-start',
  marginTop: 0,
} as const;

const captionStyle: React.CSSProperties = {
  flex: '1 1 16rem',
  margin: 0,
  fontSize: '0.95rem',
  lineHeight: 1.6,
} as const;

const codeStyle: React.CSSProperties = {
  flex: '1 1 20rem',
  display: 'flex',
  flexDirection: 'column',
  margin: 0,
  padding: '0.5rem 0',
  fontSize: '0.78rem',
  lineHeight: 1.45,
  background: colors.background,
  color: colors.mutedText,
  borderRadius: '6px',
  overflowX: 'auto',
} as const;

const codeLineStyle: React.CSSProperties = {
  padding: '0 0.75rem',
  whiteSpace: 'pre',
} as const;

const codeLineActiveStyle: React.CSSProperties = {
  ...codeLineStyle,
  background: 'rgba(255, 64, 129, 0.25)',
  color: colors.text,
} as const;

const controlsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.6rem',
  marginTop: 0,
} as const;

const buttonBaseStyle: React.CSSProperties = {
  padding: '0.4rem 0.8rem',
  borderRadius: '4px',
  border: '1px solid #888',
  background: 'transparent',
  color: 'inherit',
  fontSize: '0.9rem',
  marginTop: 0, // overrides astro starlight default style
} as const;

const buttonEnabledStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  cursor: 'pointer',
} as const;

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonBaseStyle,
  cursor: 'default',
  opacity: 0.4,
} as const;

const playButtonStyle: React.CSSProperties = {
  ...buttonEnabledStyle,
  minWidth: '7rem',
  fontWeight: 600,
} as const;

const counterStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  minWidth: '4rem',
  textAlign: 'center',
} as const;
