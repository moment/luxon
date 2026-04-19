import { describe, test as baseTest, expect } from "vitest";
import { Duration, DateTime, Interval, Zone } from "../../src/luxon.js";
import { normalizeZone } from "../../src/impl/zoneUtil";

const test = baseTest.extend("runInRealm", async ({}, { onCleanup }) => {
  if ("window" in globalThis) {
    const iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    onCleanup(() => iframe.remove());
    return (code) => iframe.contentWindow.Function(code)();
  } else {
    const { default: vm } = await import("node:vm");
    const context = vm.createContext({});
    return (code) => vm.runInContext(`new Function(${JSON.stringify(code)})()`, context);
  }
});

describe.each([
  { type: "duration", name: "Duration.isDuration", func: Duration.isDuration },
  { type: "datetime", name: "DateTime.isDateTime", func: DateTime.isDateTime },
  { type: "interval", name: "Interval.isInterval", func: Interval.isInterval },
  { type: "zone", name: "Zone.isZone", func: Zone.isZone },
])("$name (cross-realm)", ({ type, func }) => {
  test("recognizes object from another realm", ({ runInRealm }) => {
    const foreignDummyObject = runInRealm(`return { [Symbol.for("luxon:type")]: "${type}" }`);

    expect(func(foreignDummyObject)).toBe(true);
  });

  test("does not falsely match plain objects", ({ runInRealm }) => {
    const fake = runInRealm(`return { foo: 123 }`);
    expect(func(fake)).toBe(false);
  });

  test("does not falsely match objects with other type markers", ({ runInRealm }) => {
    const fake = runInRealm(`return { [Symbol.for("luxon:type")]: "foo" }`);
    expect(func(fake)).toBe(false);
  });
});

test("normalizeZone recognizes Zone objects from different realm", ({ runInRealm }) => {
  const foreignDummyZone = runInRealm(`return { [Symbol.for("luxon:type")]: "zone" }`);
  expect(normalizeZone(foreignDummyZone)).toBe(foreignDummyZone);
});
