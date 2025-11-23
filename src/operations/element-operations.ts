/**
 * Element interaction operations for Selenium WebDriver
 */

import { WebDriver, By, until } from 'selenium-webdriver';
import { getByLocator, ensureDriverExists } from '../core/locator-utils.js';
import {
  ElementNotFoundError,
  ElementInteractionError,
  TimeoutError
} from '../core/errors.js';
import {
  LocatorStrategy,
  SuccessResponse,
  FindElementResponse,
  FindElementsResponse,
  ElementTextResponse,
  ElementAttributeResponse,
  ElementPropertyResponse,
  ElementCssValueResponse,
  ElementStateResponse
} from '../core/types.js';

export class ElementOperations {
  constructor(private driver: WebDriver | null = null) {}

  /**
   * Set the WebDriver instance for this operations manager
   * 
   * @param driver - WebDriver instance (or null)
   */
  setDriver(driver: WebDriver | null): void {
    this.driver = driver;
  }

  /**
   * Find a single element on the page using the specified locator strategy.
   * 
   * @param by - Locator strategy: 'id', 'css', 'xpath', 'name', 'tag', 'class', 'linkText', 'partialLinkText'
   * @param value - The selector value matching the chosen strategy
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   * @returns Promise with found status and message
   * 
   * @example
   * await elementOps.findElement('id', 'submit-button');
   * await elementOps.findElement('css', '.login-form input[type="email"]');
   * await elementOps.findElement('xpath', '//button[@class="submit"]');
   */
  async findElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<FindElementResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      await this.driver!.wait(until.elementLocated(locator), timeout);
      return { found: true, message: 'Element found successfully' };
    } catch (error) {
      return { found: false, message: `Element not found: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  async findElements(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<FindElementsResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      // Wait a bit for elements to load
      await new Promise(resolve => setTimeout(resolve, Math.min(timeout, 1000)));
      const elements = await this.driver!.findElements(locator);
      return { count: elements.length, message: `Found ${elements.length} elements` };
    } catch (error) {
      throw new ElementNotFoundError(by, value, timeout, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Click on an element identified by the locator strategy.
   * Waits for element to be located and enabled before clicking.
   * 
   * @param by - Locator strategy
   * @param value - Selector value
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   * @returns Promise with success status and message
   * @throws Error if element is not found, not enabled, or click fails
   * 
   * @example
   * await elementOps.clickElement('id', 'login-button');
   */
  async clickElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      await element.click();
      return { success: true, message: 'Element clicked successfully' };
    } catch (error) {
      throw new ElementInteractionError('click', by, value, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Send text input to an element (typically form fields).
   * Waits for element to be located and enabled before sending keys.
   * 
   * @param by - Locator strategy
   * @param value - Selector value
   * @param text - Text to input into the element
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   * @returns Promise with success status and message
   * @throws Error if element is not found, not enabled, or input fails
   * 
   * @example
   * await elementOps.sendKeys('name', 'username', 'john@example.com');
   */
  async sendKeys(by: LocatorStrategy, value: string, text: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      await element.sendKeys(text);
      return { success: true, message: 'Keys sent successfully' };
    } catch (error) {
      throw new ElementInteractionError('sendKeys', by, value, error instanceof Error ? error : undefined);
    }
  }

  async clearElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await element.clear();
      return { success: true, message: 'Element cleared successfully' };
    } catch (error) {
      throw new ElementInteractionError('clear', by, value, error instanceof Error ? error : undefined);
    }
  }

  async getElementText(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<ElementTextResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const text = await element.getText();
      return { text };
    } catch (error) {
      throw new ElementInteractionError('getText', by, value, error instanceof Error ? error : undefined);
    }
  }

  async getElementAttribute(by: LocatorStrategy, value: string, attribute: string, timeout: number = 10000): Promise<ElementAttributeResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const attrValue = await element.getAttribute(attribute);
      return { attribute, value: attrValue };
    } catch (error) {
      throw new ElementInteractionError('getAttribute', by, value, error instanceof Error ? error : undefined);
    }
  }

  async getElementProperty(by: LocatorStrategy, value: string, property: string, timeout: number = 10000): Promise<ElementPropertyResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      // Use getAttribute for properties like 'value', 'checked', etc.
      const propValue = await element.getAttribute(property);
      return { property, value: propValue };
    } catch (error) {
      throw new ElementInteractionError('getProperty', by, value, error instanceof Error ? error : undefined);
    }
  }

  async isElementDisplayed(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<ElementStateResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const displayed = await element.isDisplayed();
      return { displayed };
    } catch (error) {
      return { displayed: false };
    }
  }

  async isElementEnabled(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<ElementStateResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const enabled = await element.isEnabled();
      return { enabled };
    } catch (error) {
      return { enabled: false };
    }
  }

  async isElementSelected(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<ElementStateResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const selected = await element.isSelected();
      return { selected };
    } catch (error) {
      return { selected: false };
    }
  }

  async getElementCssValue(by: LocatorStrategy, value: string, cssProperty: string, timeout: number = 10000): Promise<ElementCssValueResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const cssValue = await element.getCssValue(cssProperty);
      return { property: cssProperty, value: cssValue };
    } catch (error) {
      throw new ElementInteractionError('getCssValue', by, value, error instanceof Error ? error : undefined);
    }
  }

  async scrollToElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.executeScript('arguments[0].scrollIntoView(true);', element);
      return { success: true, message: 'Scrolled to element successfully' };
    } catch (error) {
      throw new ElementInteractionError('scrollTo', by, value, error instanceof Error ? error : undefined);
    }
  }

  // Advanced Mouse Actions
  async hoverElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const actions = this.driver!.actions({ bridge: true });
      await actions.move({ origin: element }).perform();
      return { success: true, message: 'Hovered over element successfully' };
    } catch (error) {
      throw new ElementInteractionError('hover', by, value, error instanceof Error ? error : undefined);
    }
  }

  async doubleClickElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      const actions = this.driver!.actions({ bridge: true });
      await actions.doubleClick(element).perform();
      return { success: true, message: 'Double clicked successfully' };
    } catch (error) {
      throw new ElementInteractionError('doubleClick', by, value, error instanceof Error ? error : undefined);
    }
  }

  async rightClickElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      const actions = this.driver!.actions({ bridge: true });
      await actions.contextClick(element).perform();
      return { success: true, message: 'Right clicked successfully' };
    } catch (error) {
      throw new ElementInteractionError('rightClick', by, value, error instanceof Error ? error : undefined);
    }
  }

  async dragAndDrop(
    sourceBy: LocatorStrategy,
    sourceValue: string,
    targetBy: LocatorStrategy,
    targetValue: string,
    timeout: number = 10000
  ): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      const sourceLocator = getByLocator(sourceBy, sourceValue);
      const targetLocator = getByLocator(targetBy, targetValue);
      const sourceElement = await this.driver!.wait(until.elementLocated(sourceLocator), timeout);
      const targetElement = await this.driver!.wait(until.elementLocated(targetLocator), timeout);

      const actions = this.driver!.actions({ bridge: true });
      await actions.dragAndDrop(sourceElement, targetElement).perform();
      return { success: true, message: 'Drag and drop completed successfully' };
    } catch (error) {
      throw new ElementInteractionError('dragAndDrop', sourceBy, sourceValue, error instanceof Error ? error : undefined);
    }
  }
}
