import { createElement } from 'preact';

type PropsTyped<T> = DeepReadonly<{
  selectedId: T;
  buttons: {
    id: T;
    displayName: string;
  }[];
  onClick: (id: T) => void;
}>;

type Props = PropsTyped<string>;

export const ButtonGroupTyped = <T,>(
  props: PropsTyped<T>,
): preact.VNode<PropsTyped<T>> | null =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  createElement(
    ButtonGroup,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    props as unknown as Props,
  ) as unknown as preact.VNode<PropsTyped<T>>;

export const ButtonGroup = memoNamed<Props>(
  'ButtonGroup',
  ({ buttons, selectedId, onClick }) => {
    const buttonWithHandler = useMemo(
      () =>
        buttons.map((btn) =>
          Obj.merge(btn, {
            onClick: () => {
              onClick(btn.id);
            },
          }),
        ),
      [buttons, onClick],
    );

    return (
      // eslint-disable-next-line jsx-a11y/aria-role
      <Root role={'radio-group'}>
        {buttonWithHandler.map((btn) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
          <div
            key={btn.id}
            className={btn.id === selectedId ? 'selected' : undefined}
            onClick={btn.onClick}
          >
            {btn.displayName}
          </div>
        ))}
      </Root>
    );
  },
);

const Root = styled('div')`
  position: relative;
  display: inline-flex;
  vertical-align: middle;

  & > * {
    &:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    &:not(:first-child) {
      margin-left: -1px;
    }

    &:active {
      z-index: 1;
    }

    &:focus {
      box-shadow: 0 0 0 0.2rem #007bff80;
    }

    &:not(:disabled) {
      cursor: pointer;
    }

    margin-bottom: 0;
    position: relative;
    flex: 1 1 auto;

    display: inline-block;
    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;

    border-color: #007bff;

    &:not(.selected) {
      color: #007bff;
    }
    &.selected {
      color: #fff;
      background-color: #007bff;
    }
  }
`;
