import { Tool } from "@modelcontextprotocol/sdk/types.js";

// AI-Optimized Tools for Test Generation
export const tools: Tool[] = [
  // CORE BROWSER MANAGEMENT (4 tools)
  {
    name: "start_browser",
    description: "Start a browser session for page discovery and analysis",
    inputSchema: {
      type: "object",
      properties: {
        browser: {
          type: "string",
          enum: ["chrome", "firefox", "edge"],
          description: "Browser to launch",
          default: "chrome"
        },
        options: {
          type: "object",
          properties: {
            headless: {
              type: "boolean",
              description: "Run browser in headless mode (recommended for AI)",
              default: true
            },
            windowSize: {
              type: "object",
              properties: {
                width: { type: "number", default: 1920 },
                height: { type: "number", default: 1080 }
              }
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
    description: "Close the browser session and clean up resources",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },

  // PAGE DISCOVERY (6 tools)
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
    name: "get_title",
    description: "Get the page title for context and test naming",
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

  // BASIC INTERACTION TESTING (2 tools)
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

  // AI-OPTIMIZED DISCOVERY TOOLS (5 new tools)
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