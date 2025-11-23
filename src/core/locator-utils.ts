/**
 * Utility functions for working with Selenium locators
 */

import { By } from 'selenium-webdriver';
import { LocatorStrategy } from './types.js';

/**
 * Convert a LocatorStrategy string to a Selenium By locator
 * 
 * @param by - Locator strategy type
 * @param value - Selector value
 * @returns Selenium By locator
 * @throws Error if locator strategy is unsupported
 */
export function getByLocator(by: LocatorStrategy, value: string): By {
  switch (by) {
    case 'id':
      return By.id(value);
    case 'css':
      return By.css(value);
    case 'xpath':
      return By.xpath(value);
    case 'name':
      return By.name(value);
    case 'tag':
      // Tag strategy uses CSS selector with tag name only (e.g., 'button', 'div', 'input')
      // Note: Value must be a simple tag name, not a complex CSS selector
      // For complex selectors, use the 'css' strategy instead
      return By.css(value);
    case 'class':
      return By.className(value);
    case 'linkText':
      return By.linkText(value);
    case 'partialLinkText':
      return By.partialLinkText(value);
    default:
      throw new Error(`Unsupported locator strategy: ${by}`);
  }
}

/**
 * Ensure that the WebDriver instance exists
 * 
 * @param driver - WebDriver instance (or null)
 * @throws Error if driver is null
 */
export function ensureDriverExists(driver: unknown): asserts driver {
  if (!driver) {
    throw new Error('Browser not started. Please call start_browser first.');
  }
}
