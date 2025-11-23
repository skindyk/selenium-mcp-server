/**
 * Custom error classes for better error handling and debugging
 */

import { ErrorCode, McpError } from "@modelcontextprotocol/sdk/types.js";

/**
 * Base error class for all Selenium MCP Server errors
 */
export class SeleniumError extends Error {
  constructor(message: string, public readonly code?: string, public readonly mcpErrorCode?: ErrorCode) {
    super(message);
    this.name = 'SeleniumError';
    Error.captureStackTrace(this, this.constructor);
  }
  
  /**
   * Convert to MCP error
   */
  toMcpError(): McpError {
    return new McpError(
      this.mcpErrorCode || ErrorCode.InternalError,
      this.message
    );
  }
}

/**
 * Error thrown when browser is not started
 */
export class BrowserNotStartedError extends SeleniumError {
  constructor(operation: string) {
    super(
      `Browser not started. Please call start_browser first before using ${operation}.`,
      'BROWSER_NOT_STARTED',
      ErrorCode.InvalidRequest
    );
    this.name = 'BrowserNotStartedError';
  }
}

/**
 * Error thrown when element is not found within timeout
 */
export class ElementNotFoundError extends SeleniumError {
  constructor(
    public readonly locatorStrategy: string,
    public readonly locatorValue: string,
    public readonly timeout: number,
    originalError?: Error
  ) {
    const message = `Element not found [${locatorStrategy}="${locatorValue}"] within ${timeout}ms${originalError ? `: ${originalError.message}` : ''}`;
    super(message, 'ELEMENT_NOT_FOUND', ErrorCode.InvalidParams);
    this.name = 'ElementNotFoundError';
  }
}

/**
 * Error thrown when element exists but is not in the expected state
 */
export class ElementStateError extends SeleniumError {
  constructor(
    public readonly locatorStrategy: string,
    public readonly locatorValue: string,
    public readonly expectedState: string,
    public readonly timeout: number,
    originalError?: Error
  ) {
    const message = `Element [${locatorStrategy}="${locatorValue}"] did not become ${expectedState} within ${timeout}ms${originalError ? `: ${originalError.message}` : ''}`;
    super(message, 'ELEMENT_STATE_ERROR', ErrorCode.InvalidParams);
    this.name = 'ElementStateError';
  }
}

/**
 * Error thrown when element interaction fails
 */
export class ElementInteractionError extends SeleniumError {
  constructor(
    public readonly operation: string,
    public readonly locatorStrategy: string,
    public readonly locatorValue: string,
    originalError?: Error
  ) {
    const message = `Failed to ${operation} element [${locatorStrategy}="${locatorValue}"]${originalError ? `: ${originalError.message}` : ''}`;
    super(message, 'ELEMENT_INTERACTION_ERROR', ErrorCode.InternalError);
    this.name = 'ElementInteractionError';
  }
}

/**
 * Error thrown when navigation fails
 */
export class NavigationError extends SeleniumError {
  constructor(
    public readonly url: string,
    originalError?: Error
  ) {
    const message = `Failed to navigate to ${url}${originalError ? `: ${originalError.message}` : ''}`;
    super(message, 'NAVIGATION_ERROR', ErrorCode.InternalError);
    this.name = 'NavigationError';
  }
}

/**
 * Error thrown when URL format is invalid
 */
export class InvalidUrlError extends SeleniumError {
  constructor(public readonly url: string) {
    super(`Invalid URL format: ${url}`, 'INVALID_URL', ErrorCode.InvalidParams);
    this.name = 'InvalidUrlError';
  }
}

/**
 * Error thrown when browser startup fails
 */
export class BrowserStartupError extends SeleniumError {
  constructor(
    public readonly browser: string,
    originalError?: Error
  ) {
    const message = `Failed to start ${browser} browser${originalError ? `: ${originalError.message}` : ''}`;
    super(message, 'BROWSER_STARTUP_ERROR', ErrorCode.InternalError);
    this.name = 'BrowserStartupError';
  }
}

/**
 * Error thrown when browser operation fails (close, navigate, etc.)
 */
export class BrowserOperationError extends SeleniumError {
  constructor(
    public readonly operation: string,
    originalError?: Error
  ) {
    const message = `Failed to ${operation}${originalError ? `: ${originalError.message}` : ''}`;
    super(message, 'BROWSER_OPERATION_ERROR', ErrorCode.InternalError);
    this.name = 'BrowserOperationError';
  }
}

/**
 * Error thrown when file operation fails
 */
export class FileOperationError extends SeleniumError {
  constructor(
    public readonly operation: string,
    public readonly filePath: string,
    originalError?: Error
  ) {
    const message = `Failed to ${operation} file: ${filePath}${originalError ? `: ${originalError.message}` : ''}`;
    super(message, 'FILE_OPERATION_ERROR', ErrorCode.InternalError);
    this.name = 'FileOperationError';
  }
}

/**
 * Error thrown when security validation fails
 */
export class SecurityError extends SeleniumError {
  constructor(message: string) {
    super(message, 'SECURITY_ERROR', ErrorCode.InvalidParams);
    this.name = 'SecurityError';
  }
}

/**
 * Error thrown when script execution fails
 */
export class ScriptExecutionError extends SeleniumError {
  constructor(originalError?: Error) {
    const message = `Failed to execute script${originalError ? `: ${originalError.message}` : ''}`;
    super(message, 'SCRIPT_EXECUTION_ERROR', ErrorCode.InternalError);
    this.name = 'ScriptExecutionError';
  }
}

/**
 * Error thrown when timeout occurs
 */
export class TimeoutError extends SeleniumError {
  constructor(
    public readonly operation: string,
    public readonly timeout: number,
    originalError?: Error
  ) {
    const message = `${operation} timed out after ${timeout}ms${originalError ? `: ${originalError.message}` : ''}`;
    super(message, 'TIMEOUT_ERROR', ErrorCode.RequestTimeout);
    this.name = 'TimeoutError';
  }
}

/**
 * Error thrown when alert/dialog operation fails
 */
export class AlertError extends SeleniumError {
  constructor(
    public readonly operation: string,
    originalError?: Error
  ) {
    const message = `Failed to ${operation} alert${originalError ? `: ${originalError.message}` : ''}`;
    super(message, 'ALERT_ERROR', ErrorCode.InternalError);
    this.name = 'AlertError';
  }
}
