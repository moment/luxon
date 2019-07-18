import { CalendarSystem, NumberingSystem } from "./locale";

export interface InfoOptions {
  locale?: string;
}

export interface InfoUnitOptions extends InfoOptions {
  numberingSystem?: NumberingSystem;
}

export interface InfoCalendarOptions extends InfoUnitOptions {
  outputCalendar?: CalendarSystem;
}

export interface Features {
  intl: boolean;
  intlTokens: boolean;
  zones: boolean;
  relative: boolean;
}
