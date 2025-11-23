/**
 * Browser Manager - Handles browser lifecycle and navigation operations
 */

import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome.js';
import * as firefox from 'selenium-webdriver/firefox.js';
import * as edge from 'selenium-webdriver/edge.js';
import * as safari from 'selenium-webdriver/safari.js';

import {
  BrowserStartupError,
  BrowserOperationError,
  NavigationError,
  InvalidUrlError
} from '../core/errors.js';
import {
  BrowserOptions,
  BrowserStartResponse,
  SuccessResponse,
  NavigateResponse,
  UrlResponse,
  TitleResponse,
  PageSourceResponse
} from '../core/types.js';
import { ensureDriverExists } from '../core/locator-utils.js';

/**
 * Manages browser lifecycle, navigation, and window operations
 */
export class BrowserManager {
  private driver: WebDriver | null = null;

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
   * await browserManager.startBrowser('chrome', { headless: true });
   * await browserManager.startBrowser('firefox', { windowSize: { width: 1920, height: 1080 } });
   */
  async startBrowser(browser: string = 'chrome', options: BrowserOptions = {}): Promise<BrowserStartResponse> {
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
          // Warnings will be returned in the response, not logged to console
          builder = builder.forBrowser('safari').setSafariOptions(safariOptions);
          break;

        default:
          throw new BrowserStartupError(browser, new Error(`Unsupported browser: ${browser}`));
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
          if (browser.toLowerCase() !== 'safari') {
            throw error;
          }
          // For Safari, silently continue (limitation noted in warnings)
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Provide helpful error messages for common driver issues
      if (errorMessage.includes('driver') || errorMessage.includes('PATH')) {
        throw new BrowserStartupError(
          browser,
          new Error(
            `Driver not found or not executable.\n` +
            `Please ensure the appropriate WebDriver is installed:\n` +
            `- Chrome: chromedriver (usually auto-managed by selenium-webdriver)\n` +
            `- Firefox: geckodriver (download from https://github.com/mozilla/geckodriver/releases)\n` +
            `- Edge: msedgedriver (download from https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/)\n` +
            `- Safari: Built-in driver (enable via 'safaridriver --enable')\n` +
            `Original error: ${errorMessage}`
          )
        );
      }
      
      throw new BrowserStartupError(browser, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Close the current browser session.
   * 
   * @returns Promise with success status and message
   * @throws Error if closing the browser fails
   * 
   * @example
   * await browserManager.closeBrowser();
   */
  async closeBrowser(): Promise<SuccessResponse> {
    try {
      if (this.driver) {
        await this.driver.quit();
        this.driver = null;
        return { success: true, message: 'Browser closed successfully' };
      }
      return { success: true, message: 'No browser session to close' };
    } catch (error) {
      throw new BrowserOperationError('close browser', error instanceof Error ? error : undefined);
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
   * await browserManager.navigate('https://example.com');
   */
  async navigate(url: string): Promise<NavigateResponse> {
    ensureDriverExists(this.driver);
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new InvalidUrlError(url);
    }
    
    try {
      await this.driver!.get(url);
      const currentUrl = await this.driver!.getCurrentUrl();
      return { success: true, message: 'Navigation successful', url: currentUrl };
    } catch (error) {
      throw new NavigationError(url, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get the current page URL.
   * 
   * @returns Promise with the current URL
   * @throws Error if browser is not started or getting URL fails
   * 
   * @example
   * const { url } = await browserManager.getCurrentUrl();
   */
  async getCurrentUrl(): Promise<UrlResponse> {
    ensureDriverExists(this.driver);
    try {
      const url = await this.driver!.getCurrentUrl();
      return { url };
    } catch (error) {
      throw new BrowserOperationError('get current URL', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get the current page title.
   * 
   * @returns Promise with the page title
   * @throws Error if browser is not started or getting title fails
   * 
   * @example
   * const { title } = await browserManager.getTitle();
   */
  async getTitle(): Promise<TitleResponse> {
    ensureDriverExists(this.driver);
    try {
      const title = await this.driver!.getTitle();
      return { title };
    } catch (error) {
      throw new BrowserOperationError('get page title', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Refresh the current page.
   * 
   * @returns Promise with success status and message
   * @throws Error if browser is not started or refresh fails
   * 
   * @example
   * await browserManager.refresh();
   */
  async refresh(): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      await this.driver!.navigate().refresh();
      return { success: true, message: 'Page refreshed successfully' };
    } catch (error) {
      throw new NavigationError('refresh', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Navigate back in browser history.
   * 
   * @returns Promise with success status and message
   * @throws Error if browser is not started or navigation fails
   * 
   * @example
   * await browserManager.goBack();
   */
  async goBack(): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      await this.driver!.navigate().back();
      return { success: true, message: 'Navigated back successfully' };
    } catch (error) {
      throw new NavigationError('back', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Navigate forward in browser history.
   * 
   * @returns Promise with success status and message
   * @throws Error if browser is not started or navigation fails
   * 
   * @example
   * await browserManager.goForward();
   */
  async goForward(): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    try {
      await this.driver!.navigate().forward();
      return { success: true, message: 'Navigated forward successfully' };
    } catch (error) {
      throw new NavigationError('forward', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get the complete HTML source code of the current page.
   * 
   * @returns Promise with the page source
   * @throws Error if browser is not started or getting source fails
   * 
   * @example
   * const { source } = await browserManager.getPageSource();
   */
  async getPageSource(): Promise<PageSourceResponse> {
    ensureDriverExists(this.driver);
    try {
      const source = await this.driver!.getPageSource();
      return { source };
    } catch (error) {
      throw new BrowserOperationError('get page source', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get the WebDriver instance.
   * 
   * @returns The WebDriver instance or null if not started
   * 
   * @example
   * const driver = browserManager.getDriver();
   */
  getDriver(): WebDriver | null {
    return this.driver;
  }

  /**
   * Set the WebDriver instance (useful for testing or advanced scenarios).
   * 
   * @param driver - The WebDriver instance to set
   * 
   * @example
   * browserManager.setDriver(customDriver);
   */
  setDriver(driver: WebDriver | null): void {
    this.driver = driver;
  }
}
