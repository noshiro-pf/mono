import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { skipTypeWrappers } from 'eslint-rule-forge';

/**
 * Whether the arguments of `counter(...)` may carry a `times` option. Only what
 * the source shows is judged: options passed as a variable, spread in, or keyed
 * by a computed name might hold `times`, and are given the benefit of the
 * doubt.
 */
export const mayStopByItself = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  args: readonly TSESTree.CallExpressionArgument[],
): boolean => {
  if (args.some((arg) => arg.type === AST_NODE_TYPES.SpreadElement)) {
    return true;
  }

  const options = args[1];

  if (options === undefined) {
    return false;
  }

  const unwrapped = skipTypeWrappers(options);

  if (
    unwrapped.type === AST_NODE_TYPES.Identifier &&
    unwrapped.name === 'undefined'
  ) {
    return false;
  }

  if (unwrapped.type !== AST_NODE_TYPES.ObjectExpression) {
    return true;
  }

  return unwrapped.properties.some(
    (property) =>
      property.type === AST_NODE_TYPES.SpreadElement || mayBeTimesKey(property),
  );
};

const mayBeTimesKey = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  property: TSESTree.Property,
): boolean => {
  const { key } = property;

  return key.type === AST_NODE_TYPES.Literal
    ? key.value === 'times'
    : property.computed ||
        (key.type === AST_NODE_TYPES.Identifier && key.name === 'times');
};
