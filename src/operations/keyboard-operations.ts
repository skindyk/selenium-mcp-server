import { WebDriver, Key } from 'selenium-webdriver';
import { SuccessResponse } from '../core/types.js';
import { ensureDriverExists } from '../core/locator-utils.js';

/**
 * KeyboardOperations class handles all keyboard-related interactions with the browser.
 * Provides methods for pressing individual keys and key combinations.
 */
export class KeyboardOperations {
  constructor(private driver: WebDriver | null) {}

  /**
   * Set the WebDriver instance for keyboard operations.
   * 
   * @param driver - WebDriver instance or null
   */
  setDriver(driver: WebDriver | null): void {
    this.driver = driver;
  }

  /**
   * Simulate pressing a keyboard key.
   * Supports special keys like Enter, Tab, Arrow keys, Function keys, etc.
   * 
   * @param key - Key to press (e.g., 'Enter', 'Tab', 'Escape', 'Space', 'F1', etc.)
   * @returns Promise with success status and message
   * @throws Error if browser is not started or key press fails
   * 
   * @example
   * await keyboardOps.pressKey('Enter');
   * await keyboardOps.pressKey('Tab');
   * await keyboardOps.pressKey('Escape');
   * await keyboardOps.pressKey('ArrowDown');
   * await keyboardOps.pressKey('F5');
   */
  async pressKey(key: string): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    
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

  /**
   * Simulate pressing a combination of keys (e.g., Ctrl+C, Shift+Tab).
   * Keys are pressed in order and released in reverse order.
   * 
   * @param keys - Array of keys to press together (e.g., ['ctrl', 'c'] for Ctrl+C)
   * @returns Promise with success status and message
   * @throws Error if browser is not started, keys array is invalid, or key press fails
   * 
   * @example
   * await keyboardOps.pressKeyCombo(['ctrl', 'c']); // Copy
   * await keyboardOps.pressKeyCombo(['ctrl', 'v']); // Paste
   * await keyboardOps.pressKeyCombo(['shift', 'tab']); // Shift+Tab
   * await keyboardOps.pressKeyCombo(['ctrl', 'shift', 's']); // Ctrl+Shift+S
   */
  async pressKeyCombo(keys: string[]): Promise<SuccessResponse> {
    ensureDriverExists(this.driver);
    
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
}
