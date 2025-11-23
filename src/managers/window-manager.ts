/**
 * Window Manager - Handles window and frame operations
 */

import { WebDriver, WebElement } from 'selenium-webdriver';
import {
  SuccessResponse,
  WindowHandlesResponse,
  WindowSizeResponse
} from '../core/types.js';
import { ensureDriverExists } from '../core/locator-utils.js';

/**
 * Manages browser windows, frames, and window sizing
 */
export class WindowManager {
  constructor(private driver: WebDriver | null) {}

  setDriver(driver: WebDriver | null): void {
    this.driver = driver;
  }

  /**
   * Switch to a specific frame or iframe.
   * 
   * @param frameReference - Frame reference (index, name, id, or WebElement)
   * @returns Promise with success status and message
   * @throws Error if browser is not started or frame switch fails
   * 
   * @example
   * await windowManager.switchToFrame(0); // By index
   * await windowManager.switchToFrame('frameName'); // By name/id
   */
  async switchToFrame(frameReference: string | number | WebElement): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      // Handle string input that might be a number
      let actualFrameReference: string | number | WebElement = frameReference;
      if (typeof frameReference === 'string') {
        // Try to parse as number if it's a numeric string
        const numericValue = parseInt(frameReference, 10);
        if (!isNaN(numericValue) && numericValue.toString() === frameReference) {
          actualFrameReference = numericValue;
        }
      }

      await this.driver!.switchTo().frame(actualFrameReference);
      return { success: true, message: 'Switched to frame successfully' };
    } catch (error) {
      throw new Error(`Failed to switch to frame: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Switch back to the main document from a frame.
   * 
   * @returns Promise with success status and message
   * @throws Error if browser is not started or switch fails
   * 
   * @example
   * await windowManager.switchToDefaultContent();
   */
  async switchToDefaultContent(): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      await this.driver!.switchTo().defaultContent();
      return { success: true, message: 'Switched to default content successfully' };
    } catch (error) {
      throw new Error(`Failed to switch to default content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Switch to a specific browser window or tab.
   * 
   * @param windowHandle - Window handle to switch to
   * @returns Promise with success status and message
   * @throws Error if browser is not started or window switch fails
   * 
   * @example
   * const { handles } = await windowManager.getWindowHandles();
   * await windowManager.switchToWindow(handles[1]);
   */
  async switchToWindow(windowHandle: string): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      await this.driver!.switchTo().window(windowHandle);
      return { success: true, message: 'Switched to window successfully' };
    } catch (error) {
      throw new Error(`Failed to switch to window: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get all available window handles.
   * 
   * @returns Promise with array of window handles
   * @throws Error if browser is not started or getting handles fails
   * 
   * @example
   * const { handles } = await windowManager.getWindowHandles();
   */
  async getWindowHandles(): Promise<WindowHandlesResponse> {
    ensureDriverExists(this.driver);
    try {
      const handles = await this.driver!.getAllWindowHandles();
      return { handles };
    } catch (error) {
      throw new Error(`Failed to get window handles: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Maximize the browser window.
   * 
   * @returns Promise with success status and message
   * @throws Error if browser is not started or maximize fails
   * 
   * @example
   * await windowManager.maximizeWindow();
   */
  async maximizeWindow(): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      await this.driver!.manage().window().maximize();
      return { success: true, message: 'Window maximized successfully' };
    } catch (error) {
      throw new Error(`Failed to maximize window: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Minimize the browser window.
   * 
   * @returns Promise with success status and message
   * @throws Error if browser is not started or minimize fails
   * 
   * @example
   * await windowManager.minimizeWindow();
   */
  async minimizeWindow(): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      await this.driver!.manage().window().minimize();
      return { success: true, message: 'Window minimized successfully' };
    } catch (error) {
      throw new Error(`Failed to minimize window: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set the browser window size.
   * 
   * @param width - Window width in pixels (must be positive integer)
   * @param height - Window height in pixels (must be positive integer)
   * @returns Promise with success status and message
   * @throws Error if browser is not started, dimensions invalid, or resize fails
   * 
   * @example
   * await windowManager.setWindowSize(1920, 1080);
   */
  async setWindowSize(width: number, height: number): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    
    // Validate dimensions - both must be positive integers
    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
      throw new Error(`Invalid window dimensions: width=${width}, height=${height}. Both must be positive integers.`);
    }
    
    try {
      await this.driver!.manage().window().setRect({ width, height, x: 0, y: 0 });
      return { success: true, message: `Window size set to ${width}x${height}` };
    } catch (error) {
      throw new Error(`Failed to set window size: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get the current browser window size.
   * 
   * @returns Promise with width and height
   * @throws Error if browser is not started or getting size fails
   * 
   * @example
   * const { width, height } = await windowManager.getWindowSize();
   */
  async getWindowSize(): Promise<WindowSizeResponse> {
    ensureDriverExists(this.driver);
    try {
      const rect = await this.driver!.manage().window().getRect();
      return { width: rect.width, height: rect.height };
    } catch (error) {
      throw new Error(`Failed to get window size: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
