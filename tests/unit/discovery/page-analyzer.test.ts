import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { PageAnalyzer } from '../../../src/discovery/page-analyzer.js';
import type { WebDriver, WebElement } from 'selenium-webdriver';

describe('PageAnalyzer', () => {
  let analyzer: PageAnalyzer;
  let mockDriver: any; // Mock WebDriver for testing
  let mockElements: any[]; // Mock WebElement array for testing

  beforeEach(() => {
    mockElements = [
      {
        getText: jest.fn<() => Promise<string>>().mockResolvedValue('Link 1'),
        getAttribute: jest.fn<(name: string) => Promise<string | null>>()
          .mockImplementation((attr) => {
            if (attr === 'href') return Promise.resolve('https://example.com/1');
            if (attr === 'id') return Promise.resolve('link-1');
            return Promise.resolve(null);
          }),
        getTagName: jest.fn<() => Promise<string>>().mockResolvedValue('a'),
      },
      {
        getText: jest.fn<() => Promise<string>>().mockResolvedValue('Link 2'),
        getAttribute: jest.fn<(name: string) => Promise<string | null>>()
          .mockImplementation((attr) => {
            if (attr === 'href') return Promise.resolve('https://example.com/2');
            if (attr === 'class') return Promise.resolve('nav-link active');
            return Promise.resolve(null);
          }),
        getTagName: jest.fn<() => Promise<string>>().mockResolvedValue('a'),
      },
    ];

    mockDriver = {
      findElements: jest.fn<() => Promise<any[]>>().mockResolvedValue(mockElements),
      findElement: jest.fn<() => Promise<any>>().mockResolvedValue(mockElements[0]),
      getTitle: jest.fn<() => Promise<string>>().mockResolvedValue('Test Page'),
      getCurrentUrl: jest.fn<() => Promise<string>>().mockResolvedValue('https://example.com'),
    };

    analyzer = new PageAnalyzer(mockDriver);
  });

  describe('getAllLinks', () => {
    it('should extract all links with text, href, and selectors', async () => {
      const result = await analyzer.getAllLinks();

      expect(result.links).toHaveLength(2);
      expect(result.links[0]).toEqual({
        text: 'Link 1',
        href: 'https://example.com/1',
        selector: '#link-1'
      });
      expect(result.links[1]).toEqual({
        text: 'Link 2',
        href: 'https://example.com/2',
        selector: '.nav-link'
      });
    });

    it('should limit links to MAX_LINKS_TO_EXTRACT', async () => {
      const manyElements = Array(60).fill(mockElements[0]);
      mockDriver.findElements.mockResolvedValue(manyElements);

      const result = await analyzer.getAllLinks();

      expect(result.links.length).toBeLessThanOrEqual(50);
    });

    it('should throw error when driver is not started', async () => {
      analyzer.setDriver(null);
      await expect(analyzer.getAllLinks()).rejects.toThrow('Browser not started');
    });

    it('should handle extraction errors', async () => {
      mockDriver.findElements.mockRejectedValue(new Error('Find failed'));

      await expect(analyzer.getAllLinks()).rejects.toThrow('Failed to get all links');
    });
  });

  describe('getAllForms', () => {
    it('should extract all forms with fields', async () => {
      const mockForm = {
        getAttribute: jest.fn<(name: string) => Promise<string | null>>()
          .mockImplementation((attr) => {
            if (attr === 'action') return Promise.resolve('/submit');
            if (attr === 'method') return Promise.resolve('POST');
            return Promise.resolve(null);
          }),
        findElements: jest.fn<() => Promise<any[]>>().mockResolvedValue([
          {
            getAttribute: jest.fn<(name: string) => Promise<string | null>>()
              .mockImplementation((attr) => {
                if (attr === 'name') return Promise.resolve('email');
                if (attr === 'type') return Promise.resolve('email');
                if (attr === 'id') return Promise.resolve('email-input');
                return Promise.resolve(null);
              }),
          },
        ]),
      };

      mockDriver.findElements.mockResolvedValue([mockForm]);
      mockDriver.findElement.mockResolvedValue({
        getText: jest.fn<() => Promise<string>>().mockResolvedValue('Email Address'),
      });

      const result = await analyzer.getAllForms();

      expect(result.forms).toHaveLength(1);
      expect(result.forms[0]).toEqual({
        action: '/submit',
        method: 'POST',
        fields: [
          {
            name: 'email',
            type: 'email',
            label: 'Email Address',
            selector: '#email-input'
          }
        ]
      });
    });

    it('should handle forms without action/method', async () => {
      const mockForm = {
        getAttribute: jest.fn<(name: string) => Promise<string | null>>().mockResolvedValue(null),
        findElements: jest.fn<() => Promise<any[]>>().mockResolvedValue([]),
      };

      mockDriver.findElements.mockResolvedValue([mockForm]);

      const result = await analyzer.getAllForms();

      expect(result.forms[0]).toEqual({
        action: '',
        method: 'GET',
        fields: []
      });
    });

    it('should throw error when driver is not started', async () => {
      analyzer.setDriver(null);
      await expect(analyzer.getAllForms()).rejects.toThrow('Browser not started');
    });
  });

  describe('getAllButtons', () => {
    it('should extract all buttons', async () => {
      const mockButtons = [
        {
          getText: jest.fn<() => Promise<string>>().mockResolvedValue('Submit'),
          getAttribute: jest.fn<(name: string) => Promise<string | null>>()
            .mockImplementation((attr) => {
              if (attr === 'type') return Promise.resolve('submit');
              if (attr === 'id') return Promise.resolve('submit-btn');
              return Promise.resolve(null);
            }),
        },
      ];

      mockDriver.findElements.mockResolvedValue(mockButtons);

      const result = await analyzer.getAllButtons();

      expect(result.buttons).toHaveLength(1);
      expect(result.buttons[0]).toEqual({
        text: 'Submit',
        type: 'submit',
        selector: '#submit-btn'
      });
    });

    it('should throw error when driver is not started', async () => {
      analyzer.setDriver(null);
      await expect(analyzer.getAllButtons()).rejects.toThrow('Browser not started');
    });
  });

  describe('getPageSummary', () => {
    it('should return comprehensive page summary', async () => {
      const mockHeading = {
        getTagName: jest.fn<() => Promise<string>>().mockResolvedValue('h1'),
        getText: jest.fn<() => Promise<string>>().mockResolvedValue('Main Heading'),
      };

      const mockMain = {
        getText: jest.fn<() => Promise<string>>().mockResolvedValue('Main content text'),
      };

      mockDriver.findElements
        .mockResolvedValueOnce([]) // forms
        .mockResolvedValueOnce(mockElements) // links
        .mockResolvedValueOnce([]) // buttons
        .mockResolvedValueOnce([]) // inputs
        .mockResolvedValueOnce([]) // images
        .mockResolvedValueOnce([mockHeading]); // headings

      mockDriver.findElement.mockResolvedValue(mockMain);

      const result = await analyzer.getPageSummary();

      expect(result).toEqual({
        title: 'Test Page',
        url: 'https://example.com',
        forms: 0,
        links: 2,
        buttons: 0,
        inputs: 0,
        images: 0,
        headings: [{ level: 'H1', text: 'Main Heading' }],
        mainContent: 'Main content text'
      });
    });

    it('should handle missing main content', async () => {
      mockDriver.findElements.mockResolvedValue([]);
      mockDriver.findElement.mockRejectedValue(new Error('Main not found'));

      const result = await analyzer.getPageSummary();

      expect(result.mainContent).toBe('Could not extract main content');
    });

    it('should throw error when driver is not started', async () => {
      analyzer.setDriver(null);
      await expect(analyzer.getPageSummary()).rejects.toThrow('Browser not started');
    });
  });

  describe('validateSelectors', () => {
    it('should validate selectors and return results', async () => {
      mockDriver.findElements
        .mockResolvedValueOnce([mockElements[0]]) // First selector finds 1
        .mockResolvedValueOnce(mockElements) // Second selector finds 2
        .mockRejectedValueOnce(new Error('Invalid selector')); // Third selector fails

      const result = await analyzer.validateSelectors([
        { by: 'id', value: 'test-id' },
        { by: 'css', value: '.test-class' },
        { by: 'xpath', value: '//invalid' },
      ]);

      expect(result.results).toHaveLength(3);
      expect(result.results[0]).toEqual({
        selector: { by: 'id', value: 'test-id' },
        found: true,
        count: 1
      });
      expect(result.results[1]).toEqual({
        selector: { by: 'css', value: '.test-class' },
        found: true,
        count: 2
      });
      expect(result.results[2]).toEqual({
        selector: { by: 'xpath', value: '//invalid' },
        found: false,
        count: 0,
        error: 'Invalid selector'
      });
    });

    it('should handle empty elements', async () => {
      mockDriver.findElements.mockResolvedValue([]);

      const result = await analyzer.validateSelectors([
        { by: 'id', value: 'nonexistent' }
      ]);

      expect(result.results[0]).toEqual({
        selector: { by: 'id', value: 'nonexistent' },
        found: false,
        count: 0
      });
    });

    it('should throw error when driver is not started', async () => {
      analyzer.setDriver(null);
      await expect(analyzer.validateSelectors([])).rejects.toThrow('Browser not started');
    });
  });

  describe('setDriver', () => {
    it('should set driver', () => {
      const newAnalyzer = new PageAnalyzer(null);
      newAnalyzer.setDriver(mockDriver);
      
      expect(async () => await newAnalyzer.getAllLinks()).not.toThrow();
    });
  });
});
