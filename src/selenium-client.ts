import { Builder, WebDriver, By, until, WebElement, Key } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';
import * as firefox from 'selenium-webdriver/firefox.js';
import * as edge from 'selenium-webdriver/edge.js';
import * as safari from 'selenium-webdriver/safari.js';

export interface BrowserOptions {
  headless?: boolean;
  arguments?: string[];
  windowSize?: { width: number; height: number };
}

export type LocatorStrategy = 'id' | 'css' | 'xpath' | 'name' | 'tag' | 'class' | 'linkText' | 'partialLinkText';

export class SeleniumClient {
  private driver: WebDriver | null = null;
  private readonly MAX_LINKS_TO_EXTRACT = 50;
  private readonly MAX_CONTENT_LENGTH = 500;
  private readonly DEFAULT_TIMEOUT = 10000;

  /**
   * Start a new browser session with specified browser and options.
   * If a browser is already running, it will be closed first.
   * 
   * @param browser - Browser type: 'chrome', 'firefox', 'edge', or 'safari'
   * @param options - Browser configuration options
   * @param options.headless - Run browser in headless mode (not supported by Safari)
   * @param options.arguments - Additional browser-specific arguments
   * @param options.windowSize - Initial window dimensions {width, height}
   * @returns Promise with success status, message, and optional warnings array
   * @throws Error if browser driver is not installed or incompatible
   * 
   * @example
   * await client.startBrowser('chrome', { headless: true });
   * await client.startBrowser('firefox', { windowSize: { width: 1920, height: 1080 } });
   */
  async startBrowser(browser: string = 'chrome', options: BrowserOptions = {}): Promise<{ success: boolean; message: string; warnings?: string[] }> {
    try {
      if (this.driver) {
        try {
          await this.driver.quit();
        } catch (error) {
          console.error('Warning: Failed to close previous browser session:', error);
        }
      }

      let builder = new Builder();

      switch (browser.toLowerCase()) {
        case 'chrome':
          const chromeOptions = new chrome.Options();
          if (options.headless) {
            chromeOptions.addArguments('--headless');
          }
          if (options.arguments) {
            chromeOptions.addArguments(...options.arguments);
          }
          // Window size will be set after browser starts
          builder = builder.forBrowser('chrome').setChromeOptions(chromeOptions);
          break;

        case 'firefox':
          const firefoxOptions = new firefox.Options();
          if (options.headless) {
            firefoxOptions.addArguments('--headless');
          }
          if (options.arguments) {
            firefoxOptions.addArguments(...options.arguments);
          }
          builder = builder.forBrowser('firefox').setFirefoxOptions(firefoxOptions);
          break;

        case 'edge':
          const edgeOptions = new edge.Options();
          if (options.headless) {
            edgeOptions.addArguments('--headless');
          }
          if (options.arguments) {
            edgeOptions.addArguments(...options.arguments);
          }
          builder = builder.forBrowser('MicrosoftEdge').setEdgeOptions(edgeOptions);
          break;

        case 'safari':
          const safariOptions = new safari.Options();
          // Note: Safari has very limited options support compared to other browsers
          if (options.arguments) {
            console.warn('Safari does not support custom arguments. Ignoring provided arguments.');
          }
          // Note: Safari doesn't support headless mode
          if (options.headless) {
            console.warn('Safari does not support headless mode. Running in normal mode.');
          }
          builder = builder.forBrowser('safari').setSafariOptions(safariOptions);
          break;

        default:
          throw new Error(`Unsupported browser: ${browser}`);
      }

      this.driver = await builder.build();

      // Set window size after browser starts (removed from chrome args to avoid duplication)
      if (options.windowSize) {
        try {
          await this.driver.manage().window().setRect({
            width: options.windowSize.width,
            height: options.windowSize.height,
            x: 0,
            y: 0
          });
        } catch (error) {
          // Safari may fail on window sizing, continue anyway
          if (browser.toLowerCase() === 'safari') {
            console.warn('Safari window sizing may have failed:', error);
          } else {
            throw error;
          }
        }
      }

      // Build warnings array for Safari
      const warnings: string[] = [];
      if (browser.toLowerCase() === 'safari') {
        if (options.arguments) {
          warnings.push('Safari does not support custom arguments. Ignoring provided arguments.');
        }
        if (options.headless) {
          warnings.push('Safari does not support headless mode. Running in normal mode.');
        }
      }

      return warnings.length > 0 
        ? { success: true, message: `${browser} browser started successfully`, warnings }
        : { success: true, message: `${browser} browser started successfully` };
    } catch (error) {
      throw new Error(`Failed to start browser: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async closeBrowser(): Promise<{ success: boolean; message: string }> {
    try {
      if (this.driver) {
        await this.driver.quit();
        this.driver = null;
        return { success: true, message: 'Browser closed successfully' };
      }
      return { success: true, message: 'No browser session to close' };
    } catch (error) {
      throw new Error(`Failed to close browser: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Navigate to a specified URL.
   * 
   * @param url - The URL to navigate to (must be a valid URL with protocol)
   * @returns Promise with success status, message, and current URL
   * @throws Error if browser is not started or URL format is invalid
   * 
   * @example
   * await client.navigate('https://example.com');
   */
  async navigate(url: string): Promise<{ success: boolean; message: string; url: string }> {
    this.ensureDriverExists();
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid URL format: ${url}`);
    }
    
    try {
      await this.driver!.get(url);
      const currentUrl = await this.driver!.getCurrentUrl();
      return { success: true, message: 'Navigation successful', url: currentUrl };
    } catch (error) {
      throw new Error(`Failed to navigate to ${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getCurrentUrl(): Promise<{ url: string }> {
    this.ensureDriverExists();
    try {
      const url = await this.driver!.getCurrentUrl();
      return { url };
    } catch (error) {
      throw new Error(`Failed to get current URL: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getTitle(): Promise<{ title: string }> {
    this.ensureDriverExists();
    try {
      const title = await this.driver!.getTitle();
      return { title };
    } catch (error) {
      throw new Error(`Failed to get page title: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async refresh(): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      await this.driver!.navigate().refresh();
      return { success: true, message: 'Page refreshed successfully' };
    } catch (error) {
      throw new Error(`Failed to refresh page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async goBack(): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      await this.driver!.navigate().back();
      return { success: true, message: 'Navigated back successfully' };
    } catch (error) {
      throw new Error(`Failed to go back: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async goForward(): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      await this.driver!.navigate().forward();
      return { success: true, message: 'Navigated forward successfully' };
    } catch (error) {
      throw new Error(`Failed to go forward: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private getByLocator(by: LocatorStrategy, value: string): By {
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
   * Find a single element on the page using the specified locator strategy.
   * 
   * @param by - Locator strategy: 'id', 'css', 'xpath', 'name', 'tag', 'class', 'linkText', 'partialLinkText'
   * @param value - The selector value matching the chosen strategy
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   * @returns Promise with found status and message
   * 
   * @example
   * await client.findElement('id', 'submit-button');
   * await client.findElement('css', '.login-form input[type="email"]');
   * await client.findElement('xpath', '//button[@class="submit"]');
   */
  async findElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ found: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      await this.driver!.wait(until.elementLocated(locator), timeout);
      return { found: true, message: 'Element found successfully' };
    } catch (error) {
      return { found: false, message: `Element not found: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  async findElements(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ count: number; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      // Wait a bit for elements to load
      await new Promise(resolve => setTimeout(resolve, Math.min(timeout, 1000)));
      const elements = await this.driver!.findElements(locator);
      return { count: elements.length, message: `Found ${elements.length} elements` };
    } catch (error) {
      throw new Error(`Failed to find elements: ${error instanceof Error ? error.message : String(error)}`);
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
   * await client.clickElement('id', 'login-button');
   */
  async clickElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      await element.click();
      return { success: true, message: 'Element clicked successfully' };
    } catch (error) {
      throw new Error(`Failed to click element [${by}="${value}"]: ${error instanceof Error ? error.message : String(error)}`);
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
   * await client.sendKeys('name', 'username', 'john@example.com');
   */
  async sendKeys(by: LocatorStrategy, value: string, text: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      await element.sendKeys(text);
      return { success: true, message: 'Text sent successfully' };
    } catch (error) {
      throw new Error(`Failed to send keys to element [${by}="${value}"]: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async clearElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await element.clear();
      return { success: true, message: 'Element cleared successfully' };
    } catch (error) {
      throw new Error(`Failed to clear element: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getElementText(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ text: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const text = await element.getText();
      return { text };
    } catch (error) {
      throw new Error(`Failed to get element text [${by}="${value}"]: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getElementAttribute(by: LocatorStrategy, value: string, attribute: string, timeout: number = 10000): Promise<{ attribute: string; value: string | null }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const attrValue = await element.getAttribute(attribute);
      return { attribute, value: attrValue };
    } catch (error) {
      throw new Error(`Failed to get element attribute: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async isElementDisplayed(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ displayed: boolean }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const displayed = await element.isDisplayed();
      return { displayed };
    } catch (error) {
      return { displayed: false };
    }
  }

  async isElementEnabled(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ enabled: boolean }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const enabled = await element.isEnabled();
      return { enabled };
    } catch (error) {
      return { enabled: false };
    }
  }

  async isElementSelected(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ selected: boolean }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const selected = await element.isSelected();
      return { selected };
    } catch (error) {
      return { selected: false };
    }
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
   * await client.takeScreenshot('./screenshots/homepage.png');
   * 
   * // Get base64 data only
   * const result = await client.takeScreenshot();
   */
  async takeScreenshot(outputPath?: string): Promise<{ success: boolean; message: string; path?: string }> {
    this.ensureDriverExists();
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
        
        // Security check: prevent path traversal after resolving
        const cwd = process.cwd();
        if (!absolutePath.startsWith(cwd)) {
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
   * await client.executeScript('return document.querySelectorAll(".item").length');
   * 
   * // Scroll to bottom
   * await client.executeScript('window.scrollTo(0, document.body.scrollHeight)');
   */
  async executeScript(script: string, args: any[] = []): Promise<{ result: any }> {
    this.ensureDriverExists();
    try {
      const result = await this.driver!.executeScript(script, ...args);
      return { result };
    } catch (error) {
      throw new Error(`Failed to execute script: ${error instanceof Error ? error.message : String(error)}`);
    }
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
   * await client.waitForElement('css', '.dynamic-content');
   */
  async waitForElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      await this.driver!.wait(until.elementLocated(locator), timeout);
      return { success: true, message: 'Element found within timeout' };
    } catch (error) {
      throw new Error(`Element not found within timeout: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async switchToFrame(frameReference: string | number | WebElement): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
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

  async switchToDefaultContent(): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      await this.driver!.switchTo().defaultContent();
      return { success: true, message: 'Switched to default content successfully' };
    } catch (error) {
      throw new Error(`Failed to switch to default content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async switchToWindow(windowHandle: string): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      await this.driver!.switchTo().window(windowHandle);
      return { success: true, message: 'Switched to window successfully' };
    } catch (error) {
      throw new Error(`Failed to switch to window: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getWindowHandles(): Promise<{ handles: string[] }> {
    this.ensureDriverExists();
    try {
      const handles = await this.driver!.getAllWindowHandles();
      return { handles };
    } catch (error) {
      throw new Error(`Failed to get window handles: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Advanced Mouse Actions
  async hoverElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const actions = this.driver!.actions({ bridge: true });
      await actions.move({ origin: element }).perform();
      return { success: true, message: 'Hovered over element successfully' };
    } catch (error) {
      throw new Error(`Failed to hover over element [${by}="${value}"]: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async doubleClickElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      const actions = this.driver!.actions({ bridge: true });
      await actions.doubleClick(element).perform();
      return { success: true, message: 'Double clicked element successfully' };
    } catch (error) {
      throw new Error(`Failed to double click element: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async rightClickElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      const actions = this.driver!.actions({ bridge: true });
      await actions.contextClick(element).perform();
      return { success: true, message: 'Right clicked element successfully' };
    } catch (error) {
      throw new Error(`Failed to right click element: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async dragAndDrop(
    sourceBy: LocatorStrategy,
    sourceValue: string,
    targetBy: LocatorStrategy,
    targetValue: string,
    timeout: number = 10000
  ): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const sourceLocator = this.getByLocator(sourceBy, sourceValue);
      const targetLocator = this.getByLocator(targetBy, targetValue);
      const sourceElement = await this.driver!.wait(until.elementLocated(sourceLocator), timeout);
      const targetElement = await this.driver!.wait(until.elementLocated(targetLocator), timeout);

      const actions = this.driver!.actions({ bridge: true });
      await actions.dragAndDrop(sourceElement, targetElement).perform();
      return { success: true, message: 'Drag and drop completed successfully' };
    } catch (error) {
      throw new Error(`Failed to perform drag and drop: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Keyboard Actions
  async pressKey(key: string): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    
    if (!key || key.trim().length === 0) {
      throw new Error('Key parameter cannot be empty');
    }
    
    try {
      const actions = this.driver!.actions({ bridge: true });

      // Handle special keys
      let keyToPress: string;
      switch (key.toLowerCase()) {
        case 'enter':
        case 'return':
          keyToPress = Key.ENTER;
          break;
        case 'tab':
          keyToPress = Key.TAB;
          break;
        case 'escape':
        case 'esc':
          keyToPress = Key.ESCAPE;
          break;
        case 'space':
          keyToPress = Key.SPACE;
          break;
        case 'backspace':
          keyToPress = Key.BACK_SPACE;
          break;
        case 'delete':
          keyToPress = Key.DELETE;
          break;
        case 'arrowup':
        case 'up':
          keyToPress = Key.ARROW_UP;
          break;
        case 'arrowdown':
        case 'down':
          keyToPress = Key.ARROW_DOWN;
          break;
        case 'arrowleft':
        case 'left':
          keyToPress = Key.ARROW_LEFT;
          break;
        case 'arrowright':
        case 'right':
          keyToPress = Key.ARROW_RIGHT;
          break;
        case 'home':
          keyToPress = Key.HOME;
          break;
        case 'end':
          keyToPress = Key.END;
          break;
        case 'pageup':
          keyToPress = Key.PAGE_UP;
          break;
        case 'pagedown':
          keyToPress = Key.PAGE_DOWN;
          break;
        case 'f1':
          keyToPress = Key.F1;
          break;
        case 'f2':
          keyToPress = Key.F2;
          break;
        case 'f3':
          keyToPress = Key.F3;
          break;
        case 'f4':
          keyToPress = Key.F4;
          break;
        case 'f5':
          keyToPress = Key.F5;
          break;
        case 'f6':
          keyToPress = Key.F6;
          break;
        case 'f7':
          keyToPress = Key.F7;
          break;
        case 'f8':
          keyToPress = Key.F8;
          break;
        case 'f9':
          keyToPress = Key.F9;
          break;
        case 'f10':
          keyToPress = Key.F10;
          break;
        case 'f11':
          keyToPress = Key.F11;
          break;
        case 'f12':
          keyToPress = Key.F12;
          break;
        case 'shift':
          keyToPress = Key.SHIFT;
          break;
        case 'control':
        case 'ctrl':
          keyToPress = Key.CONTROL;
          break;
        case 'alt':
          keyToPress = Key.ALT;
          break;
        default:
          keyToPress = key;
      }

      await actions.keyDown(keyToPress).keyUp(keyToPress).perform();
      return { success: true, message: `Key '${key}' pressed successfully` };
    } catch (error) {
      throw new Error(`Failed to press key: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async pressKeyCombo(keys: string[]): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    
    // Validate keys array
    if (!keys || keys.length === 0) {
      throw new Error('Keys array cannot be empty');
    }
    if (keys.some(key => !key || key.trim().length === 0)) {
      throw new Error('Keys array cannot contain empty or whitespace-only strings');
    }
    
    try {
      const actions = this.driver!.actions({ bridge: true });

      // Press all keys down
      for (const key of keys) {
        let keyToPress: string;
        switch (key.toLowerCase()) {
          case 'control':
          case 'ctrl':
            keyToPress = Key.CONTROL;
            break;
          case 'shift':
            keyToPress = Key.SHIFT;
            break;
          case 'alt':
            keyToPress = Key.ALT;
            break;
          case 'meta':
          case 'cmd':
            keyToPress = Key.META;
            break;
          default:
            keyToPress = key;
        }
        actions.keyDown(keyToPress);
      }

      // Release all keys in reverse order
      for (let i = keys.length - 1; i >= 0; i--) {
        let keyToPress: string;
        switch (keys[i].toLowerCase()) {
          case 'control':
          case 'ctrl':
            keyToPress = Key.CONTROL;
            break;
          case 'shift':
            keyToPress = Key.SHIFT;
            break;
          case 'alt':
            keyToPress = Key.ALT;
            break;
          case 'meta':
          case 'cmd':
            keyToPress = Key.META;
            break;
          default:
            keyToPress = keys[i];
        }
        actions.keyUp(keyToPress);
      }

      await actions.perform();
      return { success: true, message: `Key combination '${keys.join('+')}' pressed successfully` };
    } catch (error) {
      throw new Error(`Failed to press key combination: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // File Operations
  async uploadFile(by: LocatorStrategy, value: string, filePath: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    
    if (!filePath || filePath.trim().length === 0) {
      throw new Error('File path cannot be empty');
    }
    
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);

      // Check if file exists
      const fs = await import('fs');
      const path = await import('path');

      // Convert to absolute path first
      const absolutePath = path.resolve(filePath);
      
      // Security check: prevent path traversal after resolving
      const cwd = process.cwd();
      if (!absolutePath.startsWith(cwd)) {
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

  // Enhanced Navigation
  async getPageSource(): Promise<{ source: string }> {
    this.ensureDriverExists();
    try {
      const source = await this.driver!.getPageSource();
      return { source };
    } catch (error) {
      throw new Error(`Failed to get page source: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async maximizeWindow(): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      await this.driver!.manage().window().maximize();
      return { success: true, message: 'Window maximized successfully' };
    } catch (error) {
      throw new Error(`Failed to maximize window: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async minimizeWindow(): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      await this.driver!.manage().window().minimize();
      return { success: true, message: 'Window minimized successfully' };
    } catch (error) {
      throw new Error(`Failed to minimize window: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async setWindowSize(width: number, height: number): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    
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

  async getWindowSize(): Promise<{ width: number; height: number }> {
    this.ensureDriverExists();
    try {
      const rect = await this.driver!.manage().window().getRect();
      return { width: rect.width, height: rect.height };
    } catch (error) {
      throw new Error(`Failed to get window size: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Enhanced Element Operations
  async getElementProperty(by: LocatorStrategy, value: string, property: string, timeout: number = 10000): Promise<{ property: string; value: any }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      // Use getAttribute for properties like 'value', 'checked', etc.
      const propValue = await element.getAttribute(property);
      return { property, value: propValue };
    } catch (error) {
      throw new Error(`Failed to get element property: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getElementCssValue(by: LocatorStrategy, value: string, cssProperty: string, timeout: number = 10000): Promise<{ property: string; value: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      const cssValue = await element.getCssValue(cssProperty);
      return { property: cssProperty, value: cssValue };
    } catch (error) {
      throw new Error(`Failed to get element CSS value: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async scrollToElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.executeScript('arguments[0].scrollIntoView(true);', element);
      return { success: true, message: 'Scrolled to element successfully' };
    } catch (error) {
      throw new Error(`Failed to scroll to element [${by}="${value}"]: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Wait Conditions
  async waitForElementVisible(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsVisible(element), timeout);
      return { success: true, message: 'Element became visible within timeout' };
    } catch (error) {
      throw new Error(`Element [${by}="${value}"] did not become visible within timeout: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async waitForElementClickable(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      return { success: true, message: 'Element became clickable within timeout' };
    } catch (error) {
      throw new Error(`Element did not become clickable within timeout: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async waitForTextPresent(by: LocatorStrategy, value: string, text: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      await this.driver!.wait(until.elementTextContains(this.driver!.findElement(locator), text), timeout);
      return { success: true, message: `Text '${text}' found in element within timeout` };
    } catch (error) {
      throw new Error(`Text '${text}' not found in element within timeout: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // AI-OPTIMIZED DISCOVERY METHODS
  /**
   * Extract all links from the current page with their text, href, and best selector.
   * Limited to first 50 links for performance.
   * 
   * @returns Promise with array of link objects containing text, href, and selector
   * @throws Error if extraction fails
   * 
   * @example
   * const { links } = await client.getAllLinks();
   * links.forEach(link => console.log(`${link.text}: ${link.href}`));
   */
  async getAllLinks(): Promise<{ links: Array<{ text: string; href: string; selector: string }> }> {
    this.ensureDriverExists();
    try {
      const links = await this.driver!.findElements(By.css('a[href]'));
      const linksToProcess = links.slice(0, this.MAX_LINKS_TO_EXTRACT);

      const linkDataPromises = linksToProcess.map(async (link) => {
        const [text, href, id, className] = await Promise.all([
          link.getText(),
          link.getAttribute('href'),
          link.getAttribute('id'),
          link.getAttribute('class')
        ]);

        // Generate best selector
        let selector = '';
        if (id) {
          selector = `#${id}`;
        } else if (className) {
          selector = `.${className.split(' ')[0]}`;
        } else {
          selector = `a[href="${href}"]`;
        }

        return {
          text: text.trim(),
          href: href || '',
          selector
        };
      });

      const linkData = await Promise.all(linkDataPromises);
      return { links: linkData };
    } catch (error) {
      throw new Error(`Failed to get all links: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAllForms(): Promise<{ forms: Array<{ action: string; method: string; fields: Array<{ name: string; type: string; label: string; selector: string }> }> }> {
    this.ensureDriverExists();
    try {
      const forms = await this.driver!.findElements(By.css('form'));

      const formDataPromises = forms.map(async (form) => {
        const [action, method] = await Promise.all([
          form.getAttribute('action'),
          form.getAttribute('method')
        ]);

        // Get all form fields
        const inputs = await form.findElements(By.css('input, select, textarea'));

        const fieldPromises = inputs.map(async (input) => {
          const [name, type, id, placeholder] = await Promise.all([
            input.getAttribute('name'),
            input.getAttribute('type'),
            input.getAttribute('id'),
            input.getAttribute('placeholder')
          ]);

          // Try to find associated label
          let label = '';
          if (id) {
            try {
              const labelElement = await this.driver!.findElement(By.css(`label[for="${id}"]`));
              label = await labelElement.getText();
            } catch {
              // No label found
            }
          }

          // Generate selector
          let selector = '';
          if (id) {
            selector = `#${id}`;
          } else if (name) {
            selector = `[name="${name}"]`;
          } else {
            selector = `[type="${type || 'text'}"]`;
          }

          return {
            name: name || '',
            type: type || 'text',
            label: label || placeholder || '',
            selector
          };
        });

        const fields = await Promise.all(fieldPromises);

        return {
          action: action || '',
          method: method || 'GET',
          fields
        };
      });

      const formData = await Promise.all(formDataPromises);
      return { forms: formData };
    } catch (error) {
      throw new Error(`Failed to get all forms: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAllButtons(): Promise<{ buttons: Array<{ text: string; type: string; selector: string }> }> {
    this.ensureDriverExists();
    try {
      const buttons = await this.driver!.findElements(By.css('button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]'));

      const buttonDataPromises = buttons.map(async (button) => {
        const [text, value, type, id, className] = await Promise.all([
          button.getText(),
          button.getAttribute('value'),
          button.getAttribute('type'),
          button.getAttribute('id'),
          button.getAttribute('class')
        ]);

        const displayText = text || value || '';

        // Generate best selector
        let selector = '';
        if (id) {
          selector = `#${id}`;
        } else if (className) {
          selector = `.${className.split(' ')[0]}`;
        } else if (displayText) {
          selector = `button:contains("${displayText}")`;
        } else {
          selector = `[type="${type || 'button'}"]`;
        }

        return {
          text: displayText.trim(),
          type: type || 'button',
          selector
        };
      });

      const buttonData = await Promise.all(buttonDataPromises);
      return { buttons: buttonData };
    } catch (error) {
      throw new Error(`Failed to get all buttons: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get a comprehensive AI-friendly summary of the current page structure.
   * Includes element counts, headings, and main content preview.
   * 
   * @returns Promise with page summary object
   * @throws Error if page analysis fails
   * 
   * @example
   * const summary = await client.getPageSummary();
   * console.log(`Page: ${summary.title}`);
   * console.log(`Links: ${summary.links}, Forms: ${summary.forms}`);
   */
  async getPageSummary(): Promise<{
    title: string;
    url: string;
    forms: number;
    links: number;
    buttons: number;
    inputs: number;
    images: number;
    headings: Array<{ level: string; text: string }>;
    mainContent: string;
  }> {
    this.ensureDriverExists();
    try {
      const title = await this.driver!.getTitle();
      const url = await this.driver!.getCurrentUrl();

      // Count elements
      const forms = await this.driver!.findElements(By.css('form'));
      const links = await this.driver!.findElements(By.css('a[href]'));
      const buttons = await this.driver!.findElements(By.css('button, input[type="button"], input[type="submit"]'));
      const inputs = await this.driver!.findElements(By.css('input, select, textarea'));
      const images = await this.driver!.findElements(By.css('img'));

      // Get headings
      const headingElements = await this.driver!.findElements(By.css('h1, h2, h3, h4, h5, h6'));
      const headings = [];
      for (const heading of headingElements.slice(0, 10)) { // Limit to 10 headings
        const tagName = await heading.getTagName();
        const text = await heading.getText();
        headings.push({
          level: tagName.toUpperCase(),
          text: text.trim()
        });
      }

      // Get main content (try to find main content area)
      let mainContent = '';
      try {
        const mainElement = await this.driver!.findElement(By.css('main, [role="main"], .main-content, #main-content'));
        mainContent = (await mainElement.getText()).substring(0, this.MAX_CONTENT_LENGTH);
      } catch {
        // Fallback to body content
        try {
          const bodyElement = await this.driver!.findElement(By.css('body'));
          mainContent = (await bodyElement.getText()).substring(0, this.MAX_CONTENT_LENGTH);
        } catch {
          mainContent = 'Could not extract main content';
        }
      }

      return {
        title,
        url,
        forms: forms.length,
        links: links.length,
        buttons: buttons.length,
        inputs: inputs.length,
        images: images.length,
        headings,
        mainContent
      };
    } catch (error) {
      throw new Error(`Failed to get page summary: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async validateSelectors(selectors: Array<{ by: string; value: string }>): Promise<{
    results: Array<{ selector: { by: string; value: string }; found: boolean; count: number; error?: string }>
  }> {
    this.ensureDriverExists();
    try {
      const results = [];

      for (const selector of selectors) {
        try {
          const locator = this.getByLocator(selector.by as LocatorStrategy, selector.value);
          const elements = await this.driver!.findElements(locator);

          results.push({
            selector,
            found: elements.length > 0,
            count: elements.length
          });
        } catch (error) {
          results.push({
            selector,
            found: false,
            count: 0,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      return { results };
    } catch (error) {
      throw new Error(`Failed to validate selectors: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private ensureDriverExists(): void {
    if (!this.driver) {
      throw new Error('Browser not started. Please call start_browser first.');
    }
  }
}