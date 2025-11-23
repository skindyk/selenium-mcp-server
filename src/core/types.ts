/**
 * Common types and interfaces for the Selenium MCP Server
 */

export interface BrowserOptions {
  headless?: boolean;
  arguments?: string[];
  windowSize?: { width: number; height: number };
}

export type LocatorStrategy = 
  | 'id' 
  | 'css' 
  | 'xpath' 
  | 'name' 
  | 'tag' 
  | 'class' 
  | 'linkText' 
  | 'partialLinkText';

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface BrowserStartResponse extends SuccessResponse {
  warnings?: string[];
}

export interface NavigateResponse extends SuccessResponse {
  url: string;
}

export interface ScreenshotResponse extends SuccessResponse {
  path?: string;
}

export interface FindElementResponse {
  found: boolean;
  message: string;
}

export interface FindElementsResponse {
  count: number;
  message: string;
}

export interface ElementTextResponse {
  text: string;
}

export interface ElementAttributeResponse {
  attribute: string;
  value: string | null;
}

export interface ElementPropertyResponse {
  property: string;
  value: string | null;
}

export interface ElementCssValueResponse {
  property: string;
  value: string;
}

export interface ElementStateResponse {
  displayed?: boolean;
  enabled?: boolean;
  selected?: boolean;
}

export interface WindowHandlesResponse {
  handles: string[];
}

export interface WindowSizeResponse {
  width: number;
  height: number;
}

export interface UrlResponse {
  url: string;
}

export interface TitleResponse {
  title: string;
}

export interface PageSourceResponse {
  source: string;
}

export interface ScriptExecutionResponse<T = unknown> {
  result: T;
}

// Alert/Dialog Types
export interface AlertTextResponse {
  text: string;
}

// AI Discovery Types
export interface LinkInfo {
  text: string;
  href: string;
  selector: string;
}

export interface FormFieldInfo {
  name: string;
  type: string;
  label: string;
  selector: string;
}

export interface FormInfo {
  action: string;
  method: string;
  fields: FormFieldInfo[];
}

export interface ButtonInfo {
  text: string;
  type: string;
  selector: string;
}

export interface HeadingInfo {
  level: string;
  text: string;
}

export interface PageSummary {
  title: string;
  url: string;
  forms: number;
  links: number;
  buttons: number;
  inputs: number;
  images: number;
  headings: HeadingInfo[];
  mainContent: string;
}

export interface SelectorValidationInput {
  by: string;
  value: string;
}

export interface SelectorValidationResult {
  selector: SelectorValidationInput;
  found: boolean;
  count: number;
  error?: string;
}

export interface SelectorValidationResponse {
  results: SelectorValidationResult[];
}

// Constants
export const DEFAULT_TIMEOUT = 10000;
export const MAX_LINKS_TO_EXTRACT = 50;
export const MAX_CONTENT_LENGTH = 500;
