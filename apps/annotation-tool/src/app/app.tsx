import { css } from '@emotion/react';
import { memoNamed } from 'react-utils';
import { useObservableValue } from 'synstate-react-hooks';
import { type RectSize } from 'ts-utils-additional';
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
  useSelectedLabel,
  useSideBarIsHidden,
  visibleLabels$,
} from '../store/index.mjs';
import { Sidebar } from './sidebar/index.mjs';

export const App = memoNamed('App', () => {
  const sideBarIsHidden = useSideBarIsHidden();

  const selectedLabel = useSelectedLabel();

  const visibleLabels = useObservableValue(visibleLabels$);

  return (
    <div
      css={css`
        width: 100vw;
        height: 100vh;
        display: flex;
      `}
      data-e2e={'root'}
    >
      <div
        css={css`
          width: calc(100% - ${sidebarWidthPx}px);
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: rgb(121, 121, 121);
        `}
      >
        <AnnotationCanvas
          canvasSize={canvasSize}
          canvasStyles={canvasStyles}
          selectedHue={selectedLabel.hue}
        />
      </div>
      <div
        css={css`
          width: ${sidebarWidthPx}px;
          height: 100%;
          background-color: rgb(245, 245, 245);
        `}
      >
        <Sidebar
          handlers={handlers}
          hidden={sideBarIsHidden}
          labels={labels}
          labelsLightness={lightnessDarker}
          labelsSaturation={saturationDarker}
          selectedLabel={selectedLabel}
          visibleLabels={visibleLabels}
        />
      </div>
    </div>
  );
});

const sidebarWidthPx = 250;

const canvasSize: RectSize = {
  width: 600,
  height: 600,
} as const;

const canvasStyles: AnnotationCanvasStyle = defaultAnnotationCanvasStyle;
