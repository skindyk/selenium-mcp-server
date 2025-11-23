/**
 * Wait operations for Selenium WebDriver
 * Provides methods for waiting on element conditions
 */

import { WebDriver, By, until } from 'selenium-webdriver';
import { SuccessResponse, LocatorStrategy } from '../core/types.js';
import { getByLocator, ensureDriverExists } from '../core/locator-utils.js';
import { TimeoutError, ElementStateError } from '../core/errors.js';

/**
 * Class for managing wait operations on web elements
 */
export class WaitOperations {
  /**
   * Create a new WaitOperations instance
   * 
   * @param driver - WebDriver instance
   */
  constructor(private driver: WebDriver | null) {}

  /**
   * Set the WebDriver instance
   * 
   * @param driver - WebDriver instance
   */
  setDriver(driver: WebDriver | null): void {
    this.driver = driver;
  }

  /**
   * Wait for an element to be present in the DOM (may not be visible).
   * 
   * @param by - Locator strategy
   * @param value - Selector value
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   * @returns Promise with success status and message
   * @throws Error if element is not found within timeout
   * 
   * @example
   * await waitOps.waitForElement('css', '.dynamic-content');
   */
  async waitForElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      await this.driver!.wait(until.elementLocated(locator), timeout);
      return { success: true, message: 'Element found within timeout' };
    } catch (error) {
      throw new TimeoutError(`waitForElement [${by}="${value}"]`, timeout, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Wait for an element to be visible on the page.
   * 
   * @param by - Locator strategy
   * @param value - Selector value
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   * @returns Promise with success status and message
   * @throws Error if element does not become visible within timeout
   * 
   * @example
   * await waitOps.waitForElementVisible('id', 'loading-spinner');
   */
  async waitForElementVisible(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsVisible(element), timeout);
      return { success: true, message: 'Element became visible within timeout' };
    } catch (error) {
      throw new ElementStateError(by, value, 'visible', timeout, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Wait for an element to become clickable (enabled and visible).
   * 
   * @param by - Locator strategy
   * @param value - Selector value
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   * @returns Promise with success status and message
   * @throws Error if element does not become clickable within timeout
   * 
   * @example
   * await waitOps.waitForElementClickable('css', '#submit-button');
   */
  async waitForElementClickable(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      return { success: true, message: 'Element became clickable within timeout' };
    } catch (error) {
      throw new ElementStateError(by, value, 'clickable', timeout, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Wait for specific text to be present in an element.
   * 
   * @param by - Locator strategy
   * @param value - Selector value
   * @param text - Text to wait for in the element
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   * @returns Promise with success status and message
   * @throws Error if text is not found within timeout
   * 
   * @example
   * await waitOps.waitForTextPresent('css', '.status', 'Complete');
   */
  async waitForTextPresent(by: LocatorStrategy, value: string, text: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      await this.driver!.wait(until.elementTextContains(this.driver!.findElement(locator), text), timeout);
      return { success: true, message: `Text '${text}' found in element within timeout` };
    } catch (error) {
      throw new TimeoutError(`waitForTextPresent [${by}="${value}"] text="${text}"`, timeout, error instanceof Error ? error : undefined);
    }
  }
}
