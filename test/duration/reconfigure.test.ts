import { Duration } from "../../src/luxon";
import Helpers from "../helpers";

const dur = Duration.fromObject(
  {
    years: 1,
    months: 2,
    days: 3
  },
  {
    locale: "fr",
    numberingSystem: "beng",
    conversionAccuracy: "longterm"
  }
);

//------
// #reconfigure()
//------

test("Duration#reconfigure() sets the locale", () => {
  const recon = dur.reconfigure({ locale: "it" });
  expect(recon.locale).toBe("it");
  expect(recon.numberingSystem).toBe("beng");
  expect(Helpers.conversionAccuracy(recon)).toBe("longterm");
});

test("Duration#reconfigure() sets the numberingSystem", () => {
  const recon = dur.reconfigure({ numberingSystem: "thai" });
  expect(recon.locale).toBe("fr");
  expect(recon.numberingSystem).toBe("thai");
  expect(Helpers.conversionAccuracy(recon)).toBe("longterm");
});

test("Duration#reconfigure() sets the conversion accuracy", () => {
  const recon = dur.reconfigure({ conversionAccuracy: "casual" });
  expect(recon.locale).toBe("fr");
  expect(recon.numberingSystem).toBe("beng");
  expect(Helpers.conversionAccuracy(recon)).toBe("casual");
});

test("Duration#reconfigure() with no arguments does nothing", () => {
  const recon = dur.reconfigure();
  expect(recon.locale).toBe("fr");
  expect(recon.numberingSystem).toBe("beng");
  expect(Helpers.conversionAccuracy(recon)).toBe("longterm");
});

test("Helpers#conversionAccuracy is correct", () => {
  const longterm = Duration.fromObject(
    {},
    {
      conversionAccuracy: "longterm"
    }
  );
  expect(Helpers.conversionAccuracy(longterm)).toBe("longterm");

  const casual = Duration.fromObject(
    {},
    {
      conversionAccuracy: "casual"
    }
  );
  expect(Helpers.conversionAccuracy(casual)).toBe("casual");
});
