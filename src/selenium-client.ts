import { Builder, WebDriver, By, until, WebElement, Key, Actions } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';
import * as firefox from 'selenium-webdriver/firefox.js';
import * as edge from 'selenium-webdriver/edge.js';

export interface BrowserOptions {
  headless?: boolean;
  arguments?: string[];
  windowSize?: { width: number; height: number };
}

export type LocatorStrategy = 'id' | 'css' | 'xpath' | 'name' | 'tag' | 'class' | 'linkText' | 'partialLinkText';

export class SeleniumClient {
  private driver: WebDriver | null = null;

  async startBrowser(browser: string = 'chrome', options: BrowserOptions = {}): Promise<{ success: boolean; message: string }> {
    try {
      if (this.driver) {
        await this.driver.quit();
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
          if (options.windowSize) {
            chromeOptions.addArguments(`--window-size=${options.windowSize.width},${options.windowSize.height}`);
          }
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

        default:
          throw new Error(`Unsupported browser: ${browser}`);
      }

      this.driver = await builder.build();

      if (options.windowSize && !options.headless) {
        await this.driver.manage().window().setRect({
          width: options.windowSize.width,
          height: options.windowSize.height,
          x: 0,
          y: 0
        });
      }

      return { success: true, message: `${browser} browser started successfully` };
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

  async navigate(url: string): Promise<{ success: boolean; message: string; url: string }> {
    this.ensureDriverExists();
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
        // Use CSS selector for tag names since By.tagName is deprecated
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

  async clickElement(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      await element.click();
      return { success: true, message: 'Element clicked successfully' };
    } catch (error) {
      throw new Error(`Failed to click element: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async sendKeys(by: LocatorStrategy, value: string, text: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      await this.driver!.wait(until.elementIsEnabled(element), timeout);
      await element.sendKeys(text);
      return { success: true, message: 'Text sent successfully' };
    } catch (error) {
      throw new Error(`Failed to send keys: ${error instanceof Error ? error.message : String(error)}`);
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
      throw new Error(`Failed to get element text: ${error instanceof Error ? error.message : String(error)}`);
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

  async takeScreenshot(outputPath?: string): Promise<{ success: boolean; message: string; path?: string }> {
    this.ensureDriverExists();
    try {
      const screenshot = await this.driver!.takeScreenshot();
      
      if (outputPath) {
        const fs = await import('fs');
        fs.writeFileSync(outputPath, screenshot, 'base64');
        return { success: true, message: 'Screenshot saved successfully', path: outputPath };
      } else {
        return { success: true, message: 'Screenshot taken successfully (base64 data available)' };
      }
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async executeScript(script: string, args: any[] = []): Promise<{ result: any }> {
    this.ensureDriverExists();
    try {
      const result = await this.driver!.executeScript(script, ...args);
      return { result };
    } catch (error) {
      throw new Error(`Failed to execute script: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

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
      throw new Error(`Failed to hover over element: ${error instanceof Error ? error.message : String(error)}`);
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
    try {
      const locator = this.getByLocator(by, value);
      const element = await this.driver!.wait(until.elementLocated(locator), timeout);
      
      // Check if file exists
      const fs = await import('fs');
      const path = await import('path');
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      // Convert to absolute path if needed
      const absolutePath = path.resolve(filePath);
      
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
      throw new Error(`Failed to scroll to element: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Wait Conditions
  async waitForElementVisible(by: LocatorStrategy, value: string, timeout: number = 10000): Promise<{ success: boolean; message: string }> {
    this.ensureDriverExists();
    try {
      const locator = this.getByLocator(by, value);
      await this.driver!.wait(until.elementIsVisible(this.driver!.findElement(locator)), timeout);
      return { success: true, message: 'Element became visible within timeout' };
    } catch (error) {
      throw new Error(`Element did not become visible within timeout: ${error instanceof Error ? error.message : String(error)}`);
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
  async getAllLinks(): Promise<{ links: Array<{ text: string; href: string; selector: string }> }> {
    this.ensureDriverExists();
    try {
      const links = await this.driver!.findElements(By.css('a[href]'));
      const linkData = [];
      
      for (let i = 0; i < Math.min(links.length, 50); i++) { // Limit to 50 links
        const link = links[i];
        const text = await link.getText();
        const href = await link.getAttribute('href');
        const id = await link.getAttribute('id');
        const className = await link.getAttribute('class');
        
        // Generate best selector
        let selector = '';
        if (id) {
          selector = `#${id}`;
        } else if (className) {
          selector = `.${className.split(' ')[0]}`;
        } else {
          selector = `a[href="${href}"]`;
        }
        
        linkData.push({
          text: text.trim(),
          href,
          selector
        });
      }
      
      return { links: linkData };
    } catch (error) {
      throw new Error(`Failed to get all links: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAllForms(): Promise<{ forms: Array<{ action: string; method: string; fields: Array<{ name: string; type: string; label: string; selector: string }> }> }> {
    this.ensureDriverExists();
    try {
      const forms = await this.driver!.findElements(By.css('form'));
      const formData = [];
      
      for (const form of forms) {
        const action = await form.getAttribute('action') || '';
        const method = await form.getAttribute('method') || 'GET';
        
        // Get all form fields
        const inputs = await form.findElements(By.css('input, select, textarea'));
        const fields = [];
        
        for (const input of inputs) {
          const name = await input.getAttribute('name') || '';
          const type = await input.getAttribute('type') || 'text';
          const id = await input.getAttribute('id') || '';
          const placeholder = await input.getAttribute('placeholder') || '';
          
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
            selector = `[type="${type}"]`;
          }
          
          fields.push({
            name,
            type,
            label: label || placeholder,
            selector
          });
        }
        
        formData.push({
          action,
          method,
          fields
        });
      }
      
      return { forms: formData };
    } catch (error) {
      throw new Error(`Failed to get all forms: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getAllButtons(): Promise<{ buttons: Array<{ text: string; type: string; selector: string }> }> {
    this.ensureDriverExists();
    try {
      const buttons = await this.driver!.findElements(By.css('button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]'));
      const buttonData = [];
      
      for (const button of buttons) {
        const text = await button.getText() || await button.getAttribute('value') || '';
        const type = await button.getAttribute('type') || 'button';
        const id = await button.getAttribute('id');
        const className = await button.getAttribute('class');
        
        // Generate best selector
        let selector = '';
        if (id) {
          selector = `#${id}`;
        } else if (className) {
          selector = `.${className.split(' ')[0]}`;
        } else if (text) {
          selector = `button:contains("${text}")`;
        } else {
          selector = `[type="${type}"]`;
        }
        
        buttonData.push({
          text: text.trim(),
          type,
          selector
        });
      }
      
      return { buttons: buttonData };
    } catch (error) {
      throw new Error(`Failed to get all buttons: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

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
        mainContent = (await mainElement.getText()).substring(0, 500); // First 500 chars
      } catch {
        // Fallback to body content
        try {
          const bodyElement = await this.driver!.findElement(By.css('body'));
          mainContent = (await bodyElement.getText()).substring(0, 500);
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