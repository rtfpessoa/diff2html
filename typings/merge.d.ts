declare module 'merge' {
  // eslint-disable-next-line @typescript-eslint/ban-types
  export function recursive(clone: boolean, ...items: object[]): object;
}
