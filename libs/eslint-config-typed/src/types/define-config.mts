import { type FlatConfig } from './index.mjs';

export const defineConfig = <const TConfig extends readonly FlatConfig[]>(
  config: TConfig,
): TConfig => config;
