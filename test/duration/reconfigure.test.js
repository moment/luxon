/* global test expect */

import { Duration } from "../../src/luxon";
import { casualMatrix } from "../../src/duration";

const dur = Duration.fromObject(
  {
    years: 1,
    months: 2,
    days: 3,
  },
  {
    locale: "fr",
    numberingSystem: "beng",
    conversionAccuracy: "longterm",
  }
);

//------
// #reconfigure()
//------

test("Duration#reconfigure() sets the locale", () => {
  const recon = dur.reconfigure({ locale: "it" });
  expect(recon.locale).toBe("it");
  expect(recon.numberingSystem).toBe("beng");
  expect(recon.conversionAccuracy).toBe("longterm");
});

test("Duration#reconfigure() sets the numberingSystem", () => {
  const recon = dur.reconfigure({ numberingSystem: "thai" });
  expect(recon.locale).toBe("fr");
  expect(recon.numberingSystem).toBe("thai");
  expect(recon.conversionAccuracy).toBe("longterm");
});

test("Duration#reconfigure() sets the conversion accuracy", () => {
  const recon = dur.reconfigure({ conversionAccuracy: "casual" });
  expect(recon.locale).toBe("fr");
  expect(recon.numberingSystem).toBe("beng");
  expect(recon.conversionAccuracy).toBe("casual");
});

test.each([
  ["casual", "longterm", 365, 365.2425],
  ["longterm", "casual", 365.2425, 365],
])(
  "Duration#reconfigure() changes conversions from %s to %s",
  (before, after, oldDays, newDays) => {
    const original = Duration.fromObject({ years: 1 }, { conversionAccuracy: before });
    const recon = original.reconfigure({ conversionAccuracy: after });

    expect(recon.conversionAccuracy).toBe(after);
    expect(recon.toObject()).toEqual({ years: 1 });
    expect(recon.as("days")).toBe(newDays);
    expect(recon.toMillis()).toBe(newDays * 24 * 60 * 60 * 1000);
    expect(recon.shiftTo("days").toObject()).toEqual({ days: newDays });
    expect(original.conversionAccuracy).toBe(before);
    expect(original.as("days")).toBe(oldDays);
  }
);

const customMatrix = { ...casualMatrix, days: { ...casualMatrix.days, hours: 7 } };

test.each([{}, { locale: "it" }, { numberingSystem: "thai" }, { conversionAccuracy: "longterm" }])(
  "Duration#reconfigure(%j) preserves a custom matrix",
  (opts) => {
    const original = Duration.fromObject({ days: 1 }, { matrix: customMatrix });
    const recon = original.reconfigure(opts);
    expect(recon.as("hours")).toBe(7);
    expect(original.as("hours")).toBe(7);
  }
);

test.each([undefined, customMatrix])(
  "Duration#reconfigure() replaces a matrix explicitly",
  (matrix) => {
    const original = Duration.fromObject({ days: 1 }, { matrix });
    const replacement = { ...casualMatrix, days: { ...casualMatrix.days, hours: 9 } };
    const recon = original.reconfigure({ conversionAccuracy: "longterm", matrix: replacement });

    expect(recon.conversionAccuracy).toBe("longterm");
    expect(recon.as("hours")).toBe(9);
    expect(original.as("hours")).toBe(matrix ? 7 : 24);
  }
);

test("Duration#reconfigure() with no arguments does nothing", () => {
  const recon = dur.reconfigure();
  expect(recon.locale).toBe("fr");
  expect(recon.numberingSystem).toBe("beng");
  expect(recon.conversionAccuracy).toBe("longterm");
});
