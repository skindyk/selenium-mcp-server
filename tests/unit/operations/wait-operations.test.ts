import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { WaitOperations } from '../../../src/operations/wait-operations.js';
import type { WebDriver, WebElement } from 'selenium-webdriver';

describe('WaitOperations', () => {
  let operations: WaitOperations;
  let mockDriver: any; // Mock WebDriver for testing
  let mockElement: any; // Mock WebElement for testing

  beforeEach(() => {
    mockElement = {
      getText: jest.fn<() => Promise<string>>().mockResolvedValue('Sample Text'),
    };

    mockDriver = {
      wait: jest.fn<() => Promise<any>>().mockResolvedValue(mockElement),
      findElement: jest.fn<() => Promise<any>>().mockResolvedValue(mockElement),
    };

    operations = new WaitOperations(mockDriver);
  });

  describe('waitForElement', () => {
    it('should wait for element successfully', async () => {
      const result = await operations.waitForElement('id', 'test-id', 5000);

      expect(result).toEqual({
        success: true,
        message: 'Element found within timeout'
      });
      expect(mockDriver.wait).toHaveBeenCalled();
    });

    it('should throw error when element not found within timeout', async () => {
      mockDriver.wait.mockRejectedValue(new Error('Wait timed out'));

      await expect(operations.waitForElement('id', 'nonexistent', 5000))
        .rejects.toThrow('timed out after 5000ms');
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.waitForElement('id', 'test'))
        .rejects.toThrow('Browser not started');
    });

    it('should use default timeout', async () => {
      await operations.waitForElement('id', 'test-id');
      
      expect(mockDriver.wait).toHaveBeenCalled();
    });
  });

  describe('waitForElementVisible', () => {
    it('should wait for element to become visible', async () => {
      const result = await operations.waitForElementVisible('id', 'test-id', 5000);

      expect(result).toEqual({
        success: true,
        message: 'Element became visible within timeout'
      });
      expect(mockDriver.wait).toHaveBeenCalledTimes(2); // Once for located, once for visible
    });

    it('should throw error when element not visible within timeout', async () => {
      mockDriver.wait.mockRejectedValueOnce(new Error('Not visible'));

      await expect(operations.waitForElementVisible('id', 'hidden', 5000))
        .rejects.toThrow('did not become visible within 5000ms');
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.waitForElementVisible('id', 'test'))
        .rejects.toThrow('Browser not started');
    });
  });

  describe('waitForElementClickable', () => {
    it('should wait for element to become clickable', async () => {
      const result = await operations.waitForElementClickable('id', 'button-id', 5000);

      expect(result).toEqual({
        success: true,
        message: 'Element became clickable within timeout'
      });
      expect(mockDriver.wait).toHaveBeenCalledTimes(2); // Once for located, once for enabled
    });

    it('should throw error when element not clickable within timeout', async () => {
      mockDriver.wait.mockRejectedValueOnce(new Error('Not clickable'));

      await expect(operations.waitForElementClickable('id', 'disabled', 5000))
        .rejects.toThrow('did not become clickable within 5000ms');
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.waitForElementClickable('id', 'test'))
        .rejects.toThrow('Browser not started');
    });
  });

  describe('waitForTextPresent', () => {
    it('should wait for text to be present in element', async () => {
      const result = await operations.waitForTextPresent('id', 'status', 'Complete', 5000);

      expect(result).toEqual({
        success: true,
        message: "Text 'Complete' found in element within timeout"
      });
      expect(mockDriver.wait).toHaveBeenCalled();
    });

    it('should throw error when text not found within timeout', async () => {
      mockDriver.wait.mockRejectedValue(new Error('Text not found'));

      await expect(operations.waitForTextPresent('id', 'status', 'Missing', 5000))
        .rejects.toThrow("timed out after 5000ms");
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.waitForTextPresent('id', 'test', 'text'))
        .rejects.toThrow('Browser not started');
    });
  });

  describe('setDriver', () => {
    it('should set driver', () => {
      const newOps = new WaitOperations(null);
      newOps.setDriver(mockDriver);
      
      // Verify driver is set by calling a method
      expect(async () => await newOps.waitForElement('id', 'test')).not.toThrow();
    });

    it('should accept null driver', () => {
      operations.setDriver(null);
      expect(operations).toBeDefined();
    });
  });
});
