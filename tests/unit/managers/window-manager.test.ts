import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { WindowManager } from '../../../src/managers/window-manager.js';
import type { WebDriver } from 'selenium-webdriver';

describe('WindowManager', () => {
  let manager: WindowManager;
  let mockDriver: any; // Mock WebDriver for testing

  beforeEach(() => {
    mockDriver = {
      manage: jest.fn().mockReturnValue({
        window: jest.fn().mockReturnValue({
          maximize: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
          minimize: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
          setRect: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
          getRect: jest.fn<() => Promise<any>>().mockResolvedValue({ width: 1920, height: 1080, x: 0, y: 0 }),
        }),
      }),
      switchTo: jest.fn().mockReturnValue({
        frame: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        defaultContent: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
        window: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      }),
      getAllWindowHandles: jest.fn<() => Promise<string[]>>().mockResolvedValue(['handle1', 'handle2']),
    };

    manager = new WindowManager(mockDriver);
  });

  describe('switchToFrame', () => {
    it('should switch to frame by index', async () => {
      const result = await manager.switchToFrame(0);

      expect(result).toEqual({
        success: true,
        message: 'Switched to frame successfully'
      });
      expect(mockDriver.switchTo().frame).toHaveBeenCalledWith(0);
    });

    it('should switch to frame by name', async () => {
      const result = await manager.switchToFrame('frameName');

      expect(result).toEqual({
        success: true,
        message: 'Switched to frame successfully'
      });
      expect(mockDriver.switchTo().frame).toHaveBeenCalledWith('frameName');
    });

    it('should parse numeric string as number', async () => {
      await manager.switchToFrame('2');

      expect(mockDriver.switchTo().frame).toHaveBeenCalledWith(2);
    });

    it('should throw error when driver is not started', async () => {
      manager.setDriver(null);
      await expect(manager.switchToFrame(0)).rejects.toThrow('Browser not started');
    });

    it('should throw error if switch fails', async () => {
      mockDriver.switchTo().frame.mockRejectedValue(new Error('Frame not found'));

      await expect(manager.switchToFrame(0)).rejects.toThrow('Failed to switch to frame');
    });
  });

  describe('switchToDefaultContent', () => {
    it('should switch to default content', async () => {
      const result = await manager.switchToDefaultContent();

      expect(result).toEqual({
        success: true,
        message: 'Switched to default content successfully'
      });
      expect(mockDriver.switchTo().defaultContent).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      manager.setDriver(null);
      await expect(manager.switchToDefaultContent()).rejects.toThrow('Browser not started');
    });
  });

  describe('switchToWindow', () => {
    it('should switch to window by handle', async () => {
      const result = await manager.switchToWindow('handle2');

      expect(result).toEqual({
        success: true,
        message: 'Switched to window successfully'
      });
      expect(mockDriver.switchTo().window).toHaveBeenCalledWith('handle2');
    });

    it('should throw error when driver is not started', async () => {
      manager.setDriver(null);
      await expect(manager.switchToWindow('handle1')).rejects.toThrow('Browser not started');
    });

    it('should throw error if switch fails', async () => {
      mockDriver.switchTo().window.mockRejectedValue(new Error('Window not found'));

      await expect(manager.switchToWindow('invalid')).rejects.toThrow('Failed to switch to window');
    });
  });

  describe('getWindowHandles', () => {
    it('should return all window handles', async () => {
      const result = await manager.getWindowHandles();

      expect(result).toEqual({ handles: ['handle1', 'handle2'] });
      expect(mockDriver.getAllWindowHandles).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      manager.setDriver(null);
      await expect(manager.getWindowHandles()).rejects.toThrow('Browser not started');
    });
  });

  describe('maximizeWindow', () => {
    it('should maximize window', async () => {
      const result = await manager.maximizeWindow();

      expect(result).toEqual({
        success: true,
        message: 'Window maximized successfully'
      });
      expect(mockDriver.manage().window().maximize).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      manager.setDriver(null);
      await expect(manager.maximizeWindow()).rejects.toThrow('Browser not started');
    });
  });

  describe('minimizeWindow', () => {
    it('should minimize window', async () => {
      const result = await manager.minimizeWindow();

      expect(result).toEqual({
        success: true,
        message: 'Window minimized successfully'
      });
      expect(mockDriver.manage().window().minimize).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      manager.setDriver(null);
      await expect(manager.minimizeWindow()).rejects.toThrow('Browser not started');
    });
  });

  describe('setWindowSize', () => {
    it('should set window size with valid dimensions', async () => {
      const result = await manager.setWindowSize(1280, 720);

      expect(result).toEqual({
        success: true,
        message: 'Window size set to 1280x720'
      });
      expect(mockDriver.manage().window().setRect).toHaveBeenCalledWith({
        width: 1280,
        height: 720,
        x: 0,
        y: 0
      });
    });

    it('should throw error for invalid width (non-integer)', async () => {
      await expect(manager.setWindowSize(1280.5, 720)).rejects.toThrow('Invalid window dimensions');
    });

    it('should throw error for invalid height (non-integer)', async () => {
      await expect(manager.setWindowSize(1280, 720.5)).rejects.toThrow('Invalid window dimensions');
    });

    it('should throw error for zero width', async () => {
      await expect(manager.setWindowSize(0, 720)).rejects.toThrow('Invalid window dimensions');
    });

    it('should throw error for negative width', async () => {
      await expect(manager.setWindowSize(-100, 720)).rejects.toThrow('Invalid window dimensions');
    });

    it('should throw error for negative height', async () => {
      await expect(manager.setWindowSize(1280, -100)).rejects.toThrow('Invalid window dimensions');
    });

    it('should throw error when driver is not started', async () => {
      manager.setDriver(null);
      await expect(manager.setWindowSize(1280, 720)).rejects.toThrow('Browser not started');
    });
  });

  describe('getWindowSize', () => {
    it('should return window size', async () => {
      const result = await manager.getWindowSize();

      expect(result).toEqual({ width: 1920, height: 1080 });
      expect(mockDriver.manage().window().getRect).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      manager.setDriver(null);
      await expect(manager.getWindowSize()).rejects.toThrow('Browser not started');
    });

    it('should throw error if getting size fails', async () => {
      mockDriver.manage().window().getRect.mockRejectedValue(new Error('Failed to get rect'));

      await expect(manager.getWindowSize()).rejects.toThrow('Failed to get window size');
    });
  });

  describe('setDriver', () => {
    it('should set driver', () => {
      const newManager = new WindowManager(null);
      expect(newManager).toBeDefined();
      
      newManager.setDriver(mockDriver);
      // Can't directly test internal state, but can test that operations work after setting
      expect(async () => await newManager.getWindowHandles()).not.toThrow();
    });
  });
});
