import { constant, mapBindable, type JSX } from 'synstate-dom';
import type { RectSize } from 'ts-utils-additional';
import {
  AnnotationCanvas,
  defaultAnnotationCanvasStyle,
  type AnnotationCanvasStyle,
} from '../canvas/index.mjs';
import {
  labels,
  lightnessDarker,
  saturationDarker,
} from '../constants/index.mjs';
import {
  handlers,
  labelListIsCollapsed$,
  labelVisibilityFlags$,
  selectedLabel$,
} from '../store/index.mjs';
import * as styles from './app.module.css';
import { Sidebar } from './sidebar/index.mjs';

export const App = (): JSX.Element => (
  <div class={constant(styles.root)} data-e2e={constant('root')}>
    <div class={constant(styles.canvasArea)}>
      <AnnotationCanvas
        canvasSize={canvasSize}
        canvasStyles={canvasStyles}
        selectedHue={mapBindable(selectedLabel$, (label) => label.hue)}
      />
    </div>
    <div class={constant(styles.sidebarArea)}>
      <Sidebar
        handlers={handlers}
        hidden={labelListIsCollapsed$}
        labels={labels}
        labelsLightness={lightnessDarker}
        labelsSaturation={saturationDarker}
        selectedLabel={selectedLabel$}
        visibleLabelFlags={labelVisibilityFlags$}
      />
    </div>
  </div>
);

const canvasSize: RectSize = {
  width: 600,
  height: 600,
} as const;

const canvasStyles: AnnotationCanvasStyle = defaultAnnotationCanvasStyle;
