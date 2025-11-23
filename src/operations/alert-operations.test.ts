import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AlertOperations } from './alert-operations.js';
import { WebDriver, Alert } from 'selenium-webdriver';
import { AlertError } from '../core/errors.js';

describe('AlertOperations', () => {
  let alertOps: AlertOperations;
  let mockDriver: any; // Mock WebDriver for testing
  let mockAlert: any; // Mock Alert for testing
  let mockAlertFn: any; // Mock alert() function for testing

  beforeEach(() => {
    // Create mock alert
    mockAlert = {
      accept: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      dismiss: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      getText: jest.fn<() => Promise<string>>().mockResolvedValue('Test alert text'),
      sendKeys: jest.fn<(...args: string[]) => Promise<void>>().mockResolvedValue(undefined),
    };

    // Create mock alert function that returns mockAlert (synchronously, not as promise)
    mockAlertFn = jest.fn<() => any>().mockReturnValue(mockAlert);

    // Create mock driver with switchTo().alert()
    mockDriver = {
      switchTo: jest.fn().mockReturnValue({
        alert: mockAlertFn,
      }),
    };

    alertOps = new AlertOperations(mockDriver);
  });

  describe('acceptAlert', () => {
    it('should accept an alert successfully', async () => {
      const result = await alertOps.acceptAlert();

      expect(mockDriver.switchTo).toHaveBeenCalled();
      expect(mockAlert.accept).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Alert accepted successfully' });
    });

    it('should throw AlertError when no alert is present', async () => {
      mockAlertFn.mockImplementation(() => {
        throw new Error('No alert present');
      });

      await expect(alertOps.acceptAlert()).rejects.toThrow(AlertError);
    });

    it('should throw AlertError when accept fails', async () => {
      mockAlert.accept.mockRejectedValueOnce(new Error('Accept failed'));

      await expect(alertOps.acceptAlert()).rejects.toThrow(AlertError);
    });

    it('should throw error when driver is not set', async () => {
      const opsWithoutDriver = new AlertOperations(null);
      await expect(opsWithoutDriver.acceptAlert()).rejects.toThrow('Browser not started. Please call start_browser first.');
    });
  });

  describe('dismissAlert', () => {
    it('should dismiss an alert successfully', async () => {
      const result = await alertOps.dismissAlert();

      expect(mockDriver.switchTo).toHaveBeenCalled();
      expect(mockAlert.dismiss).toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: 'Alert dismissed successfully' });
    });

    it('should throw AlertError when no alert is present', async () => {
      mockAlertFn.mockImplementation(() => {
        throw new Error('No alert present');
      });

      await expect(alertOps.dismissAlert()).rejects.toThrow(AlertError);
    });

    it('should throw AlertError when dismiss fails', async () => {
      mockAlert.dismiss.mockRejectedValueOnce(new Error('Dismiss failed'));

      await expect(alertOps.dismissAlert()).rejects.toThrow(AlertError);
    });

    it('should throw error when driver is not set', async () => {
      const opsWithoutDriver = new AlertOperations(null);
      await expect(opsWithoutDriver.dismissAlert()).rejects.toThrow('Browser not started. Please call start_browser first.');
    });
  });

  describe('getAlertText', () => {
    it('should get alert text successfully', async () => {
      const result = await alertOps.getAlertText();

      expect(mockDriver.switchTo).toHaveBeenCalled();
      expect(mockAlert.getText).toHaveBeenCalled();
      expect(result).toEqual({ text: 'Test alert text' });
    });

    it('should return empty string when alert has no text', async () => {
      mockAlert.getText.mockResolvedValue('');

      const result = await alertOps.getAlertText();

      expect(result).toEqual({ text: '' });
    });

    it('should throw AlertError when no alert is present', async () => {
      mockAlertFn.mockImplementation(() => {
        throw new Error('No alert present');
      });

      await expect(alertOps.getAlertText()).rejects.toThrow(AlertError);
    });

    it('should throw AlertError when getText fails', async () => {
      mockAlert.getText.mockRejectedValueOnce(new Error('getText failed'));

      await expect(alertOps.getAlertText()).rejects.toThrow(AlertError);
    });

    it('should throw error when driver is not set', async () => {
      const opsWithoutDriver = new AlertOperations(null);
      await expect(opsWithoutDriver.getAlertText()).rejects.toThrow('Browser not started. Please call start_browser first.');
    });
  });

  describe('sendAlertText', () => {
    it('should send text to prompt successfully', async () => {
      const result = await alertOps.sendAlertText('Test input');

      expect(mockDriver.switchTo).toHaveBeenCalled();
      expect(mockAlert.sendKeys).toHaveBeenCalledWith('Test input');
      expect(result).toEqual({ success: true, message: 'Text sent to alert successfully' });
    });

    it('should handle empty string input', async () => {
      const result = await alertOps.sendAlertText('');

      expect(mockAlert.sendKeys).toHaveBeenCalledWith('');
      expect(result).toEqual({ success: true, message: 'Text sent to alert successfully' });
    });

    it('should handle special characters in input', async () => {
      const specialText = 'Test\n\t@#$%^&*()';
      const result = await alertOps.sendAlertText(specialText);

      expect(mockAlert.sendKeys).toHaveBeenCalledWith(specialText);
      expect(result).toEqual({ success: true, message: 'Text sent to alert successfully' });
    });

    it('should throw AlertError when no alert is present', async () => {
      mockAlertFn.mockImplementation(() => {
        throw new Error('No alert present');
      });

      await expect(alertOps.sendAlertText('test')).rejects.toThrow(AlertError);
    });

    it('should throw AlertError when sendKeys fails', async () => {
      mockAlert.sendKeys.mockRejectedValueOnce(new Error('sendKeys failed'));

      await expect(alertOps.sendAlertText('test')).rejects.toThrow(AlertError);
    });

    it('should throw error when driver is not set', async () => {
      const opsWithoutDriver = new AlertOperations(null);
      await expect(opsWithoutDriver.sendAlertText('test')).rejects.toThrow('Browser not started. Please call start_browser first.');
    });
  });

  describe('setDriver', () => {
    it('should update driver reference', () => {
      const newDriver = {} as WebDriver;
      alertOps.setDriver(newDriver);
      // No direct way to test this, but we can verify it doesn't throw
      expect(() => alertOps.setDriver(newDriver)).not.toThrow();
    });

    it('should accept null driver', () => {
      alertOps.setDriver(null);
      expect(() => alertOps.setDriver(null)).not.toThrow();
    });
  });
});
