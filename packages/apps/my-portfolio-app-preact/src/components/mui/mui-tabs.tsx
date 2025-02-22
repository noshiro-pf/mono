import { useResizeObserver } from '@noshiro/resize-observer-preact-hooks';
import { useMedia } from 'preact-media-hook';
import { mediaQueries } from '../../constants';

type Props = Readonly<{
  tabIndex: number;
  tabIndexChange: (v: number) => void;
  labels: readonly string[];
  scrollable?: boolean | undefined;
}>;

const tabWidthSmallPx = 72;
const tabWidthMediumPx = 100;

export const MuiTabs = memoNamed<Props>(
  'MuiTabs',
  ({ labels, tabIndex, scrollable = false, tabIndexChange }) => {
    const { matches: mobile } = useMedia(mediaQueries.small);

    const tabWidthPx = mobile ? tabWidthSmallPx : tabWidthMediumPx;

    const [tabWidthList, __, { updateState: updateTabWidthList }] = useState<
      readonly number[]
    >(labels.map(() => tabWidthPx));

    const tabWidthAccumulated = useMemo(
      () => Arr.scan(tabWidthList, (acc, curr) => acc + curr, 0),
      [tabWidthList],
    );

    const labelsWithHandler = useMemo<
      DeepReadonly<
        {
          index: number;
          label: string;
          onClick: () => void;
          onResize: (width: number) => void;
        }[]
      >
    >(
      () =>
        labels.map((label, index) => ({
          index,
          label,
          onClick: () => {
            tabIndexChange(index);
          },
          onResize: (width: number) => {
            updateTabWidthList((prev) => Arr.set(prev, index, width));
          },
        })),
      [labels, tabIndexChange, updateTabWidthList],
    );

    return (
      <Root>
        <TabsScroller scrollable={scrollable}>
          <FlexContainer role={'tablist'}>
            {labelsWithHandler.map(({ index, label, onClick, onResize }) => (
              <Tab
                key={index}
                cyId={`tab-${index}`}
                label={label}
                selected={index === tabIndex}
                tabWidthPx={tabWidthPx}
                onClick={onClick}
                onResize={onResize}
              />
            ))}
          </FlexContainer>
          <TabIndicator
            tabIndex={tabIndex}
            tabWidthAccumulated={tabWidthAccumulated}
            tabWidthList={tabWidthList}
            tabWidthPx={tabWidthPx}
          />
        </TabsScroller>
      </Root>
    );
  },
);

const Root = styled('div')`
  display: flex;
  overflow: hidden;
  min-height: 48px;
  font-size: large;
`;

const TabsScroller = memoNamed<
  Readonly<{
    scrollable: boolean;
    children: preact.ComponentChildren;
  }>
>('TabsWrapper', ({ scrollable, children }) =>
  scrollable ? (
    <TabScrollerStyledScrollable>{children}</TabScrollerStyledScrollable>
  ) : (
    <TabsScrollerBaseStyled>{children}</TabsScrollerBaseStyled>
  ),
);

const TabsScrollerBaseStyled = styled('div')`
  margin-bottom: 0px;
  flex: 1 1 auto;
  display: inline-block;
  position: relative;
  white-space: nowrap;
`;

const TabScrollerStyledScrollable = styled(TabsScrollerBaseStyled)`
  overflow-x: auto;
`;

const FlexContainer = styled('div')`
  display: flex;
`;

const Tab = memoNamed<{
  label: string;
  selected: boolean;
  onClick: () => void;
  tabWidthPx: number;
  onResize: (width: number) => void;
  cyId?: string;
}>('Tab', ({ label, selected, tabWidthPx, onClick, onResize, cyId }) => {
  const style = useMemo(
    () => ({
      minWidth: `${tabWidthPx}px`,
      maxWidth: `${tabWidthPx}px`,
      color: selected ? '#3f51b5' : undefined,
    }),
    [selected, tabWidthPx],
  );

  const [{ width }, ref] = useResizeObserver<HTMLDivElement>();

  useEffect(() => {
    if (width > 0) {
      onResize(width);
    }
  }, [width, onResize]);

  return (
    <div ref={ref}>
      <TabStyled
        aria-selected={selected}
        data-e2e={cyId}
        role={'tab'}
        style={style}
        type={'button'}
        onClick={onClick}
      >
        {label}
      </TabStyled>
    </div>
  );
});

const TabStyled = styled('button')`
  color: inherit;
  border: 0;
  cursor: pointer;
  margin: 0;
  display: inline-flex;
  outline: 0;
  padding: 0;
  position: relative;
  align-items: center;
  user-select: none;
  border-radius: 0;
  vertical-align: middle;
  appearance: none;
  -moz-appearance: none;
  justify-content: center;
  text-decoration: none;
  background-color: transparent;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;

  padding: 6px 12px;
  overflow: hidden;
  position: relative;
  font-size: 0.875rem;
  box-sizing: border-box;
  min-height: 48px;
  text-align: center;
  flex-shrink: 0;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  font-weight: 500;
  line-height: 1.75;
  white-space: nowrap;
  letter-spacing: 0.02857em;

  color: rgba(0, 0, 0, 0.54);
`;

const TabIndicator = memoNamed<
  Readonly<{
    tabIndex: number;
    tabWidthList: readonly number[];
    tabWidthAccumulated: readonly number[];
    tabWidthPx: number;
  }>
>(
  'TabIndicator',
  ({ tabWidthAccumulated, tabWidthList, tabIndex, tabWidthPx }) => {
    const style = useMemo(
      () => ({
        left: `${tabWidthAccumulated[tabIndex] ?? 0}px`,
        width: `${tabWidthList[tabIndex] ?? tabWidthPx}px`,
      }),
      [tabIndex, tabWidthAccumulated, tabWidthList, tabWidthPx],
    );

    return <TabIndicatorStyled style={style} />;
  },
);

const TabIndicatorStyled = styled('span')`
  bottom: 0;
  height: 2px;
  position: absolute;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;

  background-color: #3f51b5;
`;
