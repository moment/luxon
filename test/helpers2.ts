import { onTestFinished, vi } from "vitest";
import Settings from "../src/settings.ts";
import type { ZoneInput } from "../src/impl/zoneUtil.ts";

export function useFakeTime(now?: Date | number) {
  onTestFinished(() => void vi.useRealTimers());
  vi.useFakeTimers({
    now,
  });
}

function createUseDefaultSetting<T extends keyof typeof Settings>(
  key: T
): (value: (typeof Settings)[T]) => void {
  return (value) => {
    const before = Settings[key];
    onTestFinished(() => {
      Settings[key] = before;
    });
    Settings[key] = value;
  };
}

export const useDefaultLocale = createUseDefaultSetting("defaultLocale");
export const useDefaultOutputCalendar = createUseDefaultSetting("defaultOutputCalendar");
export const useDefaultNumberingSystem = createUseDefaultSetting("defaultNumberingSystem");

// Can't use our helper above because TypeScript cannot extract the type of a setter
// https://github.com/microsoft/TypeScript/issues/60162
export const useDefaultZone = (value: ZoneInput | null) => {
  const before = Settings.defaultZone;
  onTestFinished(() => {
    Settings.defaultZone = before;
  });
  Settings.defaultZone = value;
};
