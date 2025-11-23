/**
 * PageAnalyzer - AI-optimized methods for analyzing and discovering page elements
 * 
 * This class provides methods to extract structured information from web pages
 * for AI analysis and test generation purposes.
 */

import { WebDriver, By } from 'selenium-webdriver';
import { 
  LinkInfo, 
  FormInfo, 
  ButtonInfo, 
  PageSummary, 
  SelectorValidationInput, 
  SelectorValidationResult, 
  SelectorValidationResponse,
  LocatorStrategy,
  MAX_LINKS_TO_EXTRACT,
  MAX_CONTENT_LENGTH
} from '../core/types.js';
import { getByLocator, ensureDriverExists } from '../core/locator-utils.js';

export class PageAnalyzer {

  constructor(private driver: WebDriver | null) {}

  /**
   * Set the WebDriver instance
   * 
   * @param driver - WebDriver instance or null
   */
  setDriver(driver: WebDriver | null): void {
    this.driver = driver;
  }

  /**
   * Extract all links from the current page with their text, href, and best selector.
   * Limited to first 50 links for performance.
   * 
   * @returns Promise with array of link objects containing text, href, and selector
   * @throws Error if extraction fails
   * 
   * @example
   * const { links } = await analyzer.getAllLinks();
   * links.forEach(link => console.log(`${link.text}: ${link.href}`));
   */
  async getAllLinks(): Promise<{ links: LinkInfo[] }> {
    ensureDriverExists(this.driver);
    try {
      const links = await this.driver!.findElements(By.css('a[href]'));
      const linksToProcess = links.slice(0, MAX_LINKS_TO_EXTRACT);

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

  /**
   * Extract all forms from the current page with their fields and metadata.
   * 
   * @returns Promise with array of form objects containing action, method, and fields
   * @throws Error if extraction fails
   * 
   * @example
   * const { forms } = await analyzer.getAllForms();
   * forms.forEach(form => {
   *   console.log(`Form: ${form.action} (${form.method})`);
   *   form.fields.forEach(field => console.log(`  - ${field.label}: ${field.type}`));
   * });
   */
  async getAllForms(): Promise<{ forms: FormInfo[] }> {
    ensureDriverExists(this.driver);
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

  /**
   * Extract all buttons from the current page with their text, type, and selector.
   * 
   * @returns Promise with array of button objects
   * @throws Error if extraction fails
   * 
   * @example
   * const { buttons } = await analyzer.getAllButtons();
   * buttons.forEach(button => console.log(`${button.text}: ${button.selector}`));
   */
  async getAllButtons(): Promise<{ buttons: ButtonInfo[] }> {
    ensureDriverExists(this.driver);
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
   * const summary = await analyzer.getPageSummary();
   * console.log(`Page: ${summary.title}`);
   * console.log(`Links: ${summary.links}, Forms: ${summary.forms}`);
   */
  async getPageSummary(): Promise<PageSummary> {
    ensureDriverExists(this.driver);
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
        mainContent = (await mainElement.getText()).substring(0, MAX_CONTENT_LENGTH);
      } catch {
        // Fallback to body content
        try {
          const bodyElement = await this.driver!.findElement(By.css('body'));
          mainContent = (await bodyElement.getText()).substring(0, MAX_CONTENT_LENGTH);
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

  /**
   * Validate multiple selectors to check which ones successfully locate elements.
   * Useful for testing selector reliability before using them in tests.
   * 
   * @param selectors - Array of selector objects with 'by' and 'value' properties
   * @returns Promise with validation results for each selector
   * @throws Error if validation process fails
   * 
   * @example
   * const response = await analyzer.validateSelectors([
   *   { by: 'id', value: 'submit-button' },
   *   { by: 'css', value: '.login-form input[type="email"]' },
   *   { by: 'xpath', value: '//button[@class="submit"]' }
   * ]);
   * response.results.forEach(result => {
   *   console.log(`${result.selector.by}="${result.selector.value}": ${result.found ? `Found ${result.count}` : 'Not found'}`);
   * });
   */
  async validateSelectors(selectors: SelectorValidationInput[]): Promise<SelectorValidationResponse> {
    ensureDriverExists(this.driver);
    try {
      const results: SelectorValidationResult[] = [];

      for (const selector of selectors) {
        try {
          const locator = getByLocator(selector.by as LocatorStrategy, selector.value);
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
}
