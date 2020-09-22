# Immutable.Record を使った型定義手順書

`XYZ`という型を定義する場合の例．

- 型定義

```ts
interface IXYZ {
  /* members */
}

export type IXYZJS {
  /* members */
}

export type TXYZ = Record<IXYZ> & Readonly<IXYZ>;
```

- 生成用関数定義

```ts
/**
 * - `Partial<IXYZ>`を受け取りデフォルト値で埋めて返す関数．
 * - 引数無しでデフォルト値のXYZを返す．
 * - ネストされている場合は，RecordFactoryに投げるだけではなく，
 *   深いところのデフォルト値埋めもやる．
 * - 引数は使いやすさのためPartial<TXYZ>より緩いPartial<IXYZ>にする．
 */
export const XYZ = (xyz?: Partial<IXYZ>): TXYZ =>
  Record<IXYZ>({
    /* default values */
  })(xyz)

/**
 * - 生JSオブジェクトからImmutableオブジェクトの生成．
 * - 配列などが無くIXYZとIXYZJSが同じ場合はXYZRecordFactory(xyz)を返すだけ
 * - ネストしている場合は
 */
export const XYZFromJS = (xyz: Partial<IXYZJS>): TXYZ => {
  /* processing */
}

/**
 * - Immutableオブジェクトから生JSオブジェクトの生成
 * - 配列のtoArrayなど
 */
export const XYZToJS = (xyz: TXYZ): IXYZJS => ({
  //
})
```
