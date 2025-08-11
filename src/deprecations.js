const warned = new Set();

export function warnDeprecation(key) {
  if (!warned.has(key)) {
    warned.add(key);
    console.warn(
      `Luxon deprecation ${key}. See https://moment.github.io/luxon/#/deprecations?id=${key}`
    );
  }
}
