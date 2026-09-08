// An object parameter with a mutable property: the type-aware rule sees the
// mutable type, and the annotation rule sees the property. (`Map` / `Set`
// parameters count as readonly for the type-aware rule under
// treatMethodsAsReadonly; only the annotation rule reports those.)
// @sumi-expect-error readonly/require-readonly-parameter
// @sumi-expect-error readonly/require-readonly-type
export const abscissa = (point: { x: number }): number => point.x;
