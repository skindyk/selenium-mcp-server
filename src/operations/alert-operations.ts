/**
 * Alert and Dialog Operations - Handles browser alerts, confirms, and prompts
 */

import { WebDriver } from 'selenium-webdriver';
import { SuccessResponse } from '../core/types.js';
import { ensureDriverExists } from '../core/locator-utils.js';
import { AlertError, BrowserNotStartedError } from '../core/errors.js';

export interface AlertTextResponse {
  text: string;
}

/**
 * Manages browser alert, confirm, and prompt dialogs
 */
export class AlertOperations {
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
   * Accept (click OK on) the current alert dialog.
   * 
   * @returns Promise with success status and message
   * @throws BrowserNotStartedError if browser is not started
   * @throws AlertError if accepting alert fails
   * 
   * @example
   * await alertOps.acceptAlert();
   */
  async acceptAlert(): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      await this.driver!.switchTo().alert().accept();
      return { success: true, message: 'Alert accepted successfully' };
    } catch (error) {
      throw new AlertError('accept', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Dismiss (click Cancel on) the current alert dialog.
   * 
   * @returns Promise with success status and message
   * @throws BrowserNotStartedError if browser is not started
   * @throws AlertError if dismissing alert fails
   * 
   * @example
   * await alertOps.dismissAlert();
   */
  async dismissAlert(): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      await this.driver!.switchTo().alert().dismiss();
      return { success: true, message: 'Alert dismissed successfully' };
    } catch (error) {
      throw new AlertError('dismiss', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get the text content of the current alert dialog.
   * 
   * @returns Promise with alert text
   * @throws BrowserNotStartedError if browser is not started
   * @throws AlertError if getting alert text fails
   * 
   * @example
   * const { text } = await alertOps.getAlertText();
   * console.log(`Alert says: ${text}`);
   */
  async getAlertText(): Promise<AlertTextResponse> {
    ensureDriverExists(this.driver);
    try {
      const text = await this.driver!.switchTo().alert().getText();
      return { text };
    } catch (error) {
      throw new AlertError('get text from', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Send text to a prompt dialog (for prompts that accept user input).
   * 
   * @param text - Text to send to the prompt
   * @returns Promise with success status and message
   * @throws BrowserNotStartedError if browser is not started
   * @throws AlertError if sending keys fails
   * 
   * @example
   * await alertOps.sendAlertText('John Doe');
   * await alertOps.acceptAlert();
   */
  async sendAlertText(text: string): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      await this.driver!.switchTo().alert().sendKeys(text);
      return { success: true, message: 'Text sent to alert successfully' };
    } catch (error) {
      throw new AlertError('send text to', error instanceof Error ? error : undefined);
    }
  }
}
