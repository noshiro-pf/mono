import { appDevPorts } from './app-dev-ports.mjs';

describe('appDevPorts', () => {
  test('gives no two apps the same port', () => {
    const byPort = Map.groupBy(Object.entries(appDevPorts), ([, port]) => port);

    const shared = Array.from(byPort.values())
      .filter((apps) => apps.length > 1)
      .map((apps) => apps.map(([name]) => name));

    assert.deepStrictEqual(shared, []);
  });
});
