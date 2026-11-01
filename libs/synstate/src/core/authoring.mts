/**
 * What custom creators and operators are written with: factories that wrap the
 * base classes the built-in observables extend (#2117). The rest of `core/base`
 * stays internal.
 */
export {
  createAsyncChildObservable,
  createInitializedSyncChildObservable,
  createRootObservable,
  createSyncChildObservable,
  type AsyncChildObservableHooks,
  type AsyncChildObservableTools,
  type ChildObservableConfig,
  type InitializedChildObservableConfig,
  type RootObservableConfig,
  type RootObservableTools,
  type SyncChildObservableHooks,
  type SyncChildObservableTools,
} from './class/index.mjs';
