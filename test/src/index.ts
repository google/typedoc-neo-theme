export abstract class Example1 {
  /**
   * Wait for the boolean to return
   * @returns True if it waited
   */
  abstract waitForOk: () => Promise<boolean>

  /**
   * Something
   * ```javascript
   * const str = 'hello world';
   * ```
   *
   * @packageDocumentation
   */
  abstract nothing: () => void

  /**
   * Something
   *
   * ```javascript
   * const str = 'hello world';
   * ```
   *
   * @packageDocumentation
   */
  abstract nothingElse: () => void
}
