/* eslint no-proto: "off" */
import { Duration } from "../../src/luxon";

test.skip("Duration prototype properties should not throw when addressed", () => {
  const d = Duration.fromObject({ hours: 1 });
  const proto = Object.getPrototypeOf(d);
  expect(() => Object.getOwnPropertyNames(proto).forEach(name => proto[name])).not.toThrow();
});
