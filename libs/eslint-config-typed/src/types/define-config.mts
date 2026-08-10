import { type FlatConfig } from './flat-config.mjs';

export const defineConfig = <const TConfig extends readonly FlatConfig[]>(
  config: TConfig,
): TConfig => config;
