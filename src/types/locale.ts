export type NumberingSystem =
  | "arab"
  | "arabext"
  | "bali"
  | "beng"
  | "deva"
  | "fullwide"
  | "gujr"
  | "hanidec"
  | "khmr"
  | "knda"
  | "laoo"
  | "latn"
  | "limb"
  | "mlym"
  | "mong"
  | "mymr"
  | "orya"
  | "tamldec"
  | "telu"
  | "thai"
  | "tibt";

export type CalendarSystem =
  | "buddhist"
  | "chinese"
  | "coptic"
  | "ethioaa"
  | "ethiopic"
  | "gregory"
  | "hebrew"
  | "indian"
  | "islamic"
  | "islamicc"
  | "iso8601"
  | "japanese"
  | "persian"
  | "roc";

export interface LocaleOptions {
  locale?: string;
  outputCalendar?: CalendarSystem;
  numberingSystem?: NumberingSystem;
}
