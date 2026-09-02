import { asPositiveSafeInt, SafeUint } from 'ts-data-forge';

/** `1296` */
export const denom = asPositiveSafeInt(SafeUint.pow(6, 4));
