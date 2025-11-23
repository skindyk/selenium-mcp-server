/**
 * File Operations - Handles file upload operations
 */

import { WebDriver, By, until } from 'selenium-webdriver';
import { SuccessResponse, LocatorStrategy } from '../core/types.js';
import { getByLocator, ensureDriverExists } from '../core/locator-utils.js';

/**
 * Manages file upload operations
 */
export class FileOperations {
  constructor(private driver: WebDriver | null) {}

  setDriver(driver: WebDriver | null): void {
    this.driver = driver;
  }

  /**
   * Upload a file to a file input element.
   * 
   * @param by - Locator strategy for the file input element
   * @param value - Selector value for the file input element
   * @param filePath - Absolute or relative path to the file to upload
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   * @returns Promise with success status and message
   * @throws Error if browser is not started, file not found, or upload fails
   * 
   * @example
   * await fileOps.uploadFile('id', 'file-input', './documents/resume.pdf');
   */
  async uploadFile(
    by: LocatorStrategy,
    value: string,
    filePath: string,
    timeout: number = 10000
  ): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    
    if (!filePath || filePath.trim().length === 0) {
      throw new Error('File path cannot be empty');
    }
    
    try {
      const locator = getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);

      // Check if file exists
      const fs = await import('fs');
      const path = await import('path');

      // Convert to absolute path first
      const absolutePath = path.resolve(filePath);
      
      // Security check: prevent path traversal (works across all OS including Windows drive letters)
      const cwd = process.cwd();
      const relativePath = path.relative(cwd, absolutePath);
      if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        throw new Error('File path must be within the current working directory');
      }
      
      if (!fs.existsSync(absolutePath)) {
        throw new Error(`File not found: ${absolutePath}`);
      }

      await element.sendKeys(absolutePath);
      return { success: true, message: `File uploaded successfully: ${absolutePath}` };
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
