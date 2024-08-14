type Props = Readonly<{
  xy: readonly (readonly [number, number])[];
  max: number;
  numSample: number;
}>;

export const HistogramView = memoNamed<Props>(
  'HistogramView',
  ({ xy, max, numSample }) => (
    <div
      css={css`
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      `}
    >
      <div
        css={css`
          height: ${textHeightPx}px;
        `}
      >
        <div
          css={css`
            padding: 5px;
          `}
          data-cy={'roll-count'}
        >
          {'N = '}
          {numSample}
        </div>
      </div>
      <div
        css={css`
          height: calc(100% - ${textHeightPx}px);
          display: flex;
          flex-direction: row;
        `}
      >
        {xy.map(([x, y]) => (
          <div
            key={x}
            css={css`
              width: calc(100% / 11);
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: stretch;
            `}
          >
            <div
              css={css`
                width: 100%;
                height: calc(100% - ${textHeightPx}px);
                display: flex;
                flex-direction: column;
                justify-content: flex-end;
                background-color: #f7f7f7;
                padding: 5px 1px 0 1px;
              `}
            >
              <div
                css={css`
                  width: 100%;
                  background-color: #ff6f3f;
                  display: flex;
                  flex-direction: column;
                  justify-content: flex-start;
                  align-items: center;
                  padding: 5% 0;
                  font-weight: bold;
                  height: ${Num.isPositive(max) ? Num.div(100 * y, max) : 0}%;
                `}
              >
                {y > 0 ? y : ''}
              </div>
            </div>
            <div
              css={css`
                width: 100%;
                height: ${textHeightPx}px;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
              `}
            >
              {x}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
);

const textHeightPx = 30;
