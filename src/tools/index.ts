import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Comprehensive Selenium Tools for Complete Browser Automation
export const tools: Tool[] = [
  // BROWSER MANAGEMENT (8 tools)
  {
    name: "start_browser",
    description: "Start a new browser session with specified browser and options",
    inputSchema: {
      type: "object",
      properties: {
        browser: {
          type: "string",
          enum: ["chrome", "firefox", "edge", "safari"],
          description: "Browser to launch",
          default: "chrome"
        },
        options: {
          type: "object",
          properties: {
            headless: {
              type: "boolean",
              description: "Run browser in headless mode",
              default: false
            },
            arguments: {
              type: "array",
              items: { type: "string" },
              description: "Additional browser arguments"
            },
            windowSize: {
              type: "object",
              properties: {
                width: { type: "number", description: "Window width" },
                height: { type: "number", description: "Window height" }
              },
              description: "Browser window size"
            }
          }
        }
      },
      required: []
    }
  },
  {
    name: "navigate",
    description: "Navigate to a URL for page analysis",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "URL to navigate to for analysis"
        }
      },
      required: ["url"]
    }
  },
  {
    name: "get_current_url",
    description: "Get the current page URL (useful for SPA navigation detection)",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "close_browser",
    description: "Close the current browser session",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_title",
    description: "Get the current page title",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "refresh",
    description: "Refresh the current page",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "go_back",
    description: "Navigate back in browser history",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "go_forward",
    description: "Navigate forward in browser history",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },

  // PAGE DISCOVERY (5 tools)
  {
    name: "get_page_source",
    description: "Get the complete HTML source code for AI analysis",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "find_element",
    description: "Find a single element to verify selectors work",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          description: "Wait timeout in milliseconds",
          default: 5000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "find_elements",
    description: "Find multiple elements and get count for test validation",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "take_screenshot",
    description: "Capture page screenshot for visual context and documentation",
    inputSchema: {
      type: "object",
      properties: {
        outputPath: {
          type: "string",
          description: "Optional path to save screenshot"
        }
      },
      required: []
    }
  },
  {
    name: "execute_script",
    description: "Execute JavaScript for custom page analysis",
    inputSchema: {
      type: "object",
      properties: {
        script: {
          type: "string",
          description: "JavaScript code to execute"
        }
      },
      required: ["script"]
    }
  },

  // ELEMENT ANALYSIS (8 tools)
  {
    name: "get_element_text",
    description: "Get element text content for labels, buttons, and validation",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "get_element_attribute",
    description: "Get element attributes (id, class, type, name, placeholder, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        attribute: {
          type: "string",
          description: "Attribute name to get"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value", "attribute"]
    }
  },
  {
    name: "get_element_property",
    description: "Get element properties (value, checked, selected, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        property: {
          type: "string",
          description: "Property name to get"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value", "property"]
    }
  },
  {
    name: "is_element_displayed",
    description: "Check if element is visible on the page",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "is_element_enabled",
    description: "Check if element is enabled and interactive",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "is_element_selected",
    description: "Check if element is selected (checkboxes, radio buttons)",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "get_element_css_value",
    description: "Get element CSS properties for styling analysis",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        cssProperty: {
          type: "string",
          description: "CSS property name"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value", "cssProperty"]
    }
  },
  {
    name: "scroll_to_element",
    description: "Scroll element into view for analysis",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value"]
    }
  },

  // BASIC INTERACTION TESTING (3 tools)
  {
    name: "click_element",
    description: "Test click interaction (for verification only)",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "send_keys",
    description: "Test text input (for verification only)",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        text: {
          type: "string",
          description: "Text to input"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value", "text"]
    }
  },
  {
    name: "hover_element",
    description: "Hover over element to reveal hidden content (dropdowns, tooltips, menus)",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 5000
        }
      },
      required: ["by", "value"]
    }
  },

  // ELEMENT INTERACTION (4 additional tools)
  {
    name: "clear_element",
    description: "Clear the content of an input element",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 10000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "double_click_element",
    description: "Perform a double click on an element",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 10000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "right_click_element",
    description: "Perform a right click (context click) on an element",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 10000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "drag_and_drop",
    description: "Drag an element and drop it onto another element",
    inputSchema: {
      type: "object",
      properties: {
        sourceBy: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy for source element"
        },
        sourceValue: {
          type: "string",
          description: "Selector value for source element"
        },
        targetBy: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy for target element"
        },
        targetValue: {
          type: "string",
          description: "Selector value for target element"
        },
        timeout: {
          type: "number",
          default: 10000
        }
      },
      required: ["sourceBy", "sourceValue", "targetBy", "targetValue"]
    }
  },

  // KEYBOARD ACTIONS (2 tools)
  {
    name: "press_key",
    description: "Simulate pressing a keyboard key",
    inputSchema: {
      type: "object",
      properties: {
        key: {
          type: "string",
          description: "Key to press (e.g., 'Enter', 'Tab', 'Escape', 'Space', 'F1', etc.)"
        }
      },
      required: ["key"]
    }
  },
  {
    name: "press_key_combo",
    description: "Simulate pressing a combination of keys",
    inputSchema: {
      type: "object",
      properties: {
        keys: {
          type: "array",
          items: { type: "string" },
          description: "Array of keys to press together (e.g., ['ctrl', 'c'] for Ctrl+C)"
        }
      },
      required: ["keys"]
    }
  },

  // FILE OPERATIONS (1 tool)
  {
    name: "upload_file",
    description: "Upload a file using a file input element",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy for file input element"
        },
        value: {
          type: "string",
          description: "Selector value for file input element"
        },
        filePath: {
          type: "string",
          description: "Absolute or relative path to the file to upload"
        },
        timeout: {
          type: "number",
          default: 10000
        }
      },
      required: ["by", "value", "filePath"]
    }
  },

  // WINDOW MANAGEMENT (6 tools)
  {
    name: "maximize_window",
    description: "Maximize the browser window",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "minimize_window",
    description: "Minimize the browser window",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "set_window_size",
    description: "Set the browser window size",
    inputSchema: {
      type: "object",
      properties: {
        width: {
          type: "number",
          description: "Window width in pixels"
        },
        height: {
          type: "number",
          description: "Window height in pixels"
        }
      },
      required: ["width", "height"]
    }
  },
  {
    name: "get_window_size",
    description: "Get the current browser window size",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "switch_to_window",
    description: "Switch to a specific browser window or tab",
    inputSchema: {
      type: "object",
      properties: {
        windowHandle: {
          type: "string",
          description: "Window handle to switch to"
        }
      },
      required: ["windowHandle"]
    }
  },
  {
    name: "get_window_handles",
    description: "Get all available window handles",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },

  // FRAME MANAGEMENT (2 tools)
  {
    name: "switch_to_frame",
    description: "Switch to a specific frame or iframe",
    inputSchema: {
      type: "object",
      properties: {
        frameReference: {
          type: "string",
          description: "Frame reference (index, name, or id). Numbers should be passed as strings."
        }
      },
      required: ["frameReference"]
    }
  },
  {
    name: "switch_to_default_content",
    description: "Switch back to the main document from a frame",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },

  // WAIT CONDITIONS (3 tools)
  {
    name: "wait_for_element",
    description: "Wait for an element to be present on the page",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 10000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "wait_for_element_visible",
    description: "Wait for an element to become visible",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 10000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "wait_for_element_clickable",
    description: "Wait for an element to become clickable",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        timeout: {
          type: "number",
          default: 10000
        }
      },
      required: ["by", "value"]
    }
  },
  {
    name: "wait_for_text_present",
    description: "Wait for specific text to be present in an element",
    inputSchema: {
      type: "object",
      properties: {
        by: {
          type: "string",
          enum: ["id", "css", "xpath", "name", "tag", "class", "linkText", "partialLinkText"],
          description: "Locator strategy"
        },
        value: {
          type: "string",
          description: "Selector value"
        },
        text: {
          type: "string",
          description: "Text to wait for in the element"
        },
        timeout: {
          type: "number",
          default: 10000
        }
      },
      required: ["by", "value", "text"]
    }
  },

  // AI-OPTIMIZED DISCOVERY TOOLS (5 tools)
  {
    name: "get_all_links",
    description: "Get all clickable links on the page for navigation test generation",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_all_forms",
    description: "Get all forms and their fields for form test generation",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_all_buttons",
    description: "Get all buttons and interactive elements",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "get_page_summary",
    description: "Get AI-friendly structured summary of the page",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "validate_selectors",
    description: "Test multiple selectors to find the most reliable ones",
    inputSchema: {
      type: "object",
      properties: {
        selectors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              by: { type: "string" },
              value: { type: "string" }
            }
          },
          description: "Array of selectors to validate"
        }
      },
      required: ["selectors"]
    }
  }
];