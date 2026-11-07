/* global test expect */

import { Duration } from "../../src/luxon";

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

test("Duration#reconfigure() with no arguments does nothing", () => {
  const recon = dur.reconfigure();
  expect(recon.locale).toBe("fr");
  expect(recon.numberingSystem).toBe("beng");
  expect(recon.conversionAccuracy).toBe("longterm");
});

test("Duration#reconfigure() updates conversion factors when conversionAccuracy changes", () => {
  const casualDur = Duration.fromObject({ years: 1 });
  expect(casualDur.conversionAccuracy).toBe("casual");
  expect(casualDur.as("days")).toBeCloseTo(365, 4);

  const longtermDur = casualDur.reconfigure({ conversionAccuracy: "longterm" });
  expect(longtermDur.conversionAccuracy).toBe("longterm");
  expect(longtermDur.as("days")).toBeCloseTo(365.2425, 4);

  const backToCasual = longtermDur.reconfigure({ conversionAccuracy: "casual" });
  expect(backToCasual.conversionAccuracy).toBe("casual");
  expect(backToCasual.as("days")).toBeCloseTo(365, 4);
});

test("Duration#reconfigure() accepts a custom matrix", () => {
  const customMatrix = {
    ...dur.matrix,

    days: {
      hours: 10,

      minutes: 10 * 60,

      seconds: 10 * 60 * 60,

      milliseconds: 10 * 60 * 60 * 1000,
    },
  };

  const recon = Duration.fromObject({ days: 2 }).reconfigure({ matrix: customMatrix });
  expect(recon.as("hours")).toBe(20);
});
