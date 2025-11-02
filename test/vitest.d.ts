import "vitest";

interface Constructable {
  new (...args: any[]): any;
}

interface CustomMatchers<R = unknown> {
  toThrowLuxonError: (errorType: Constructable, code?: string | number) => R;
}

declare module "vitest" {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
