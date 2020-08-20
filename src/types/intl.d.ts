/* eslint-disable @typescript-eslint/no-unused-vars */

// This file can be removed once es2020.intl is part of TS
// and can be added in the 'lib' section of tsconfig.json

// From https://github.com/Microsoft/TypeScript/issues/29129
declare namespace Intl {
  type RelativeTimeFormatUnit =
    | "year"
    | "years"
    | "quarter"
    | "quarters"
    | "month"
    | "months"
    | "week"
    | "weeks"
    | "day"
    | "days"
    | "hour"
    | "hours"
    | "minute"
    | "minutes"
    | "second"
    | "seconds";

  type RelativeTimeFormatNumeric = "always" | "auto";

  type RelativeTimeFormatStyle = "long" | "short" | "narrow";

  type BCP47LanguageTag = string;

  interface RelativeTimeFormatOptions {
    localeMatcher?: "lookup" | "best fit";
    numeric?: RelativeTimeFormatNumeric;
    style?: RelativeTimeFormatStyle;
  }

  class RelativeTimeFormat {
    constructor(locale: string, options?: RelativeTimeFormatOptions);

    static supportedLocalesOf(locales: string[]): string[];

    format(value: number, unit: RelativeTimeFormatUnit): string;

    formatToParts(value: number, unit: RelativeTimeFormatUnit): string[];

    resolvedOptions(): RelativeTimeFormatOptions;
  }

  class ListFormat {
    constructor(locale: string);

    // Add properties and methods
  }
}
