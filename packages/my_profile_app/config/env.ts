import dotenv from 'dotenv';
import { resolveAppPath } from './app_directory';

const dotenvConfigOutput = dotenv.config({ path: resolveAppPath('.env') });
const dotenvParsed = dotenvConfigOutput.parsed;

export const dotenvValues: {
  USE_BUNDLE_ANALYZER: boolean | undefined;
  HOST: string | undefined;
  PORT: number | undefined;
  PUBLIC_URL: string | undefined;
} = {
  USE_BUNDLE_ANALYZER: dotenvParsed?.USE_BUNDLE_ANALYZER === 'true',
  HOST: dotenvParsed?.HOST,
  PORT:
    dotenvParsed?.PORT === undefined ? undefined : Number(dotenvParsed.PORT),
  PUBLIC_URL: dotenvParsed?.PUBLIC_URL,
};
