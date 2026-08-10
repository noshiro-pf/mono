import * as React from 'react';

type Props = Readonly<{
  alt: string;
  slidesPath: string;
  numSlides: number;
}>;

export const SvgSlideshow = React.memo<Props>((props) => {
  const { alt, slidesPath, numSlides } = props;

  const [index, setIndex] = React.useState(0);

  const isFirst = index === 0;

  const isLast = index === numSlides - 1;

  const goFirst = React.useCallback(() => {
    setIndex(0);
  }, []);

  const goPrev = React.useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = React.useCallback(() => {
    setIndex((i) => Math.min(numSlides - 1, i + 1));
  }, [numSlides]);

  const goLast = React.useCallback(() => {
    setIndex(numSlides - 1);
  }, [numSlides]);

  const fileName = React.useMemo(
    () => String(index + 1).padStart(2, '0'),
    [index],
  );

  return (
    <div style={wrapperStyle}>
      <div style={imageContainerStyle}>
        <img
          alt={`${alt} step ${index + 1} of ${numSlides}`}
          src={`${slidesPath}/${fileName}.svg`}
          style={imageStyle}
        />
      </div>
      <div style={controlsStyle}>
        <button
          aria-label={'First slide'}
          disabled={isFirst}
          style={isFirst ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={isFirst ? noop : goFirst}
        >
          &#9664;&#9664;
        </button>
        <button
          aria-label={'Previous slide'}
          disabled={isFirst}
          style={isFirst ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={isFirst ? noop : goPrev}
        >
          &#9664; {'Prev'}
        </button>
        <span style={counterStyle}>{`${index + 1} / ${numSlides}`}</span>
        <button
          aria-label={'Next slide'}
          disabled={isLast}
          style={isLast ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={isLast ? noop : goNext}
        >
          {'Next '}&#9654;
        </button>
        <button
          aria-label={'Last slide'}
          disabled={isLast}
          style={isLast ? buttonDisabledStyle : buttonEnabledStyle}
          type={'button'}
          onClick={isLast ? noop : goLast}
        >
          &#9654;&#9654;
        </button>
      </div>
    </div>
  );
});

SvgSlideshow.displayName = 'SvgSlideshow';

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  margin: '1rem 0',
} as const;

const imageContainerStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
} as const;

const imageStyle: React.CSSProperties = {
  maxWidth: '100%',
  height: 'auto',
} as const;

const controlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
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

const counterStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  minWidth: '4rem',
  textAlign: 'center',
} as const;

const noop = (): void => {};
