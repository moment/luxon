import { describe, test, expect } from "vitest";
import {
  hasMissingLocaleBeSupport,
  hasMissingLocaleMySupport,
  hasOutdatedKannadaAmPmBehavior,
} from "./specialCases";

describe("test special cases still hold", () => {
  test("hasMissingLocaleBeSupport", () => {
    const actuallyMissing = Intl.DateTimeFormat.supportedLocalesOf("be").length === 0;
    expect(hasMissingLocaleBeSupport).toBe(actuallyMissing);
  });
  test("hasMissingLocaleMySupport", () => {
    const actuallyMissing = Intl.DateTimeFormat.supportedLocalesOf("my").length === 0;
    expect(hasMissingLocaleMySupport).toBe(actuallyMissing);
  });
  test("hasOutdatedKannadaAmPmBehavior", () => {
    const part = new Intl.DateTimeFormat("kn", { hour: "numeric", hourCycle: "h12" })
      .formatToParts()
      .find((p) => p.type === "dayPeriod");
    expect(part).toBeDefined();
    expect(part.value === "ಅಪರಾಹ್ನ").toBe(hasOutdatedKannadaAmPmBehavior);
  });
});
