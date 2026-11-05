import { createRouterComponents } from 'synstate-router-dom';
import { Router } from '../store/index.mjs';

/** `Routes` and `Link`, bound to the app's router. */
export const { Routes, Link } = createRouterComponents(Router);
