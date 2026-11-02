import { createRouter } from 'synstate-router';
import { createRouterComponents } from 'synstate-router-dom';
import { routes } from './constants/index.mjs';

// The app is served from `/mono/algo-app/` on the repository's Pages site;
// the router reads and writes paths below that.
export const router = createRouter(routes, {
  basePath: import.meta.env.BASE_URL,
});

export const { Routes } = createRouterComponents(router);
