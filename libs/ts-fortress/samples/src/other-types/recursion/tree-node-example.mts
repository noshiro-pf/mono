import * as t from 'ts-fortress';

type TreeNode<T> = Readonly<{
  value: T;
  children: readonly TreeNode<T>[];
}>;

const TreeNodeString: t.Type<TreeNode<string>> = t.recursion(
  'TreeNode<string>',
  () =>
    t.record({
      value: t.string(),
      children: t.array(TreeNodeString),
    }),
);
