/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable functional/immutable-data */

import { useCallback, useEffect, useMemo, useReducer } from 'react';

(global as any).useCallback = useCallback;
(global as any).useEffect = useEffect;
(global as any).useMemo = useMemo;
(global as any).useReducer = useReducer;
