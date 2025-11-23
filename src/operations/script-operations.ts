/**
 * Script Operations - Handles JavaScript execution in the browser
 */

import { WebDriver } from 'selenium-webdriver';
import { ScriptExecutionResponse } from '../core/types.js';
import { ensureDriverExists } from '../core/locator-utils.js';

/**
 * Manages JavaScript execution in the browser context
 */
export class ScriptOperations {
  constructor(private driver: WebDriver | null) {}

  setDriver(driver: WebDriver | null): void {
    this.driver = driver;
  }

  /**
   * Execute arbitrary JavaScript code in the browser context.
   * 
   * ⚠️ **SECURITY WARNING**: This method executes arbitrary code in the browser.
   * Only use with trusted scripts. Never execute user-provided code without validation.
   * 
   * @param script - JavaScript code to execute
   * @param args - Optional arguments to pass to the script (accessible via 'arguments' array)
   * @returns Promise with the script execution result
   * @throws Error if script execution fails
   * 
   * @example
   * // Get element count
   * await scriptOps.executeScript('return document.querySelectorAll(".item").length');
   * 
   * // Scroll to bottom
   * await scriptOps.executeScript('window.scrollTo(0, document.body.scrollHeight)');
   */
  async executeScript<T = unknown>(script: string, args: unknown[] = []): Promise<ScriptExecutionResponse<T>> {
    ensureDriverExists(this.driver);
    try {
      const result = await this.driver!.executeScript(script, ...args) as T;
      return { result };
    } catch (error) {
      throw new Error(`Failed to execute script: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
