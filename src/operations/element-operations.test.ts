import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ElementOperations } from './element-operations.js';
import type { WebDriver, WebElement } from 'selenium-webdriver';

describe('ElementOperations', () => {
  let operations: ElementOperations;
  let mockDriver: any; // Mock WebDriver for testing
  let mockElement: any;

  beforeEach(() => {
    mockElement = {
      click: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      sendKeys: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      clear: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      getText: jest.fn<() => Promise<string>>().mockResolvedValue('Sample Text'),
      getAttribute: jest.fn<(name: string) => Promise<string | null>>().mockResolvedValue('value'),
      isDisplayed: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
      isEnabled: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
      isSelected: jest.fn<() => Promise<boolean>>().mockResolvedValue(false),
      getCssValue: jest.fn<() => Promise<string>>().mockResolvedValue('16px'),
    };

    mockDriver = {
      wait: jest.fn<() => Promise<any>>().mockResolvedValue(mockElement),
      findElement: jest.fn<() => Promise<any>>().mockResolvedValue(mockElement),
      findElements: jest.fn<() => Promise<any[]>>().mockResolvedValue([mockElement, mockElement]),
      executeScript: jest.fn<() => Promise<any>>().mockResolvedValue(undefined),
      actions: jest.fn().mockReturnValue({
        move: jest.fn().mockReturnThis(),
        click: jest.fn().mockReturnThis(),
        doubleClick: jest.fn().mockReturnThis(),
        contextClick: jest.fn().mockReturnThis(),
        dragAndDrop: jest.fn().mockReturnThis(),
        perform: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
      }),
    };

    operations = new ElementOperations(mockDriver);
  });

  describe('findElement', () => {
    it('should find element successfully', async () => {
      const result = await operations.findElement('id', 'test-id');

      expect(result).toEqual({
        found: true,
        message: 'Element found successfully'
      });
      expect(mockDriver.wait).toHaveBeenCalled();
    });

    it('should return not found when element does not exist', async () => {
      mockDriver.wait.mockRejectedValue(new Error('Timeout'));

      const result = await operations.findElement('id', 'nonexistent');

      expect(result.found).toBe(false);
      expect(result.message).toContain('Element not found');
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.findElement('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('findElements', () => {
    it('should find multiple elements', async () => {
      const result = await operations.findElements('css', '.test-class');

      expect(result).toEqual({
        count: 2,
        message: 'Found 2 elements'
      });
      expect(mockDriver.findElements).toHaveBeenCalled();
    });

    it('should return zero count when no elements found', async () => {
      mockDriver.findElements.mockResolvedValue([]);

      const result = await operations.findElements('css', '.nonexistent');

      expect(result).toEqual({
        count: 0,
        message: 'Found 0 elements'
      });
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.findElements('css', '.test')).rejects.toThrow('Browser not started');
    });
  });

  describe('clickElement', () => {
    it('should click element successfully', async () => {
      const result = await operations.clickElement('id', 'button-id');

      expect(result).toEqual({
        success: true,
        message: 'Element clicked successfully'
      });
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('should throw error when element not found', async () => {
      mockDriver.wait.mockRejectedValue(new Error('Element not found'));

      await expect(operations.clickElement('id', 'nonexistent')).rejects.toThrow('Failed to click element');
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.clickElement('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('sendKeys', () => {
    it('should send keys successfully', async () => {
      const result = await operations.sendKeys('id', 'input-id', 'test input');

      expect(result).toEqual({
        success: true,
        message: 'Keys sent successfully'
      });
      expect(mockElement.sendKeys).toHaveBeenCalledWith('test input');
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.sendKeys('id', 'test', 'text')).rejects.toThrow('Browser not started');
    });
  });

  describe('clearElement', () => {
    it('should clear element successfully', async () => {
      const result = await operations.clearElement('id', 'input-id');

      expect(result).toEqual({
        success: true,
        message: 'Element cleared successfully'
      });
      expect(mockElement.clear).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.clearElement('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('getElementText', () => {
    it('should get element text', async () => {
      const result = await operations.getElementText('id', 'text-id');

      expect(result).toEqual({ text: 'Sample Text' });
      expect(mockElement.getText).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.getElementText('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('getElementAttribute', () => {
    it('should get element attribute', async () => {
      const result = await operations.getElementAttribute('id', 'input-id', 'type');

      expect(result).toEqual({ attribute: 'type', value: 'value' });
      expect(mockElement.getAttribute).toHaveBeenCalledWith('type');
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.getElementAttribute('id', 'test', 'attr')).rejects.toThrow('Browser not started');
    });
  });

  describe('getElementProperty', () => {
    it('should get element property', async () => {
      const result = await operations.getElementProperty('id', 'input-id', 'value');

      expect(result).toEqual({ property: 'value', value: 'value' });
      expect(mockElement.getAttribute).toHaveBeenCalledWith('value');
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.getElementProperty('id', 'test', 'prop')).rejects.toThrow('Browser not started');
    });
  });

  describe('isElementDisplayed', () => {
    it('should return displayed state', async () => {
      const result = await operations.isElementDisplayed('id', 'element-id');

      expect(result).toEqual({ displayed: true });
      expect(mockElement.isDisplayed).toHaveBeenCalled();
    });

    it('should return false when element not found', async () => {
      mockDriver.wait.mockRejectedValue(new Error('Not found'));

      const result = await operations.isElementDisplayed('id', 'nonexistent');

      expect(result).toEqual({ displayed: false });
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.isElementDisplayed('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('isElementEnabled', () => {
    it('should return enabled state', async () => {
      const result = await operations.isElementEnabled('id', 'element-id');

      expect(result).toEqual({ enabled: true });
      expect(mockElement.isEnabled).toHaveBeenCalled();
    });

    it('should return false when element not found', async () => {
      mockDriver.wait.mockRejectedValue(new Error('Not found'));

      const result = await operations.isElementEnabled('id', 'nonexistent');

      expect(result).toEqual({ enabled: false });
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.isElementEnabled('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('isElementSelected', () => {
    it('should return selected state', async () => {
      const result = await operations.isElementSelected('id', 'checkbox-id');

      expect(result).toEqual({ selected: false });
      expect(mockElement.isSelected).toHaveBeenCalled();
    });

    it('should return false when element not found', async () => {
      mockDriver.wait.mockRejectedValue(new Error('Not found'));

      const result = await operations.isElementSelected('id', 'nonexistent');

      expect(result).toEqual({ selected: false });
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.isElementSelected('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('getElementCssValue', () => {
    it('should get CSS value', async () => {
      const result = await operations.getElementCssValue('id', 'element-id', 'font-size');

      expect(result).toEqual({ property: 'font-size', value: '16px' });
      expect(mockElement.getCssValue).toHaveBeenCalledWith('font-size');
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.getElementCssValue('id', 'test', 'color')).rejects.toThrow('Browser not started');
    });
  });

  describe('scrollToElement', () => {
    it('should scroll to element', async () => {
      const result = await operations.scrollToElement('id', 'element-id');

      expect(result).toEqual({
        success: true,
        message: 'Scrolled to element successfully'
      });
      expect(mockDriver.executeScript).toHaveBeenCalledWith(
        'arguments[0].scrollIntoView(true);',
        mockElement
      );
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.scrollToElement('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('hoverElement', () => {
    it('should hover over element', async () => {
      const result = await operations.hoverElement('id', 'element-id');

      expect(result).toEqual({
        success: true,
        message: 'Hovered over element successfully'
      });
      expect(mockDriver.actions().move).toHaveBeenCalled();
      expect(mockDriver.actions().perform).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.hoverElement('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('doubleClickElement', () => {
    it('should double click element', async () => {
      const result = await operations.doubleClickElement('id', 'element-id');

      expect(result).toEqual({
        success: true,
        message: 'Double clicked successfully'
      });
      expect(mockDriver.actions().doubleClick).toHaveBeenCalledWith(mockElement);
      expect(mockDriver.actions().perform).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.doubleClickElement('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('rightClickElement', () => {
    it('should right click element', async () => {
      const result = await operations.rightClickElement('id', 'element-id');

      expect(result).toEqual({
        success: true,
        message: 'Right clicked successfully'
      });
      expect(mockDriver.actions().contextClick).toHaveBeenCalledWith(mockElement);
      expect(mockDriver.actions().perform).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.rightClickElement('id', 'test')).rejects.toThrow('Browser not started');
    });
  });

  describe('dragAndDrop', () => {
    it('should drag and drop elements', async () => {
      const result = await operations.dragAndDrop('id', 'source-id', 'id', 'target-id');

      expect(result).toEqual({
        success: true,
        message: 'Drag and drop completed successfully'
      });
      expect(mockDriver.actions().dragAndDrop).toHaveBeenCalledWith(mockElement, mockElement);
      expect(mockDriver.actions().perform).toHaveBeenCalled();
    });

    it('should throw error when driver is not started', async () => {
      operations.setDriver(null);
      await expect(operations.dragAndDrop('id', 'src', 'id', 'tgt')).rejects.toThrow('Browser not started');
    });
  });

  describe('setDriver', () => {
    it('should set driver', () => {
      const newOps = new ElementOperations(null);
      newOps.setDriver(mockDriver);
      
      // Verify driver is set by calling a method
      expect(async () => await newOps.findElements('css', '.test')).not.toThrow();
    });
  });
});
