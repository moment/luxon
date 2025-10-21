export function checkIntlDtfOptions(value: unknown) {
  if (value == null || typeof value !== "object")
    throw new TypeError(`Intl.DateTimeFormatOptions was required, but received ${value}.`);
}
