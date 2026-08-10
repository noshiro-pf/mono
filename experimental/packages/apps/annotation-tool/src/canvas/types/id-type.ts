import { v4 as uuidv4 } from 'uuid';

/** Canvas objectのid React Node の key にも用いるため symbol は使用していない． */
export type IdType = string;

export const defaultIdMaker: () => IdType = uuidv4;
export const defaultId = uuidv4();
