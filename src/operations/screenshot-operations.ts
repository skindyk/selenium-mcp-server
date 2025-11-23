/**
 * Screenshot Operations - Handles screenshot capture and saving
 */

import { WebDriver } from 'selenium-webdriver';
import { ScreenshotResponse } from '../core/types.js';
import { ensureDriverExists } from '../core/locator-utils.js';

/**
 * Manages screenshot capture operations
 */
export class ScreenshotOperations {
  constructor(private driver: WebDriver | null) {}

  setDriver(driver: WebDriver | null): void {
    this.driver = driver;
  }

  /**
   * Capture a screenshot of the current browser viewport.
   * 
   * @param outputPath - Optional file path to save screenshot (creates directories if needed)
   * @returns Promise with success status, message, and path (if saved to file)
   * @throws Error if screenshot capture fails or path is invalid
   * 
   * @example
   * // Save to file
   * await screenshotOps.takeScreenshot('./screenshots/homepage.png');
   * 
   * // Get base64 data only
   * const result = await screenshotOps.takeScreenshot();
   */
  async takeScreenshot(outputPath?: string): Promise<ScreenshotResponse> {
    ensureDriverExists(this.driver);
    try {
      const screenshot = await this.driver!.takeScreenshot();

      if (outputPath) {
        // Validate and sanitize output path
        if (outputPath.trim().length === 0) {
          throw new Error('Output path cannot be empty');
        }
        
        const path = await import('path');
        const fs = await import('fs');
        
        // Convert to absolute path first
        const absolutePath = path.resolve(outputPath);
        
        // Security check: prevent path traversal (works across all OS including Windows drive letters)
        const cwd = process.cwd();
        const relativePath = path.relative(cwd, absolutePath);
        if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
          throw new Error('Output path must be within the current working directory');
        }
        
        // Ensure directory exists
        const directory = path.dirname(absolutePath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }
        
        fs.writeFileSync(absolutePath, screenshot, 'base64');
        return { success: true, message: 'Screenshot saved successfully', path: absolutePath };
      } else {
        return { success: true, message: 'Screenshot taken successfully (base64 data available)' };
      }
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
