import { Arr } from 'ts-data-forge';
import * as t from 'ts-fortress';

/**
 * `repo-settings/variables/settings.json` の型。
 *
 * Settings > Secrets and variables > Actions > Variables に対応する
 * (`GET|POST /repos/{owner}/{repo}/actions/variables`,
 * `PATCH /repos/{owner}/{repo}/actions/variables/{name}`)。
 *
 * 変数名をキー、値を値にした素の record にしてある。 API が返す配列
 * (`{ name, value, created_at, updated_at }[]`) をそのまま写さないのは、
 * `created_at` / `updated_at` が値の変化なしに動くためで、 `bk/` に入れると
 * 毎日ドリフトとして出てしまう。ここで持つのは宣言できるものだけ。
 *
 * **ここに秘密を書かないこと。** repository variable は API でも Actions の
 * ログでも平文で読める。秘密は secret 側で、そちらはこのツールの管理外にある。
 */
export const RepositoryVariables = t.keyValueRecord(t.string(), t.string(), {
  typeName: 'RepositoryVariables',
});

export type RepositoryVariables = t.TypeOf<typeof RepositoryVariables>;

/**
 * GitHub が受け付けない変数名を、送る前にすべて挙げて落とす。
 *
 * 名前は `PATCH .../actions/variables/{name}` のパスに入る。 octokit が URL
 * エンコードするので注入にはならないが、弾かれる名前は 422 になり、それが
 * 起きるのは**何本か書き込んだ後**である。 environments の `assertConsistent`
 * と同じ理由でここに置いてある — 1 本目を送る前に全部の名前を見ておけば、
 * この種の間違いで中途半端に適用された状態にはならない。
 *
 * 規則は GitHub の documentation のとおり: 英数字と `_` のみ、先頭に数字は
 * 不可、`GITHUB_` 始まりは予約。名前の大文字小文字は区別されないので、
 * 予約接頭辞の判定も区別しない。
 */
export const assertVariableNamesAreValid = (
  variables: RepositoryVariables,
): void => {
  const offenders = Object.keys(variables).filter(
    (name) => !isValidVariableName(name),
  );

  if (Arr.isNonEmpty(offenders)) {
    throw new Error(
      [
        `repository variable の名前として使えないものがあります: ${offenders
          .map((name) => JSON.stringify(name))
          .join(', ')}。`,
        '英数字と "_" のみが使え、先頭に数字は置けず、"GITHUB_" 始まりは予約されています。',
      ].join('\n'),
    );
  }
};

/** 先頭は英字か `_`、以降は英数字か `_`。入れ子の量化子は無いので線形。 */
const variableNamePattern = /^[A-Za-z_][A-Za-z0-9_]*$/u;

const isValidVariableName = (name: string): boolean =>
  variableNamePattern.test(name) && !name.toUpperCase().startsWith('GITHUB_');
