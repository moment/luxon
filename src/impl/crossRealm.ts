export const LUXON_TYPE = Symbol.for("luxon:type");

declare const typeMarkerBrand: unique symbol;

export type LuxonTypeMarker<T> = string & {
  [typeMarkerBrand]: T;
};

interface HasOptionalTypeMarker {
  [LUXON_TYPE]?: LuxonTypeMarker<unknown>;
}

export function isLuxonType<T>(obj: unknown, type: LuxonTypeMarker<T>): obj is T {
  return (obj as HasOptionalTypeMarker | null | undefined)?.[LUXON_TYPE] === type;
}
