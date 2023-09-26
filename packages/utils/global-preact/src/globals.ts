/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-restricted-syntax */
/* eslint-disable functional/immutable-data */

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'preact/hooks';

(global as any).useCallback = useCallback;
(global as any).useEffect = useEffect;
(global as any).useMemo = useMemo;
(global as any).useReducer = useReducer;
(global as any).useRef = useRef;
