import { useResizeObserver } from '@noshiro/resize-observer-react-hooks';
import { type Rect } from '@noshiro/ts-utils-additional';
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

  const [rootSize, rootRef] =
    useResizeObserver<HTMLDivElement>(canvasDefaultSize);

  console.log(rootSize);

  return (
    <div
      ref={rootRef}
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
          canvasSize={rootSize}
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

const canvasDefaultSize: Rect = {
  top: 0,
  left: 0,
  width: 800,
  height: 600,
};

const canvasStyles: AnnotationCanvasStyle = defaultAnnotationCanvasStyle;
