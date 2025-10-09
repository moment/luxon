/**
 * This must not be exported via the public API. It is used as a marker when constructing singletons
 * to validate that the construction happens from within Luxon's code.
 * See for example SystemZone.
 */
export const SINGLETON_MARKER = Symbol();
