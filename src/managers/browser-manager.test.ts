import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BrowserManager } from './browser-manager.js';
import type { WebDriver } from 'selenium-webdriver';

describe('BrowserManager', () => {
  let manager: BrowserManager;
  let mockDriver: any; // Mock WebDriver for testing

  beforeEach(() => {
    manager = new BrowserManager();
    
    mockDriver = {
      quit: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      get: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      getCurrentUrl: jest.fn<() => Promise<string>>().mockResolvedValue('https://example.com'),
      getTitle: jest.fn<() => Promise<string>>().mockResolvedValue('Example Title'),
      getPageSource: jest.fn<() => Promise<string>>().mockResolvedValue('<html><body>Test</body></html>'),
      navigate: jest.fn().mockReturnValue({
        refresh: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        back: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        forward: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      }),
    };
  });

  describe('closeBrowser', () => {
    it('should close browser successfully when driver exists', async () => {
      manager.setDriver(mockDriver);
      const result = await manager.closeBrowser();

      expect(result).toEqual({
        success: true,
        message: 'Browser closed successfully'
      });
      expect(mockDriver.quit).toHaveBeenCalled();
      expect(manager.getDriver()).toBeNull();
    });

    it('should return success message when no driver exists', async () => {
      const result = await manager.closeBrowser();

      expect(result).toEqual({
        success: true,
        message: 'No browser session to close'
      });
    });

    it('should throw error if quit fails', async () => {
      mockDriver.quit.mockRejectedValue(new Error('Quit failed'));
      manager.setDriver(mockDriver);

      await expect(manager.closeBrowser()).rejects.toThrow('Failed to close browser: Quit failed');
    });
  });

  describe('navigate', () => {
    it('should navigate to valid URL', async () => {
      manager.setDriver(mockDriver);
      const result = await manager.navigate('https://example.com');

      expect(result).toEqual({
        success: true,
        message: 'Navigation successful',
        url: 'https://example.com'
      });
      expect(mockDriver.get).toHaveBeenCalledWith('https://example.com');
    });

    it('should throw error for invalid URL format', async () => {
      manager.setDriver(mockDriver);

      await expect(manager.navigate('not-a-valid-url')).rejects.toThrow('Invalid URL format');
    });

    it('should throw error when driver is not started', async () => {
      await expect(manager.navigate('https://example.com')).rejects.toThrow('Browser not started');
    });

    it('should throw error if navigation fails', async () => {
      mockDriver.get.mockRejectedValue(new Error('Network error'));
      manager.setDriver(mockDriver);

      await expect(manager.navigate('https://example.com')).rejects.toThrow('Failed to navigate');
    });
  });

  describe('getCurrentUrl', () => {
    it('should return current URL', async () => {
      manager.setDriver(mockDriver);
      const result = await manager.getCurrentUrl();

      expect(result).toEqual({ url: 'https://example.com' });
      expect(mockDriver.getCurrentUrl).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      await expect(manager.getCurrentUrl()).rejects.toThrow('Browser not started');
    });

    it('should throw error if getting URL fails', async () => {
      mockDriver.getCurrentUrl.mockRejectedValue(new Error('Failed to get URL'));
      manager.setDriver(mockDriver);

      await expect(manager.getCurrentUrl()).rejects.toThrow('Failed to get current URL');
    });
  });

  describe('getTitle', () => {
    it('should return page title', async () => {
      manager.setDriver(mockDriver);
      const result = await manager.getTitle();

      expect(result).toEqual({ title: 'Example Title' });
      expect(mockDriver.getTitle).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      await expect(manager.getTitle()).rejects.toThrow('Browser not started');
    });

    it('should throw error if getting title fails', async () => {
      mockDriver.getTitle.mockRejectedValue(new Error('Failed to get title'));
      manager.setDriver(mockDriver);

      await expect(manager.getTitle()).rejects.toThrow('Failed to get page title');
    });
  });

  describe('refresh', () => {
    it('should refresh page successfully', async () => {
      manager.setDriver(mockDriver);
      const result = await manager.refresh();

      expect(result).toEqual({
        success: true,
        message: 'Page refreshed successfully'
      });
      expect(mockDriver.navigate().refresh).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      await expect(manager.refresh()).rejects.toThrow('Browser not started');
    });

    it('should throw error if refresh fails', async () => {
      mockDriver.navigate().refresh.mockRejectedValue(new Error('Refresh failed'));
      manager.setDriver(mockDriver);

      await expect(manager.refresh()).rejects.toThrow('Failed to navigate to refresh');
    });
  });

  describe('goBack', () => {
    it('should navigate back successfully', async () => {
      manager.setDriver(mockDriver);
      const result = await manager.goBack();

      expect(result).toEqual({
        success: true,
        message: 'Navigated back successfully'
      });
      expect(mockDriver.navigate().back).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      await expect(manager.goBack()).rejects.toThrow('Browser not started');
    });
  });

  describe('goForward', () => {
    it('should navigate forward successfully', async () => {
      manager.setDriver(mockDriver);
      const result = await manager.goForward();

      expect(result).toEqual({
        success: true,
        message: 'Navigated forward successfully'
      });
      expect(mockDriver.navigate().forward).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      await expect(manager.goForward()).rejects.toThrow('Browser not started');
    });
  });

  describe('getPageSource', () => {
    it('should return page source', async () => {
      manager.setDriver(mockDriver);
      const result = await manager.getPageSource();

      expect(result).toEqual({ source: '<html><body>Test</body></html>' });
      expect(mockDriver.getPageSource).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      await expect(manager.getPageSource()).rejects.toThrow('Browser not started');
    });

    it('should throw error if getting source fails', async () => {
      mockDriver.getPageSource.mockRejectedValue(new Error('Failed to get source'));
      manager.setDriver(mockDriver);

      await expect(manager.getPageSource()).rejects.toThrow('Failed to get page source');
    });
  });

  describe('getDriver and setDriver', () => {
    it('should return null driver initially', () => {
      expect(manager.getDriver()).toBeNull();
    });

    it('should set and get driver', () => {
      manager.setDriver(mockDriver);
      expect(manager.getDriver()).toBe(mockDriver);
    });

    it('should set driver to null', () => {
      manager.setDriver(mockDriver);
      manager.setDriver(null);
      expect(manager.getDriver()).toBeNull();
    });
  });
});
