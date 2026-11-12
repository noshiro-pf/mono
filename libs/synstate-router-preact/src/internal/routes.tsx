import type { ComponentChildren, JSX } from 'preact';
import { useLayoutEffect, useMemo } from 'preact/hooks';
import {
  matchAt,
  pageValues,
  type AnyRouteNode,
  type AnyRoutes,
  type PageMatch,
  type RouteMatch,
  type Router,
} from 'synstate-router';
import { isNonNullObject, Optional } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
import type { RoutesProps } from '../routes-props.mjs';
import { RoutesCase } from './routes-case.js';
import { useObservableValue } from './use-observable-value.mjs';

/** `Routes` bound to `router` (`PreactRouter['Routes']`). */
export const createRoutes = <R extends AnyRoutes>(
  router: Router<R>,
): (<N extends AnyRouteNode = never>(
  props: RoutesProps<R, N>,
) => JSX.Element) => {
  const Routes = <N extends AnyRouteNode = never>({
    prefix,
    under,
    cases,
    notFound,
  }: RoutesProps<R, N>): JSX.Element => {
    const m = useObservableValue(router.match);

    // The new page is in the document now: make the navigation's scroll.
    useLayoutEffect(() => {
      router.flushScroll();
    }, [m]);

    const selected = useMemo(
      () => selectCase(router, m, prefix, under, cases),
      [m, prefix, under, cases],
    );

    return selected === undefined ? (
      <>{notFound}</>
    ) : (
      <RoutesCase
        key={selected.key}
        draw={selected.draw}
        values={selected.values}
      />
    );
  };

  return Routes;
};

/** A case of `Routes`, which the types gave the values it is called with. */
type Case = (values: unknown) => ComponentChildren;

const isCase = (value: unknown): value is Case => typeof value === 'function';

const isRouteNode = (value: unknown): value is AnyRouteNode =>
  isNonNullObject(value) && typeof Reflect.get(value, 'match') === 'function';

/**
 * The case `Routes` draws for `m`, the key its element is given and the values
 * it is called with, or `undefined` for `notFound`.
 */
const selectCase = <R extends AnyRoutes>(
  router: Router<R>,
  m: RouteMatch<R>,
  prefix: boolean | undefined,
  under: AnyRouteNode | undefined,
  cases: UnknownRecord,
): Readonly<{ key: string; draw: Case; values: unknown }> | undefined => {
  if (m.route === undefined) {
    return undefined;
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- `route` is not undefined, which a generic match does not narrow by
  const page = m as PageMatch<R>;

  if (prefix === true) {
    const key = page.route.split('.', 1)[0] ?? page.route;

    const node: unknown = Reflect.get(router.routes, key);

    const drawLayout: unknown = Reflect.get(cases, key);

    if (!isCase(drawLayout) || !isRouteNode(node)) {
      return undefined;
    }

    const nodeValues = matchAt(node, page);

    return Optional.isNone(nodeValues)
      ? undefined
      : { key, draw: drawLayout, values: nodeValues.value };
  }

  if (under !== undefined && Optional.isNone(matchAt(under, page))) {
    return undefined;
  }

  const draw: unknown = Reflect.get(cases, page.route);

  if (!isCase(draw)) {
    return undefined;
  }

  return {
    key: page.route,
    draw,
    values: pageValues(router.routes, page),
  };
};
