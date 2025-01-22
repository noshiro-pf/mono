import { type RectSize } from '@noshiro/ts-utils-additional';
import {
  AnnotationCanvas,
  defaultAnnotationCanvasStyle,
  type AnnotationCanvasStyle,
} from '../canvas';
import { labels, lightnessDarker, saturationDarker } from '../constants';
import {
  handlers,
  useSelectedLabel,
  useSideBarIsHidden,
  visibleLabels$,
} from '../store';
import { Sidebar } from './sidebar';

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
};

const canvasStyles: AnnotationCanvasStyle = defaultAnnotationCanvasStyle;
