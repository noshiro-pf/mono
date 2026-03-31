---
prev: false
next: false
title: createBooleanState
---

<!-- jsdoc-description -->

真偽値操作のための便利なメソッドを備えたリアクティブな真偽値状態を作成します。
`createState` を拡張し、`toggle`、`setTrue`、`setFalse` などの真偽値専用ヘルパーを提供します。

<!-- /jsdoc-description -->

## 使用例

```tsx
import type * as React from 'react';
import { createBooleanState } from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';

// Menu drawer open/close state.
// setTrue and setFalse can be passed directly as callbacks
// — no need to create wrapper functions like `() => setState(true)`.
const [menuOpen$, { setTrue: openMenu, setFalse: closeMenu }] =
    createBooleanState(false);

const SampleComponent = (): React.JSX.Element => (
    <MenuDrawer
        open={useObservableValue(menuOpen$)}
        onClose={closeMenu}
        onOpen={openMenu}
    />
);
```
