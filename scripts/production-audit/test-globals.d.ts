declare module "node:test" {
  interface TestFn {
    (name: string, fn: () => void | Promise<void>): void;
  }
  const test: TestFn;
  export default test;
}

declare module "node:assert/strict" {
  import assertStrict = require("assert/strict");
  export = assertStrict;
}
