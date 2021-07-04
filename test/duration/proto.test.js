import { Duration } from "../../src/luxon";

test("Duration prototype properties should not throw when addressed", () => {
  const d = Duration.fromObject({ hours: 1 });
  expect(() =>
    Object.getOwnPropertyNames(d.__proto__).forEach((name) => d.__proto__[name])
  ).not.toThrow();
});
