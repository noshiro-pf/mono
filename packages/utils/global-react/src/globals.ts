/* eslint-disable
  @typescript-eslint/no-explicit-any,
  @typescript-eslint/no-unsafe-member-access,
  functional/immutable-data
*/

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

(global as any).useCallback = useCallback;
(global as any).useEffect = useEffect;
(global as any).useMemo = useMemo;
(global as any).useReducer = useReducer;
(global as any).useRef = useRef;
