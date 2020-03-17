export abstract class Example1 {
  /**
   * Wait for the boolean to return
   * @returns True if it waited
   */
  abstract waitForOk: () => Promise<boolean>
}
