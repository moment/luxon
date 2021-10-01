import Locale from "../../src/impl/locale";
import { withDTFnoU, withoutRTF } from "../helpers";

test("Locale works with Extension U of BCP 47", () => {
  expect(Locale.create("he-IL-u-ca-hebrew-tz-jeruslm").locale).toBe("he-IL");
});

withDTFnoU("Locale works with Extension U of BCP 47", () => {
  expect(Locale.create("he-IL-u-ca-hebrew-tz-jeruslm").locale).toBe("he-IL");
});

test("PolyRelFormatter.formatToParts() works", () => {
  expect(Locale.create("pt").relFormatter().formatToParts(1, "month"));
});

withoutRTF("PolyRelFormatter.formatToParts() works", () => {
  expect(Locale.create("pt").relFormatter().formatToParts(1, "month"));
});
