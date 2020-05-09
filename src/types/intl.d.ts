/* eslint-disable @typescript-eslint/no-unused-vars */
import { StringUnitLength } from "./common";
import { ToRelativeNumeric, ToRelativeUnit } from "./datetime";

// From https://github.com/Microsoft/TypeScript/issues/29129
declare global {
  namespace Intl {
    function getCanonicalLocales(locales: string | string[]): string[];

    interface RelativeTimeFormatOptions {
      localeMatcher?: "lookup" | "best fit";
      numeric?: ToRelativeNumeric;
      style?: StringUnitLength;
    }

    class RelativeTimeFormat {
      constructor(locale: string, options?: RelativeTimeFormatOptions);

      static supportedLocalesOf(locales: string[]): string[];

      format(value: number, unit: ToRelativeUnit): string;

      formatToParts(value: number, unit: ToRelativeUnit): string[];

      resolvedOptions(): RelativeTimeFormatOptions;
    }

    class ListFormat {
      constructor(locale: string);

      // Add properties and methods
    }
  }
}
