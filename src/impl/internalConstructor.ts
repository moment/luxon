/**
 * This must not be exported via the public API. It is used as a marker when constructing internal classes
 * to validate that the construction happens from within Luxon's code.
 * See for example SystemZone.
 */
export const INTERNAL_CONSTRUCTOR = Symbol();

export function throwInternalConstructorError(name: string): never {
  throw new TypeError(`${name} is a private constructor.`);
}
