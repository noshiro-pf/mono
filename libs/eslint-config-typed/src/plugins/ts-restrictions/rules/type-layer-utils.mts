import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import { typeWrapperLayers } from 'eslint-rule-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type * as ts from 'typescript';

/**
 * Builds a function giving the type of a node at each of its type-wrapper
 * layers, outermost first: `x as A` gives the types of `x as A` and of `x`
 * (see `typeWrapperLayers`).
 *
 * A conclusion a rule draws from a type is drawn only when it holds for every
 * one of them. A widening `as` (`b as boolean | number`) is then the author
 * saying the value may be something else, and is respected, while a narrowing
 * one (`n as unknown as boolean`) leaves the value's own type to decide.
 */
export const createGetLayerTypes =
  (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    services: ParserServicesWithTypeInformation,
  ): ((node: DeepReadonly<TSESTree.Node>) => readonly ts.Type[]) =>
  (node) => {
    const checker = services.program.getTypeChecker();

    return typeWrapperLayers(node).map((layer) =>
      checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(asNode(layer)),
      ),
    );
  };

const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;
