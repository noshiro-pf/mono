/**
 * The algebraic data type core. The implementation lives in ts-std-forge
 * since Sumi D-49 reversed the dependency between the two packages; what
 * remains here is the re-export that keeps `import { Result } from
 * 'ts-data-forge'` working. Both names denote the same declarations, so a
 * value built through either package is the same type to both.
 *
 * New code should import these from `ts-std-forge` directly.
 */
export {
  AsyncResult,
  Optional,
  Result,
  TernaryResult,
  match,
  pipe,
} from 'ts-std-forge';

export type {
  Err,
  None,
  Ok,
  Pipe,
  Some,
  TernaryErr,
  TernaryOk,
  TernaryWarn,
  UnknownOptional,
  UnknownResult,
  UnknownTernaryResult,
} from 'ts-std-forge';
