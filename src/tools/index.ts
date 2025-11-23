import { Tool } from "@modelcontextprotocol/sdk/types.js";

// Comprehensive Selenium Tools for Complete Browser Automation
export const tools: Tool[] = [
  // BROWSER MANAGEMENT (8 tools)
  {
    name: "start_browser",
    title: "Start Browser",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
        warnings: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "navigate",
    title: "Navigate to URL",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
        url: { type: "string" }
      },
      required: ["success", "message", "url"]
    }
  },
  {
    name: "get_current_url",
    title: "Get Current URL",
    description: "Get the current page URL (useful for SPA navigation detection)",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        url: { type: "string" }
      },
      required: ["url"]
    }
  },
  {
    name: "close_browser",
    title: "Close Browser",
    description: "Close the current browser session",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "get_title",
    title: "Get Page Title",
    description: "Get the current page title",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        title: { type: "string" }
      },
      required: ["title"]
    }
  },
  {
    name: "refresh",
    title: "Refresh Page",
    description: "Refresh the current page",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "go_back",
    title: "Go Back",
    description: "Navigate back in browser history",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "go_forward",
    title: "Go Forward",
    description: "Navigate forward in browser history",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },

  // PAGE DISCOVERY (5 tools)
  {
    name: "get_page_source",
    title: "Get Page Source",
    description: "Get the complete HTML source code for AI analysis",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        source: { type: "string" }
      },
      required: ["source"]
    }
  },
  {
    name: "find_element",
    title: "Find Element",
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
          default: 10000
        }
      },
      required: ["by", "value"]
    },
    outputSchema: {
      type: "object",
      properties: {
        found: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["found", "message"]
    }
  },
  {
    name: "find_elements",
    title: "Find Elements",
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
        },
        timeout: {
          type: "number",
          description: "Wait timeout in milliseconds",
          default: 10000
        }
      },
      required: ["by", "value"]
    },
    outputSchema: {
      type: "object",
      properties: {
        count: { type: "number" },
        message: { type: "string" }
      },
      required: ["count", "message"]
    }
  },
  {
    name: "take_screenshot",
    title: "Take Screenshot",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
        path: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "execute_script",
    title: "Execute JavaScript",
    description: "Execute JavaScript for custom page analysis",
    inputSchema: {
      type: "object",
      properties: {
        script: {
          type: "string",
          description: "JavaScript code to execute"
        },
        args: {
          type: "array",
          items: {},
          description: "Optional arguments to pass to the script (accessible via 'arguments' array in the script)"
        }
      },
      required: ["script"]
    },
    outputSchema: {
      type: "object",
      properties: {
        result: {}
      },
      required: ["result"]
    }
  },

  // ALERT/DIALOG OPERATIONS (4 tools)
  {
    name: "accept_alert",
    title: "Accept Alert",
    description: "Accept (click OK on) the current alert, confirm, or prompt dialog",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "dismiss_alert",
    title: "Dismiss Alert",
    description: "Dismiss (click Cancel on) the current alert or confirm dialog",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "get_alert_text",
    title: "Get Alert Text",
    description: "Get the text content of the current alert, confirm, or prompt dialog",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        text: { type: "string" }
      },
      required: ["text"]
    }
  },
  {
    name: "send_alert_text",
    title: "Send Alert Text",
    description: "Send text to a prompt dialog (must be called before accepting the prompt)",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text to input into the prompt dialog"
        }
      },
      required: ["text"]
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },

  // ELEMENT ANALYSIS (8 tools)
  {
    name: "get_element_text",
    title: "Get Element Text",
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
          default: 10000
        }
      },
      required: ["by", "value"]
    },
    outputSchema: {
      type: "object",
      properties: {
        text: { type: "string" }
      },
      required: ["text"]
    }
  },
  {
    name: "get_element_attribute",
    title: "Get Element Attribute",
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
          default: 10000
        }
      },
      required: ["by", "value", "attribute"]
    },
    outputSchema: {
      type: "object",
      properties: {
        attribute: { type: "string" },
        value: { type: ["string", "null"] }
      },
      required: ["attribute", "value"]
    }
  },
  {
    name: "get_element_property",
    title: "Get Element Property",
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
          default: 10000
        }
      },
      required: ["by", "value", "property"]
    },
    outputSchema: {
      type: "object",
      properties: {
        property: { type: "string" },
        value: { type: ["string", "null"] }
      },
      required: ["property", "value"]
    }
  },
  {
    name: "is_element_displayed",
    title: "Is Element Displayed",
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
          default: 10000
        }
      },
      required: ["by", "value"]
    },
    outputSchema: {
      type: "object",
      properties: {
        displayed: { type: "boolean" }
      },
      required: ["displayed"]
    }
  },
  {
    name: "is_element_enabled",
    title: "Is Element Enabled",
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
          default: 10000
        }
      },
      required: ["by", "value"]
    },
    outputSchema: {
      type: "object",
      properties: {
        enabled: { type: "boolean" }
      },
      required: ["enabled"]
    }
  },
  {
    name: "is_element_selected",
    title: "Is Element Selected",
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
          default: 10000
        }
      },
      required: ["by", "value"]
    },
    outputSchema: {
      type: "object",
      properties: {
        selected: { type: "boolean" }
      },
      required: ["selected"]
    }
  },
  {
    name: "get_element_css_value",
    title: "Get Element CSS Value",
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
          default: 10000
        }
      },
      required: ["by", "value", "cssProperty"]
    },
    outputSchema: {
      type: "object",
      properties: {
        property: { type: "string" },
        value: { type: "string" }
      },
      required: ["property", "value"]
    }
  },
  {
    name: "scroll_to_element",
    title: "Scroll to Element",
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
          default: 10000
        }
      },
      required: ["by", "value"]
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },

  // BASIC INTERACTION TESTING (3 tools)
  {
    name: "click_element",
    title: "Click Element",
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
          default: 10000
        }
      },
      required: ["by", "value"]
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "send_keys",
    title: "Send Keys",
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
          default: 10000
        }
      },
      required: ["by", "value", "text"]
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "hover_element",
    title: "Hover Over Element",
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
          default: 10000
        }
      },
      required: ["by", "value"]
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },

  // ELEMENT INTERACTION (4 additional tools)
  {
    name: "clear_element",
    title: "Clear Element",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "double_click_element",
    title: "Double Click Element",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "right_click_element",
    title: "Right Click Element",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "drag_and_drop",
    title: "Drag and Drop",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },

  // KEYBOARD ACTIONS (2 tools)
  {
    name: "press_key",
    title: "Press Key",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "press_key_combo",
    title: "Press Key Combo",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },

  // FILE OPERATIONS (1 tool)
  {
    name: "upload_file",
    title: "Upload File",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
        path: { type: "string" }
      },
      required: ["success", "message"]
    }
  },

  // WINDOW MANAGEMENT (6 tools)
  {
    name: "maximize_window",
    title: "Maximize Window",
    description: "Maximize the browser window",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "minimize_window",
    title: "Minimize Window",
    description: "Minimize the browser window",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "set_window_size",
    title: "Set Window Size",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "get_window_size",
    title: "Get Window Size",
    description: "Get the current browser window size",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        width: { type: "number" },
        height: { type: "number" }
      },
      required: ["width", "height"]
    }
  },
  {
    name: "switch_to_window",
    title: "Switch to Window",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "get_window_handles",
    title: "Get Window Handles",
    description: "Get all available window handles",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        handles: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["handles"]
    }
  },

  // FRAME MANAGEMENT (2 tools)
  {
    name: "switch_to_frame",
    title: "Switch to Frame",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "switch_to_default_content",
    title: "Switch to Default Content",
    description: "Switch back to the main document from a frame",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },

  // WAIT CONDITIONS (3 tools)
  {
    name: "wait_for_element",
    title: "Wait for Element",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "wait_for_element_visible",
    title: "Wait for Element Visible",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "wait_for_element_clickable",
    title: "Wait for Element Clickable",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },
  {
    name: "wait_for_text_present",
    title: "Wait for Text Present",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" }
      },
      required: ["success", "message"]
    }
  },

  // AI-OPTIMIZED DISCOVERY TOOLS (5 tools)
  {
    name: "get_all_links",
    title: "Get All Links",
    description: "Get all clickable links on the page for navigation test generation",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        links: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              href: { type: "string" },
              selector: { type: "string" }
            },
            required: ["text", "href", "selector"]
          }
        }
      },
      required: ["links"]
    }
  },
  {
    name: "get_all_forms",
    title: "Get All Forms",
    description: "Get all forms and their fields for form test generation",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        forms: {
          type: "array",
          items: {
            type: "object",
            properties: {
              action: { type: "string" },
              method: { type: "string" },
              fields: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    type: { type: "string" },
                    label: { type: "string" },
                    selector: { type: "string" }
                  },
                  required: ["name", "type", "label", "selector"]
                }
              }
            },
            required: ["action", "method", "fields"]
          }
        }
      },
      required: ["forms"]
    }
  },
  {
    name: "get_all_buttons",
    title: "Get All Buttons",
    description: "Get all buttons and interactive elements",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        buttons: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              type: { type: "string" },
              selector: { type: "string" }
            },
            required: ["text", "type", "selector"]
          }
        }
      },
      required: ["buttons"]
    }
  },
  {
    name: "get_page_summary",
    title: "Get Page Summary",
    description: "Get AI-friendly structured summary of the page",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    outputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        url: { type: "string" },
        forms: { type: "number" },
        links: { type: "number" },
        buttons: { type: "number" },
        inputs: { type: "number" },
        images: { type: "number" },
        headings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              level: { type: "string" },
              text: { type: "string" }
            },
            required: ["level", "text"]
          }
        },
        mainContent: { type: "string" }
      },
      required: ["title", "url", "forms", "links", "buttons", "inputs", "images", "headings", "mainContent"]
    }
  },
  {
    name: "validate_selectors",
    title: "Validate Selectors",
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
    },
    outputSchema: {
      type: "object",
      properties: {
        results: {
          type: "array",
          items: {
            type: "object",
            properties: {
              selector: {
                type: "object",
                properties: {
                  by: { type: "string" },
                  value: { type: "string" }
                },
                required: ["by", "value"]
              },
              found: { type: "boolean" },
              count: { type: "number" },
              error: { type: "string" }
            },
            required: ["selector", "found", "count"]
          }
        }
      },
      required: ["results"]
    }
  }
];