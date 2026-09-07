export const count = function (): number {
  // (`arguments.length` / `arguments[i]` alone are tolerated by the engine
  // rule; a use of the object itself is not.)
  // @sumi-expect banned-syntax/no-arguments
  return Array.from(arguments).length;
};
