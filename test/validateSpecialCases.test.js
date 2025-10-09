import { describe, test, expect } from "vitest";
import {
  hasMissingLocaleBeSupport,
  hasMissingLocaleMySupport,
  hasOutdatedKannadaAmPmBehavior,
  hasOutdatedTamilAmPmBehavior,
  isMissingLocaleWeekInfo,
  hasMissingEtcGmtNormalization,
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
      .formatToParts(0)
      .find((p) => p.type === "dayPeriod");
    expect(part).toBeDefined();
    expect(part.value).toBe(hasOutdatedKannadaAmPmBehavior ? "ಅಪರಾಹ್ನ" : "PM");
  });
  test("hasOutdatedTamilAmPmBehavior", () => {
    const part = new Intl.DateTimeFormat("ta", { hour: "numeric", hourCycle: "h12" })
      .formatToParts(0)
      .find((p) => p.type === "dayPeriod");
    expect(part).toBeDefined();
    expect(part.value).toBe(hasOutdatedTamilAmPmBehavior ? "பிற்பகல்" : "PM");
  });
  test("isMissingLocaleWeekInfo", () => {
    const actuallyMissing = !(
      "weekInfo" in Intl.Locale.prototype || "getWeekInfo" in Intl.Locale.prototype
    );
    expect(isMissingLocaleWeekInfo).toBe(actuallyMissing);
  });
  test("hasMissingEtcGmtNormalization", () => {
    const normalized = new Intl.DateTimeFormat(undefined, { timeZone: "Etc/GMT" }).resolvedOptions()
      .timeZone;
    expect(normalized).toBeOneOf(["Etc/GMT", "UTC"]);
    expect(normalized === "Etc/GMT").toBe(hasMissingEtcGmtNormalization);
  });
});
