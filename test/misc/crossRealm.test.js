import { describe, test as baseTest, expect } from "vitest";
import { Duration, DateTime, Interval } from "../../src/luxon.js";

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
])("$name (cross-realm)", ({ type, name, func }) => {
  test("recognizes object from another realm", ({ runInRealm }) => {
    const foreignDummyDuration = runInRealm(`return { [Symbol.for("luxon:type")]: "${type}" }`);

    expect(func(foreignDummyDuration)).toBe(true);
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
