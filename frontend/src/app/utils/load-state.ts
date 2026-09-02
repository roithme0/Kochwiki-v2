export type LoadState<T> =
  | { status: 'loading'; data: T }
  | { status: 'success'; data: T }
  | { status: 'error'; data: T };
