import { useStateWithMapFn } from '@noshiro/react-utils';
import {
  pickupHighContrastHues,
  type Hue,
  type Percent,
  type RectSize,
} from '@noshiro/ts-utils-additional';
import {
  AnnotationCanvas,
  defaultAnnotationCanvasStyle,
  type AnnotationCanvasStyle,
  type IdType,
  type Label,
} from '../canvas';
import { type AppEventHandler } from './event-handlers';
import { Sidebar, visibleLabelsReducer } from './sidebar';

const canvasSize: RectSize = {
  width: 600,
  height: 600,
};

const canvasStyles: AnnotationCanvasStyle = defaultAnnotationCanvasStyle;

export const [
  //
  saturationDarker,
  saturationLighter,
]: [Percent, Percent] = [80, 100];

export const [
  //
  lightnessDarker,
  lightnessLighter,
]: [Percent, Percent] = [50, 90];

// const highlightAlpha: Alpha = 0.4;

const labelNames = [
  'Ant',
  'Bat',
  'Cat',
  'Dog',
  'Eagle',
  'Falcon',
  'Giraffe',
  'Horse',
] as const;
type LabelLen = typeof labelNames['length'];

const hues = pickupHighContrastHues(
  labelNames.length,
  saturationDarker,
  lightnessDarker
) as ArrayOfLength<LabelLen, Hue>;

const labels: NonEmptyArray<Label> = pipe(Arr.zip(hues, labelNames)).chain(
  (list) =>
    Arr.map(
      list,
      ([hue, labelName]: readonly [Hue, string], index): Label => ({
        id: index.toString(),
        hue,
        name: labelName,
      })
    )
).value;

const labelInit: Label = labels[0];

export const App = memoNamed('App', () => {
  const { state: hidden, setTrue: hide, setFalse: show } = useBoolState(false);

  const [visibleLabelIndices, visibleLabelIndicesDispatcher] = useReducer(
    visibleLabelsReducer,
    labels.map(() => true)
  );

  const [selectedLabel, selectLabel] = useStateWithMapFn<Label, IdType>(
    labelInit,
    (labelId) => labels.find((l) => l.id === labelId) ?? labelInit
  );

  const handlers = useMemo<AppEventHandler>(
    () => ({
      collapseLabelList: hide,
      expandLabelList: show,
      showAllLabels: () => {
        visibleLabelIndicesDispatcher({ type: 'show-all' });
      },
      hideAllLabels: () => {
        visibleLabelIndicesDispatcher({ type: 'hide-all' });
      },
      flipLabelVisibility: (labelId) => {
        const index = labels.findIndex((l) => l.id === labelId);
        visibleLabelIndicesDispatcher({ type: 'flip', index });
      },
      selectLabel,
    }),
    [hide, show, selectLabel]
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const visibleLabels = labels.filter((_, i) => visibleLabelIndices[i]!);

  return (
    <Root>
      <CanvasWrapper>
        <AnnotationCanvas
          canvasSize={canvasSize}
          canvasStyles={canvasStyles}
          selectedHue={selectedLabel.hue}
        />
      </CanvasWrapper>
      <SideBarWrapper>
        <Sidebar
          handlers={handlers}
          hidden={hidden}
          labels={labels}
          labelsLightness={lightnessDarker}
          labelsSaturation={saturationDarker}
          selectedLabel={selectedLabel}
          visibleLabels={visibleLabels}
        />
      </SideBarWrapper>
    </Root>
  );
});

const sidebarWidthPx = 250;

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
`;

const CanvasWrapper = styled.div`
  width: calc(100% - ${sidebarWidthPx}px);
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(121, 121, 121);
`;

const SideBarWrapper = styled.div`
  width: ${sidebarWidthPx}px;
  height: 100%;
  background-color: rgb(245, 245, 245);
`;