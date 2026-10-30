import { constant, mapBindable, type Bindable, type JSX } from 'synstate-dom';

type Props<T> = Readonly<{
  label: string;
  selectedId: Bindable<T>;
  buttons: readonly Readonly<{
    id: T;
    displayName: string;
  }>[];
  onClick: (id: T) => void;
}>;

/**
 * Bootstrap の `btn-group` を真似た、一つだけ選べるボタンの並び。見た目は
 * `index.css` の `.button-group` で、選ばれているものに `selected` が付く。
 *
 * 中身は radio の組なので、キーボードでは組ごとに Tab で入り、矢印キーで選び
 * 直せる。radio 自体は見えなくしてある。
 */
export const ButtonGroup = <T,>({
  label,
  selectedId,
  buttons,
  onClick,
}: Props<T>): JSX.Element => {
  // 同じ `label` の組が二つあっても一つの radio の組にならないよう、名前は
  // 呼ばれるたびに変える。
  const name = nextGroupName();

  return (
    <div
      aria-label={constant(label)}
      class={constant('button-group')}
      role={constant('radiogroup')}
    >
      {buttons.map((btn) => {
        const selected = mapBindable(selectedId, (id) => id === btn.id);

        return (
          <label class={{ selected }}>
            <input
              // synstate-dom は書いた順に設定するので、radio にしてから選ぶ。
              type={constant('radio')}
              name={constant(name)}
              // 再読み込みで store と食い違う選択をブラウザが戻さないように。
              autocomplete={constant('off')}
              checked={selected}
              onChange={() => {
                onClick(btn.id);
              }}
            />
            {constant(btn.displayName)}
          </label>
        );
      })}
    </div>
  );
};

const nextGroupName = (() => {
  let mut_count = 0;

  return (): string => {
    mut_count += 1;

    return `button-group-${mut_count}`;
  };
})();
