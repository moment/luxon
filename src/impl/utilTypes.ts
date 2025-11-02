export type PartialNullable<T> = {
  [K in keyof T]?: T[K] | null | undefined;
};
