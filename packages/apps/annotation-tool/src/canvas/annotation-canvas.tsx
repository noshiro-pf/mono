import { type Hue, type RectSize } from '@noshiro/ts-utils-additional';
import { SampleImage } from '../assets';
import { CanvasMain } from './canvas-main';
import { bgCheckerboardImg } from './img';
import { defaultIdMaker, type AnnotationCanvasStyle } from './types';

type Props = Readonly<{
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Hue;
}>;

export const AnnotationCanvas = memoNamed<Props>(
  'AnnotationCanvas',
  (props: Props) => {
    const idMaker = defaultIdMaker;

    const rootStyle = useMemo<React.CSSProperties>(
      () => ({
        width: `${props.canvasSize.width}px`,
        height: `${props.canvasSize.height}px`,
      }),
      [props.canvasSize],
    );

    const imgWrapperStyle = useMemo<React.CSSProperties>(
      () => ({
        height: '100%',
        padding: `${props.canvasStyles.background.minPaddingPx}px`,
      }),
      [props.canvasStyles.background.minPaddingPx],
    );

    return (
      <div
        css={css`
          background-image: url(${bgCheckerboardImg});
        `}
        style={rootStyle}
      >
        <div
          css={css`
            position: relative;
            width: 100%;
            height: 100%;
          `}
        >
          <div css={absoluteWrapperStyle}>
            <div style={imgWrapperStyle}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img
                css={css`
                  display: block;
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                  user-select: none;
                `}
                src={SampleImage}
              />
            </div>
          </div>
          <div css={absoluteWrapperStyle}>
            <CanvasMain
              canvasSize={props.canvasSize}
              canvasStyles={props.canvasStyles}
              idMaker={idMaker}
              selectedHue={props.selectedHue}
            />
          </div>
        </div>
      </div>
    );
  },
);

const absoluteWrapperStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
