const sealed = (target: unknown): void => {
  console.log(target);
};

// @tsubu-expect banned-syntax/no-decorator
// @tsubu-expect classes/no-class
@sealed
export class Decorated {}
