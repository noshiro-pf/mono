import { constant, type Bindable, type JSX } from 'synstate-dom';
import type { Hue, RectSize } from 'ts-utils-additional';
import { SampleImage } from '../assets/index.mjs';
import * as styles from './annotation-canvas.module.css';
import { CanvasMain } from './canvas-main.js';
import { bgCheckerboardImg } from './img/index.mjs';
import { defaultIdMaker, type AnnotationCanvasStyle } from './types/index.mjs';

type Props = Readonly<{
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Bindable<Hue>;
}>;

/** The sample image on a checkerboard, under the canvas boxes are drawn on. */
export const AnnotationCanvas = ({
  canvasStyles,
  canvasSize,
  selectedHue,
}: Props): JSX.Element => (
  <div
    style={{
      'background-image': constant(`url(${bgCheckerboardImg})`),
      width: constant(`${canvasSize.width}px`),
      height: constant(`${canvasSize.height}px`),
    }}
  >
    <div class={constant(styles.root)}>
      <div class={constant(styles.layer)}>
        <div
          class={constant(styles.imageWrapper)}
          style={{
            padding: constant(`${canvasStyles.background.minPaddingPx}px`),
          }}
        >
          {/* A sample to draw on, with nothing to say about it. */}
          <img
            alt={constant('')}
            class={constant(styles.image)}
            data-e2e={constant('sample-image')}
            src={constant(SampleImage)}
          />
        </div>
      </div>
      <div class={constant(styles.layer)}>
        <CanvasMain
          canvasSize={canvasSize}
          canvasStyles={canvasStyles}
          idMaker={defaultIdMaker}
          selectedHue={selectedHue}
        />
      </div>
    </div>
  </div>
);
