import { type ESLintPlugin } from '../../../types/index.mjs';
import { banUseImperativeHandleHook } from './ban-use-imperative-handle-hook.mjs';
import { componentNameRule } from './component-name.mjs';
import { componentVarTypeAnnotationRule } from './component-var-type-annotation.mjs';
import { importStyleRule } from './import-style.mjs';
import { propsTypeAnnotationStyleRule } from './props-type-annotation-style.mjs';
import { reactMemoPropsArgumentNameRule } from './react-memo-props-argument-name.mjs';
import { reactMemoTypeParameterRule } from './react-memo-type-parameter.mjs';
import { useMemoHooksStyleRule } from './use-memo-hooks-style.mjs';

export const reactCodingStyleRules = {
  'component-name': componentNameRule,
  'component-var-type-annotation': componentVarTypeAnnotationRule,
  'import-style': importStyleRule,
  'props-type-annotation-style': propsTypeAnnotationStyleRule,
  'react-memo-props-argument-name': reactMemoPropsArgumentNameRule,
  'react-memo-type-parameter': reactMemoTypeParameterRule,
  'use-memo-hook-style': useMemoHooksStyleRule,
  'ban-use-imperative-handle-hook': banUseImperativeHandleHook,
} as const satisfies ESLintPlugin['rules'];
