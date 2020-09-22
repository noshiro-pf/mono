import { RNode } from '../RNode';

export type RNodeValueOf<S> = S extends RNode<infer T> ? T : never;
