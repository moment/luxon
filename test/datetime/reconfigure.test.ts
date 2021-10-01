/* global test expect */

import { DateTime } from "../../src/luxon";

const dt = DateTime.fromObject(
  {},
  {
    locale: "fr",
    numberingSystem: "beng",
    outputCalendar: "coptic",
  }
);

//------
// #reconfigure()
//------
test("DateTime#reconfigure() sets the locale", () => {
  const recon = dt.reconfigure({ locale: "it" });
  expect(recon.locale).toBe("it");
  expect(recon.numberingSystem).toBe("beng");
  expect(recon.outputCalendar).toBe("coptic");
});

test("DateTime#reconfigure() sets the outputCalendar", () => {
  const recon = dt.reconfigure({ outputCalendar: "ethioaa" });
  expect(recon.locale).toBe("fr");
  expect(recon.numberingSystem).toBe("beng");
  expect(recon.outputCalendar).toBe("ethioaa");
});

test("DateTime#reconfigure() sets the numberingSystem", () => {
  const recon = dt.reconfigure({ numberingSystem: "thai" });
  expect(recon.locale).toBe("fr");
  expect(recon.numberingSystem).toBe("thai");
  expect(recon.outputCalendar).toBe("coptic");
});

test("DateTime#reconfigure() with no arguments no opts", () => {
  const recon = dt.reconfigure();
  expect(recon.locale).toBe("fr");
  expect(recon.numberingSystem).toBe("beng");
  expect(recon.outputCalendar).toBe("coptic");
});
