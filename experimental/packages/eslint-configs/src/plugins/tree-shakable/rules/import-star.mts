import { castDeepMutable } from '@noshiro/mono-utils';
import { type TSESLint, TSESTree } from '@typescript-eslint/utils';

type MessageIds = 'non-tree-shakable-access';

export const importStarRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbits non-tree-shakable access to module name space objects.',
    },
    messages: {
      'non-tree-shakable-access':
        "This expression makes '{{ module }}' non-tree-shakable.",
    },
    schema: [],
  },
  create: (context) => ({
    ImportNamespaceSpecifier: (node) => {
      // import * as mod from 'specifier'
      const identifier = node.local;
      const moduleName = getModuleSpecifier(node);
      checkModuleNamespaceUsage(node, context, moduleName, identifier);
    },
  }),
  defaultOptions: [],
};

const getModuleSpecifier = (node: TSESTree.ImportNamespaceSpecifier): string =>
  node.parent.source.value;

const checkModuleNamespaceUsage = (
  node: TSESTree.ImportNamespaceSpecifier,
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, unknown[]>>,
  moduleName: string,
  identifier: DeepReadonly<TSESTree.Identifier>,
): void => {
  // backward compatibile version
  // const scope =
  //   context.sourceCode !== undefined
  //     ? context.sourceCode.getScope(node)
  //     : context.getScope();

  const scope = context.sourceCode.getScope(castDeepMutable(node));

  const variable = scope.set.get(identifier.name);
  if (variable === undefined) {
    return;
  }
  for (const ref of variable.references) {
    const referencedIdentifier = ref.identifier;
    if (!isTreeShakingSafeReference(referencedIdentifier)) {
      context.report({
        node: referencedIdentifier,
        messageId: 'non-tree-shakable-access',
        data: {
          module: moduleName,
        },
      });
    }
  }
};

const isTreeShakingSafeReference = (
  identifier: DeepReadonly<TSESTree.Identifier | TSESTree.JSXIdentifier>,
): boolean => {
  // Only allow `id.foo` or `id["foo"]` references.
  const parent = identifier.parent;
  // if (parent === undefined) {
  //   return false;
  // }

  switch (parent.type) {
    case TSESTree.AST_NODE_TYPES.MemberExpression: {
      if (!parent.computed) {
        // id.foo
        return true;
      }
      const memberName = parent.property;
      if (memberName.type === TSESTree.AST_NODE_TYPES.Literal) {
        // id["foo"]
        return true;
      }
      return false;
    }

    case TSESTree.AST_NODE_TYPES.JSXMemberExpression: {
      // JSX Elements
      return true;
    }

    case TSESTree.AST_NODE_TYPES.TSQualifiedName: {
      // TypeScript's type
      return true;
    }
    case TSESTree.AST_NODE_TYPES.TSTypeQuery: {
      // 'typeof t' in TypeScript's type context
      return true;
    }
    case TSESTree.AST_NODE_TYPES.AccessorProperty:
    case TSESTree.AST_NODE_TYPES.ArrayExpression:
    case TSESTree.AST_NODE_TYPES.ArrayPattern:
    case TSESTree.AST_NODE_TYPES.ArrowFunctionExpression:
    case TSESTree.AST_NODE_TYPES.AssignmentExpression:
    case TSESTree.AST_NODE_TYPES.AssignmentPattern:
    case TSESTree.AST_NODE_TYPES.AwaitExpression:
    case TSESTree.AST_NODE_TYPES.BinaryExpression:
    case TSESTree.AST_NODE_TYPES.BlockStatement:
    case TSESTree.AST_NODE_TYPES.BreakStatement:
    case TSESTree.AST_NODE_TYPES.CallExpression:
    case TSESTree.AST_NODE_TYPES.CatchClause:
    case TSESTree.AST_NODE_TYPES.ChainExpression:
    case TSESTree.AST_NODE_TYPES.ClassBody:
    case TSESTree.AST_NODE_TYPES.ClassDeclaration:
    case TSESTree.AST_NODE_TYPES.ClassExpression:
    case TSESTree.AST_NODE_TYPES.ConditionalExpression:
    case TSESTree.AST_NODE_TYPES.ContinueStatement:
    case TSESTree.AST_NODE_TYPES.DebuggerStatement:
    case TSESTree.AST_NODE_TYPES.Decorator:
    case TSESTree.AST_NODE_TYPES.DoWhileStatement:
    case TSESTree.AST_NODE_TYPES.EmptyStatement:
    case TSESTree.AST_NODE_TYPES.ExportAllDeclaration:
    case TSESTree.AST_NODE_TYPES.ExportDefaultDeclaration:
    case TSESTree.AST_NODE_TYPES.ExportNamedDeclaration:
    case TSESTree.AST_NODE_TYPES.ExportSpecifier:
    case TSESTree.AST_NODE_TYPES.ExpressionStatement:
    case TSESTree.AST_NODE_TYPES.ForInStatement:
    case TSESTree.AST_NODE_TYPES.ForOfStatement:
    case TSESTree.AST_NODE_TYPES.ForStatement:
    case TSESTree.AST_NODE_TYPES.FunctionDeclaration:
    case TSESTree.AST_NODE_TYPES.FunctionExpression:
    case TSESTree.AST_NODE_TYPES.Identifier:
    case TSESTree.AST_NODE_TYPES.IfStatement:
    case TSESTree.AST_NODE_TYPES.ImportAttribute:
    case TSESTree.AST_NODE_TYPES.ImportDeclaration:
    case TSESTree.AST_NODE_TYPES.ImportDefaultSpecifier:
    case TSESTree.AST_NODE_TYPES.ImportExpression:
    case TSESTree.AST_NODE_TYPES.ImportNamespaceSpecifier:
    case TSESTree.AST_NODE_TYPES.ImportSpecifier:
    case TSESTree.AST_NODE_TYPES.JSXAttribute:
    case TSESTree.AST_NODE_TYPES.JSXClosingElement:
    case TSESTree.AST_NODE_TYPES.JSXClosingFragment:
    case TSESTree.AST_NODE_TYPES.JSXElement:
    case TSESTree.AST_NODE_TYPES.JSXEmptyExpression:
    case TSESTree.AST_NODE_TYPES.JSXExpressionContainer:
    case TSESTree.AST_NODE_TYPES.JSXFragment:
    case TSESTree.AST_NODE_TYPES.JSXIdentifier:
    case TSESTree.AST_NODE_TYPES.JSXNamespacedName:
    case TSESTree.AST_NODE_TYPES.JSXOpeningElement:
    case TSESTree.AST_NODE_TYPES.JSXOpeningFragment:
    case TSESTree.AST_NODE_TYPES.JSXSpreadAttribute:
    case TSESTree.AST_NODE_TYPES.JSXSpreadChild:
    case TSESTree.AST_NODE_TYPES.JSXText:
    case TSESTree.AST_NODE_TYPES.LabeledStatement:
    case TSESTree.AST_NODE_TYPES.Literal:
    case TSESTree.AST_NODE_TYPES.LogicalExpression:
    case TSESTree.AST_NODE_TYPES.MetaProperty:
    case TSESTree.AST_NODE_TYPES.MethodDefinition:
    case TSESTree.AST_NODE_TYPES.NewExpression:
    case TSESTree.AST_NODE_TYPES.ObjectExpression:
    case TSESTree.AST_NODE_TYPES.ObjectPattern:
    case TSESTree.AST_NODE_TYPES.PrivateIdentifier:
    case TSESTree.AST_NODE_TYPES.Program:
    case TSESTree.AST_NODE_TYPES.Property:
    case TSESTree.AST_NODE_TYPES.PropertyDefinition:
    case TSESTree.AST_NODE_TYPES.RestElement:
    case TSESTree.AST_NODE_TYPES.ReturnStatement:
    case TSESTree.AST_NODE_TYPES.SequenceExpression:
    case TSESTree.AST_NODE_TYPES.SpreadElement:
    case TSESTree.AST_NODE_TYPES.StaticBlock:
    case TSESTree.AST_NODE_TYPES.Super:
    case TSESTree.AST_NODE_TYPES.SwitchCase:
    case TSESTree.AST_NODE_TYPES.SwitchStatement:
    case TSESTree.AST_NODE_TYPES.TaggedTemplateExpression:
    case TSESTree.AST_NODE_TYPES.TemplateElement:
    case TSESTree.AST_NODE_TYPES.TemplateLiteral:
    case TSESTree.AST_NODE_TYPES.ThisExpression:
    case TSESTree.AST_NODE_TYPES.ThrowStatement:
    case TSESTree.AST_NODE_TYPES.TryStatement:
    case TSESTree.AST_NODE_TYPES.UnaryExpression:
    case TSESTree.AST_NODE_TYPES.UpdateExpression:
    case TSESTree.AST_NODE_TYPES.VariableDeclaration:
    case TSESTree.AST_NODE_TYPES.VariableDeclarator:
    case TSESTree.AST_NODE_TYPES.WhileStatement:
    case TSESTree.AST_NODE_TYPES.WithStatement:
    case TSESTree.AST_NODE_TYPES.YieldExpression:
    case TSESTree.AST_NODE_TYPES.TSAbstractAccessorProperty:
    case TSESTree.AST_NODE_TYPES.TSAbstractKeyword:
    case TSESTree.AST_NODE_TYPES.TSAbstractMethodDefinition:
    case TSESTree.AST_NODE_TYPES.TSAbstractPropertyDefinition:
    case TSESTree.AST_NODE_TYPES.TSAnyKeyword:
    case TSESTree.AST_NODE_TYPES.TSArrayType:
    case TSESTree.AST_NODE_TYPES.TSAsExpression:
    case TSESTree.AST_NODE_TYPES.TSAsyncKeyword:
    case TSESTree.AST_NODE_TYPES.TSBigIntKeyword:
    case TSESTree.AST_NODE_TYPES.TSBooleanKeyword:
    case TSESTree.AST_NODE_TYPES.TSCallSignatureDeclaration:
    case TSESTree.AST_NODE_TYPES.TSClassImplements:
    case TSESTree.AST_NODE_TYPES.TSConditionalType:
    case TSESTree.AST_NODE_TYPES.TSConstructorType:
    case TSESTree.AST_NODE_TYPES.TSConstructSignatureDeclaration:
    case TSESTree.AST_NODE_TYPES.TSDeclareFunction:
    case TSESTree.AST_NODE_TYPES.TSDeclareKeyword:
    case TSESTree.AST_NODE_TYPES.TSEmptyBodyFunctionExpression:
    case TSESTree.AST_NODE_TYPES.TSEnumBody:
    case TSESTree.AST_NODE_TYPES.TSEnumDeclaration:
    case TSESTree.AST_NODE_TYPES.TSEnumMember:
    case TSESTree.AST_NODE_TYPES.TSExportAssignment:
    case TSESTree.AST_NODE_TYPES.TSExportKeyword:
    case TSESTree.AST_NODE_TYPES.TSExternalModuleReference:
    case TSESTree.AST_NODE_TYPES.TSFunctionType:
    case TSESTree.AST_NODE_TYPES.TSImportEqualsDeclaration:
    case TSESTree.AST_NODE_TYPES.TSImportType:
    case TSESTree.AST_NODE_TYPES.TSIndexedAccessType:
    case TSESTree.AST_NODE_TYPES.TSIndexSignature:
    case TSESTree.AST_NODE_TYPES.TSInferType:
    case TSESTree.AST_NODE_TYPES.TSInstantiationExpression:
    case TSESTree.AST_NODE_TYPES.TSInterfaceBody:
    case TSESTree.AST_NODE_TYPES.TSInterfaceDeclaration:
    case TSESTree.AST_NODE_TYPES.TSInterfaceHeritage:
    case TSESTree.AST_NODE_TYPES.TSIntersectionType:
    case TSESTree.AST_NODE_TYPES.TSIntrinsicKeyword:
    case TSESTree.AST_NODE_TYPES.TSLiteralType:
    case TSESTree.AST_NODE_TYPES.TSMappedType:
    case TSESTree.AST_NODE_TYPES.TSMethodSignature:
    case TSESTree.AST_NODE_TYPES.TSModuleBlock:
    case TSESTree.AST_NODE_TYPES.TSModuleDeclaration:
    case TSESTree.AST_NODE_TYPES.TSNamedTupleMember:
    case TSESTree.AST_NODE_TYPES.TSNamespaceExportDeclaration:
    case TSESTree.AST_NODE_TYPES.TSNeverKeyword:
    case TSESTree.AST_NODE_TYPES.TSNonNullExpression:
    case TSESTree.AST_NODE_TYPES.TSNullKeyword:
    case TSESTree.AST_NODE_TYPES.TSNumberKeyword:
    case TSESTree.AST_NODE_TYPES.TSObjectKeyword:
    case TSESTree.AST_NODE_TYPES.TSOptionalType:
    case TSESTree.AST_NODE_TYPES.TSParameterProperty:
    case TSESTree.AST_NODE_TYPES.TSPrivateKeyword:
    case TSESTree.AST_NODE_TYPES.TSPropertySignature:
    case TSESTree.AST_NODE_TYPES.TSProtectedKeyword:
    case TSESTree.AST_NODE_TYPES.TSPublicKeyword:
    case TSESTree.AST_NODE_TYPES.TSReadonlyKeyword:
    case TSESTree.AST_NODE_TYPES.TSRestType:
    case TSESTree.AST_NODE_TYPES.TSSatisfiesExpression:
    case TSESTree.AST_NODE_TYPES.TSStaticKeyword:
    case TSESTree.AST_NODE_TYPES.TSStringKeyword:
    case TSESTree.AST_NODE_TYPES.TSSymbolKeyword:
    case TSESTree.AST_NODE_TYPES.TSTemplateLiteralType:
    case TSESTree.AST_NODE_TYPES.TSThisType:
    case TSESTree.AST_NODE_TYPES.TSTupleType:
    case TSESTree.AST_NODE_TYPES.TSTypeAliasDeclaration:
    case TSESTree.AST_NODE_TYPES.TSTypeAnnotation:
    case TSESTree.AST_NODE_TYPES.TSTypeAssertion:
    case TSESTree.AST_NODE_TYPES.TSTypeLiteral:
    case TSESTree.AST_NODE_TYPES.TSTypeOperator:
    case TSESTree.AST_NODE_TYPES.TSTypeParameter:
    case TSESTree.AST_NODE_TYPES.TSTypeParameterDeclaration:
    case TSESTree.AST_NODE_TYPES.TSTypeParameterInstantiation:
    case TSESTree.AST_NODE_TYPES.TSTypePredicate:
    case TSESTree.AST_NODE_TYPES.TSTypeReference:
    case TSESTree.AST_NODE_TYPES.TSUndefinedKeyword:
    case TSESTree.AST_NODE_TYPES.TSUnionType:
    case TSESTree.AST_NODE_TYPES.TSUnknownKeyword:
    case TSESTree.AST_NODE_TYPES.TSVoidKeyword:
      return false;
  }
};
