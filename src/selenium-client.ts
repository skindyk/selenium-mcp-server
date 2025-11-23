/**
 * Selenium Client - Main facade class coordinating all browser automation operations
 * 
 * This class provides a unified interface to all Selenium WebDriver operations,
 * delegating to specialized managers for different operation categories.
 */

import { WebDriver } from 'selenium-webdriver';
import { BrowserManager } from './managers/browser-manager.js';
import { WindowManager } from './managers/window-manager.js';
import { ElementOperations } from './operations/element-operations.js';
import { WaitOperations } from './operations/wait-operations.js';
import { KeyboardOperations } from './operations/keyboard-operations.js';
import { FileOperations } from './operations/file-operations.js';
import { ScreenshotOperations } from './operations/screenshot-operations.js';
import { ScriptOperations } from './operations/script-operations.js';
import { AlertOperations } from './operations/alert-operations.js';
import { PageAnalyzer } from './discovery/page-analyzer.js';

// Re-export types for convenience
export type {
  BrowserOptions,
  LocatorStrategy,
  SuccessResponse,
  BrowserStartResponse,
  NavigateResponse,
  ScreenshotResponse,
  FindElementResponse,
  FindElementsResponse,
  ElementTextResponse,
  ElementAttributeResponse,
  ElementPropertyResponse,
  ElementCssValueResponse,
  ElementStateResponse,
  WindowHandlesResponse,
  WindowSizeResponse,
  UrlResponse,
  TitleResponse,
  PageSourceResponse,
  ScriptExecutionResponse,
  AlertTextResponse,
  LinkInfo,
  FormInfo,
  ButtonInfo,
  PageSummary,
  SelectorValidationInput,
  SelectorValidationResult,
  SelectorValidationResponse
} from './core/types.js';

/**
 * Main Selenium Client class providing browser automation capabilities
 * 
 * @example
 * ```typescript
 * const client = new SeleniumClient();
 * await client.startBrowser('chrome', { headless: true });
 * await client.navigate('https://example.com');
 * await client.clickElement('id', 'submit-button');
 * await client.closeBrowser();
 * ```
 */
export class SeleniumClient {
  private browserManager: BrowserManager;
  private windowManager: WindowManager;
  private elementOps: ElementOperations;
  private waitOps: WaitOperations;
  private keyboardOps: KeyboardOperations;
  private fileOps: FileOperations;
  private screenshotOps: ScreenshotOperations;
  private scriptOps: ScriptOperations;
  private alertOps: AlertOperations;
  private pageAnalyzer: PageAnalyzer;

  constructor() {
    this.browserManager = new BrowserManager();
    
    // Initialize other managers with null driver (will be set after browser starts)
    this.windowManager = new WindowManager(null);
    this.elementOps = new ElementOperations(null);
    this.waitOps = new WaitOperations(null);
    this.keyboardOps = new KeyboardOperations(null);
    this.fileOps = new FileOperations(null);
    this.screenshotOps = new ScreenshotOperations(null);
    this.scriptOps = new ScriptOperations(null);
    this.alertOps = new AlertOperations(null);
    this.pageAnalyzer = new PageAnalyzer(null);
  }

  /**
   * Update all managers with the current driver instance
   * @private
   */
  private syncDriver(): void {
    const driver = this.browserManager.getDriver();
    this.windowManager.setDriver(driver);
    this.elementOps.setDriver(driver);
    this.waitOps.setDriver(driver);
    this.keyboardOps.setDriver(driver);
    this.fileOps.setDriver(driver);
    this.screenshotOps.setDriver(driver);
    this.scriptOps.setDriver(driver);
    this.alertOps.setDriver(driver);
    this.pageAnalyzer.setDriver(driver);
  }

  /**
   * Set a mock driver for testing purposes
   * @internal
   */
  setDriver(driver: WebDriver | null): void {
    this.browserManager.setDriver(driver);
    this.syncDriver();
  }

  // ==================== Browser Management ====================
  
  async startBrowser(...args: Parameters<BrowserManager['startBrowser']>) {
    const result = await this.browserManager.startBrowser(...args);
    this.syncDriver(); // Sync driver to all managers
    return result;
  }

  async closeBrowser(...args: Parameters<BrowserManager['closeBrowser']>) {
    const result = await this.browserManager.closeBrowser(...args);
    this.syncDriver(); // Sync null driver to all managers
    return result;
  }

  async navigate(...args: Parameters<BrowserManager['navigate']>) {
    return this.browserManager.navigate(...args);
  }

  async getCurrentUrl(...args: Parameters<BrowserManager['getCurrentUrl']>) {
    return this.browserManager.getCurrentUrl(...args);
  }

  async getTitle(...args: Parameters<BrowserManager['getTitle']>) {
    return this.browserManager.getTitle(...args);
  }

  async refresh(...args: Parameters<BrowserManager['refresh']>) {
    return this.browserManager.refresh(...args);
  }

  async goBack(...args: Parameters<BrowserManager['goBack']>) {
    return this.browserManager.goBack(...args);
  }

  async goForward(...args: Parameters<BrowserManager['goForward']>) {
    return this.browserManager.goForward(...args);
  }

  async getPageSource(...args: Parameters<BrowserManager['getPageSource']>) {
    return this.browserManager.getPageSource(...args);
  }

  // ==================== Window Management ====================

  async switchToFrame(...args: Parameters<WindowManager['switchToFrame']>) {
    return this.windowManager.switchToFrame(...args);
  }

  async switchToDefaultContent(...args: Parameters<WindowManager['switchToDefaultContent']>) {
    return this.windowManager.switchToDefaultContent(...args);
  }

  async switchToWindow(...args: Parameters<WindowManager['switchToWindow']>) {
    return this.windowManager.switchToWindow(...args);
  }

  async getWindowHandles(...args: Parameters<WindowManager['getWindowHandles']>) {
    return this.windowManager.getWindowHandles(...args);
  }

  async maximizeWindow(...args: Parameters<WindowManager['maximizeWindow']>) {
    return this.windowManager.maximizeWindow(...args);
  }

  async minimizeWindow(...args: Parameters<WindowManager['minimizeWindow']>) {
    return this.windowManager.minimizeWindow(...args);
  }

  async setWindowSize(...args: Parameters<WindowManager['setWindowSize']>) {
    return this.windowManager.setWindowSize(...args);
  }

  async getWindowSize(...args: Parameters<WindowManager['getWindowSize']>) {
    return this.windowManager.getWindowSize(...args);
  }

  // ==================== Element Operations ====================

  async findElement(...args: Parameters<ElementOperations['findElement']>) {
    return this.elementOps.findElement(...args);
  }

  async findElements(...args: Parameters<ElementOperations['findElements']>) {
    return this.elementOps.findElements(...args);
  }

  async clickElement(...args: Parameters<ElementOperations['clickElement']>) {
    return this.elementOps.clickElement(...args);
  }

  async sendKeys(...args: Parameters<ElementOperations['sendKeys']>) {
    return this.elementOps.sendKeys(...args);
  }

  async clearElement(...args: Parameters<ElementOperations['clearElement']>) {
    return this.elementOps.clearElement(...args);
  }

  async getElementText(...args: Parameters<ElementOperations['getElementText']>) {
    return this.elementOps.getElementText(...args);
  }

  async getElementAttribute(...args: Parameters<ElementOperations['getElementAttribute']>) {
    return this.elementOps.getElementAttribute(...args);
  }

  async getElementProperty(...args: Parameters<ElementOperations['getElementProperty']>) {
    return this.elementOps.getElementProperty(...args);
  }

  async isElementDisplayed(...args: Parameters<ElementOperations['isElementDisplayed']>) {
    return this.elementOps.isElementDisplayed(...args);
  }

  async isElementEnabled(...args: Parameters<ElementOperations['isElementEnabled']>) {
    return this.elementOps.isElementEnabled(...args);
  }

  async isElementSelected(...args: Parameters<ElementOperations['isElementSelected']>) {
    return this.elementOps.isElementSelected(...args);
  }

  async getElementCssValue(...args: Parameters<ElementOperations['getElementCssValue']>) {
    return this.elementOps.getElementCssValue(...args);
  }

  async scrollToElement(...args: Parameters<ElementOperations['scrollToElement']>) {
    return this.elementOps.scrollToElement(...args);
  }

  async hoverElement(...args: Parameters<ElementOperations['hoverElement']>) {
    return this.elementOps.hoverElement(...args);
  }

  async doubleClickElement(...args: Parameters<ElementOperations['doubleClickElement']>) {
    return this.elementOps.doubleClickElement(...args);
  }

  async rightClickElement(...args: Parameters<ElementOperations['rightClickElement']>) {
    return this.elementOps.rightClickElement(...args);
  }

  async dragAndDrop(...args: Parameters<ElementOperations['dragAndDrop']>) {
    return this.elementOps.dragAndDrop(...args);
  }

  // ==================== Wait Operations ====================

  async waitForElement(...args: Parameters<WaitOperations['waitForElement']>) {
    return this.waitOps.waitForElement(...args);
  }

  async waitForElementVisible(...args: Parameters<WaitOperations['waitForElementVisible']>) {
    return this.waitOps.waitForElementVisible(...args);
  }

  async waitForElementClickable(...args: Parameters<WaitOperations['waitForElementClickable']>) {
    return this.waitOps.waitForElementClickable(...args);
  }

  async waitForTextPresent(...args: Parameters<WaitOperations['waitForTextPresent']>) {
    return this.waitOps.waitForTextPresent(...args);
  }

  // ==================== Keyboard Operations ====================

  async pressKey(...args: Parameters<KeyboardOperations['pressKey']>) {
    return this.keyboardOps.pressKey(...args);
  }

  async pressKeyCombo(...args: Parameters<KeyboardOperations['pressKeyCombo']>) {
    return this.keyboardOps.pressKeyCombo(...args);
  }

  // ==================== File Operations ====================

  async uploadFile(...args: Parameters<FileOperations['uploadFile']>) {
    return this.fileOps.uploadFile(...args);
  }

  // ==================== Screenshot Operations ====================

  async takeScreenshot(...args: Parameters<ScreenshotOperations['takeScreenshot']>) {
    return this.screenshotOps.takeScreenshot(...args);
  }

  // ==================== Script Operations ====================

  async executeScript<T = unknown>(...args: Parameters<ScriptOperations['executeScript']>) {
    return this.scriptOps.executeScript<T>(...args);
  }

  // ==================== Alert/Dialog Operations ====================

  async acceptAlert(...args: Parameters<AlertOperations['acceptAlert']>) {
    return this.alertOps.acceptAlert(...args);
  }

  async dismissAlert(...args: Parameters<AlertOperations['dismissAlert']>) {
    return this.alertOps.dismissAlert(...args);
  }

  async getAlertText(...args: Parameters<AlertOperations['getAlertText']>) {
    return this.alertOps.getAlertText(...args);
  }

  async sendAlertText(...args: Parameters<AlertOperations['sendAlertText']>) {
    return this.alertOps.sendAlertText(...args);
  }

  // ==================== AI Discovery ====================

  async getAllLinks(...args: Parameters<PageAnalyzer['getAllLinks']>) {
    return this.pageAnalyzer.getAllLinks(...args);
  }

  async getAllForms(...args: Parameters<PageAnalyzer['getAllForms']>) {
    return this.pageAnalyzer.getAllForms(...args);
  }

  async getAllButtons(...args: Parameters<PageAnalyzer['getAllButtons']>) {
    return this.pageAnalyzer.getAllButtons(...args);
  }

  async getPageSummary(...args: Parameters<PageAnalyzer['getPageSummary']>) {
    return this.pageAnalyzer.getPageSummary(...args);
  }

  async validateSelectors(...args: Parameters<PageAnalyzer['validateSelectors']>) {
    return this.pageAnalyzer.validateSelectors(...args);
  }
}
