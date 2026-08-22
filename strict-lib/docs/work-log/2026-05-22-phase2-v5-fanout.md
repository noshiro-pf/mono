# 2026-05-22 — Phase 2 (続き): v5.0 〜 v5.9 全バージョン対応完了

v5.6 / v5.7 の上に v5.8, v5.9, v5.5, v5.4, v5.3, v5.2, v5.1, v5.0 を順次追加し、ts-strict-lib の TS 5.x 系全 10 バージョンが揃った。各バージョンは独立したコミットとして記録（commit graph 上 `feat(vX.Y): ...` で確認可能）。

## 追加した TS バージョン (commit順)

| Version | TS 拒絶パッチ | sub-package 数 (非 branded) | 主な convert-dts 修正 |
| --- | --- | --- | --- |
| 5.8 | 5.8.3 | 17 | `(?:arrayLike\|elements): Iterable<number>` の正規化 (TS 5.8 で `arrayLike` → `elements`) |
| 5.9 | 5.9.3 | 17 | なし |
| 5.5 | 5.5.4 | 16 | `TsLibShape.hasArrayIterator` 追加 + `arrayIteratorName()` helper。TS 5.6 で `IterableIterator` → `ArrayIterator` 改名に対応。`Iterator.next(...args:)` vs `next(...[value]:)` 正規化。各 output が自身の TS バージョンを deps に持ち inline tsconfig を使用する形に変更。|
| 5.4 | 5.4.5 | 16 | なし |
| 5.3 | 5.3.3 | 16 | なし |
| 5.2 | 5.2.2 | 16 | なし |
| 5.1 | 5.1.6 | 16 | `copyWithin(target: number, start: number, ...)` を `start\??:` regex 化 (TS 5.5+ で `start` 必須化)。`copyWithin` の `start: number` / `target: number` 単独 rule を `onNotFound: 'off'`。`lib.es2023.array.mts` の `toSpliced` / `with` / `toReversed` / `toSorted` 関連 rules を `onNotFound: 'off'` (TS 5.2+ のみ存在) |
| 5.0 | 5.0.4 | 16 | なし |

合計 10 バージョン × (非 branded + branded) × 各 ~16 sub-package = **320+ 配布パッケージ** が生成される。

## 設計上の変更点

### `TsLibShape` の拡張

`convert-dts/common.mts` に `hasArrayIterator: boolean` を追加。`tsLibShapeFor()` で TS 5.6 を境界とする。`arrayIteratorName(tsLibShape)` helper を新設し、convert の replacement で `ArrayIterator` または `IterableIterator` を出力する。

### output の独立 tsconfig 化

これまで `packages/v*/output{,-branded}/tsconfig.json` は `configs/tsconfig/tsconfig.type-check.json` を extends していたが、ルート tsconfig は `erasableSyntaxOnly` (TS 5.8+) など新しい TS 限定オプションを含むため、古い TS で tsc に拒絶されていた。インライン tsconfig に切替え:

```json
{
  "compilerOptions": {
    "noLib": true,
    "skipLibCheck": false,
    "noEmit": true,
    "strict": true,
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ESNext",
    "types": [],
    "forceConsistentCasingInFileNames": true
  },
  "include": ["./lib-files"],
  "exclude": ["./lib-files/lib.webworker.d.ts"]
}
```

各 `output/output-branded/package.json` が `typescript: <X.Y.Z>` を依存に持ち、`tsc` がそのバージョンを使う。これにより「TS 5.0 で生成した lib を TS 5.0 自身で型チェック」が実現する。

### convert-dts の version-flexibility 化パターン

以下のパターンが確立した:

1. **Source regex の両形式対応**: `(?:旧名|新名)` の regex を使い、TS upstream の改名 (e.g. `arrayLike` → `elements`, `IterableIterator` → `ArrayIterator`) を吸収。
2. **`?` 等の任意化**: `(?:\?|)` でパラメータの required ↔ optional 化を吸収。
3. **Replacement の TS バージョン分岐**: `typedArrayRef(typeName, tsLibShape)` / `arrayIteratorName(tsLibShape)` 等のヘルパーで、出力側を target TS の文法に合わせる。
4. **欠落機能の `onNotFound: 'off'`**: TS X.Y で導入されたメソッドが古い lib に存在しないとき、対応する rule は silently skip。

## CI 観点の留意点

- `pnpm install --no-frozen-lockfile` は新バージョン追加時に必要。check-all の Step 1 (`pnpm i`) が CI でこれを使えるか確認すること。
- バージョンを増やすたび `gen` の所要時間が線形に伸びる (各 TS の lib ファイルを GitHub から fetch するため)。ローカル cache 化の余地あり。
- `tsc -p output/tsconfig.json` 等が全バージョン分走るため check-all の 6. (Type-checking) も増える。

## Phase 2 で未着手

- v4.5 〜 v4.9 (TS 4.x の `@typescript/lib-xxx` 対応版)。Phase 4 (≤4.4) ではなくこの 4.5–4.9 は Phase 2 残部分。
- `output-branded/diff/` 生成 (現状 non-branded のみ)。
- 再生成決定性チェック (`git diff --exit-code` を check-all に追加)。
- Changesets workflow セットアップ。
