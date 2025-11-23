# Selenium MCP Server

A Model Context Protocol (MCP) server that provides seamless integration between MCP clients and Selenium WebDriver. This server enables natural language interactions with web browsers for automated testing, web scraping, and page analysis.

## Features

- **Natural Language Interface**: Control browsers using conversational commands
- **Complete Browser Automation**: 52 tools covering all essential Selenium operations
- **Multi-Browser Support**: Chrome, Firefox, Edge, and Safari
- **AI-Optimized Discovery**: Specialized tools for page analysis and test generation
- **MCP Compliance**: Full support for tool metadata, error codes, and resources
- **Flexible Tool Control**: Limit available tools using environment variables
- **TypeScript Implementation**: Full type safety and better error handling

## 📋 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **TypeScript**: Version 5.0.0 or higher
- **Browser Drivers**: Appropriate WebDriver for your target browser(s)
  - Chrome: ChromeDriver (usually auto-managed by selenium-webdriver)
  - Firefox: GeckoDriver
  - Edge: EdgeDriver

## 🛠️ Installation

1.  **Clone the project**:
    ```bash
    git clone https://github.com/your-username/selenium-mcp-server.git
    cd selenium-mcp-server
    ```
    
2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Build the project**:
    ```bash
    npm run build
    ```

## ⚙️ Configuration

**MCP Client Configuration**

**Windows:**
```json
{
  "servers": {
    "selenium": {
      "command": "node",
      "args": ["C:\\path\\to\\your\\selenium-mcp-server\\wrapper.cjs"]
    }
  }
}
```

**macOS/Linux:**
```json
{
  "servers": {
    "selenium": {
      "command": "node",
      "args": ["/path/to/your/selenium-mcp-server/wrapper.cjs"]
    }
  }
}
```

Replace the paths with your actual absolute path to `wrapper.cjs`.

**Environment Variables**

You can control which tools are available using the `MCP_TOOLS` environment variable:

- **No `MCP_TOOLS` set** or **no `env` section**: All 52 tools are available by default
- **`MCP_TOOLS` with specific tools**: Only those tools will be available

Examples:

**Default configuration (all tools available):**
```json
{
  "servers": {
    "selenium": {
      "command": "node",
      "args": ["/path/to/your/selenium-mcp-server/wrapper.cjs"]
    }
  }
}
```

**Limit to specific tools only:**
```json
{
  "servers": {
    "selenium": {
      "command": "node",
      "args": ["/path/to/your/selenium-mcp-server/wrapper.cjs"],
      "env": {
        "MCP_TOOLS": ["start_browser", "navigate", "click_element", "send_keys"]
      }
    }
  }
}
```

## 📖 Usage Examples

### Basic Navigation and Analysis

```typescript
// Example 1: Navigate and get page summary
start_browser({ browser: "chrome" })
navigate({ url: "https://example.com" })
get_page_summary()
close_browser()
```

### Form Interaction

```typescript
// Example 2: Fill out a login form
start_browser({ browser: "chrome" })
navigate({ url: "https://example.com/login" })

// Find and interact with form elements
send_keys({ by: "id", value: "username", text: "user@example.com" })
send_keys({ by: "id", value: "password", text: "secretpass" })
click_element({ by: "id", value: "login-button" })

// Wait for navigation
wait_for_element({ by: "css", value: ".dashboard", timeout: 5000 })
close_browser()
```

### Page Discovery and Testing

```typescript
// Example 3: Discover all interactive elements
start_browser({ browser: "firefox" })
navigate({ url: "https://example.com" })

// Get structured data about the page
get_all_links()       // Extract all links with selectors
get_all_forms()       // Get form fields and structure
get_all_buttons()     // Find all clickable buttons

// Take a screenshot for documentation
take_screenshot({ outputPath: "./screenshots/page.png" })
close_browser()
```

### Advanced Interactions

```typescript
// Example 4: Complex user interactions
start_browser({ browser: "chrome" })
navigate({ url: "https://example.com" })

// Hover to reveal dropdown
hover_element({ by: "css", value: ".menu-item" })
wait_for_element_visible({ by: "css", value: ".dropdown-menu" })

// Drag and drop
drag_and_drop({ 
  sourceBy: "id", sourceValue: "item1",
  targetBy: "id", targetValue: "dropzone"
})

// Press keyboard shortcuts
press_key_combo({ keys: ["ctrl", "s"] })
close_browser()
```

### JavaScript Execution

```typescript
// Example 5: Execute custom JavaScript
start_browser({ browser: "chrome" })
navigate({ url: "https://example.com" })

// Get computed values
execute_script({ script: "return window.innerHeight" })

// Scroll to bottom
execute_script({ script: "window.scrollTo(0, document.body.scrollHeight)" })

// Extract custom data
execute_script({ 
  script: "return Array.from(document.querySelectorAll('.item')).map(el => el.textContent)" 
})
close_browser()
```

### Validation Testing

```typescript
// Example 6: Validate multiple selectors
start_browser({ browser: "chrome" })
navigate({ url: "https://example.com" })

validate_selectors({ 
  selectors: [
    { by: "id", value: "header" },
    { by: "css", value: ".main-content" },
    { by: "xpath", value: "//button[@type='submit']" }
  ]
})
close_browser()
```

## 🎯 Locator Strategies

The server supports multiple locator strategies for finding elements:

| Strategy | Description | Example |
|----------|-------------|---------|
| `id` | Find by element ID | `{ by: "id", value: "submit-btn" }` |
| `css` | CSS selector | `{ by: "css", value: ".form input[type='email']" }` |
| `xpath` | XPath expression | `{ by: "xpath", value: "//button[@class='submit']" }` |
| `name` | Name attribute | `{ by: "name", value: "username" }` |
| `tag` | HTML tag name | `{ by: "tag", value: "button" }` |
| `class` | Class name | `{ by: "class", value: "btn-primary" }` |
| `linkText` | Exact link text | `{ by: "linkText", value: "Click here" }` |
| `partialLinkText` | Partial link text | `{ by: "partialLinkText", value: "Click" }` |

**Best Practices:**
- Prefer `id` for unique elements (fastest and most reliable)
- Use `css` for complex selections (flexible and readable)
- Use `xpath` when CSS selectors can't reach the element
- Avoid `tag` alone for common elements (too generic)

## 🧰 Available Tools (52 Total)

### Browser Management (8 tools)
- **start_browser** - Start a new browser session (Chrome, Firefox, Edge, Safari)
- **close_browser** - Close the current browser session
- **navigate** - Navigate to a URL
- **get_current_url** - Get the current page URL
- **get_title** - Get the current page title
- **refresh** - Refresh the current page
- **go_back** - Navigate back in browser history
- **go_forward** - Navigate forward in browser history

### Page Discovery (5 tools)
- **get_page_source** - Get the complete HTML source
- **take_screenshot** - Capture a screenshot (with MCP Resources support)
- **get_page_summary** - Get AI-friendly structured page summary
- **get_all_links** - Extract all links with selectors
- **get_all_forms** - Get form fields and structure
- **get_all_buttons** - Find all clickable buttons

### Element Finding (2 tools)
- **find_element** - Find a single element
- **find_elements** - Find multiple elements and get count

### Element Inspection (5 tools)
- **get_element_text** - Get visible text content
- **get_element_attribute** - Get element attribute value
- **get_element_property** - Get element property value
- **get_element_css_value** - Get computed CSS property
- **scroll_to_element** - Scroll element into view

### Element State (3 tools)
- **is_element_displayed** - Check if element is visible
- **is_element_enabled** - Check if element is enabled
- **is_element_selected** - Check if element is selected (checkboxes/radio)

### Element Interaction (7 tools)
- **click_element** - Click on an element
- **send_keys** - Type text into an element
- **clear_element** - Clear an input field
- **double_click_element** - Perform double click
- **right_click_element** - Perform right click (context menu)
- **hover_element** - Hover over an element
- **drag_and_drop** - Drag one element to another

### Keyboard Actions (2 tools)
- **press_key** - Press a single key (Enter, Tab, etc.)
- **press_key_combo** - Press key combinations (Ctrl+C, etc.)

### File Operations (1 tool)
- **upload_file** - Upload a file to a file input element

### Window Management (6 tools)
- **maximize_window** - Maximize browser window
- **minimize_window** - Minimize browser window
- **set_window_size** - Set specific window dimensions
- **get_window_size** - Get current window dimensions
- **switch_to_window** - Switch to a different window/tab
- **get_window_handles** - Get all window handles

### Frame Management (2 tools)
- **switch_to_frame** - Switch to an iframe or frame
- **switch_to_default_content** - Switch back to main document

### Wait Conditions (4 tools)
- **wait_for_element** - Wait for element to be present
- **wait_for_element_visible** - Wait for element to become visible
- **wait_for_element_clickable** - Wait for element to be clickable
- **wait_for_text_present** - Wait for specific text in element

### Alert Handling (4 tools)
- **accept_alert** - Accept (OK) an alert dialog
- **dismiss_alert** - Dismiss (Cancel) an alert dialog
- **get_alert_text** - Get alert message text
- **send_alert_text** - Type into a prompt dialog

### JavaScript Execution (1 tool)
- **execute_script** - Execute custom JavaScript in the browser

### Testing & Validation (1 tool)
- **validate_selectors** - Test multiple selectors and get results

## 🎁 MCP Features

### Tool Metadata
All 52 tools include user-friendly display names (title field) for better UX in MCP clients.

### Error Handling
Standardized MCP error codes:
- **InvalidRequest** - Browser not started or invalid operation
- **InvalidParams** - Invalid parameters (element not found, invalid URL, etc.)
- **RequestTimeout** - Operation timed out
- **InternalError** - Browser operation failed

### Resources
The server automatically exposes screenshots and HTML as MCP resources:
- **Screenshots**: Available as `screenshot://{id}` (image/png)
- **HTML Source**: Available as `html://{id}` (text/html)

Resources are session-based and available through the MCP Resources protocol.

## ⚠️ Security Considerations

### Execute Script Tool

The `execute_script` tool allows running arbitrary JavaScript in the browser context. 

**⚠️ WARNING**: Only use with trusted scripts. Never execute user-provided code without proper validation and sanitization.

```typescript
// ❌ DANGEROUS - Never do this with untrusted input
execute_script({ script: userProvidedCode })

// ✅ SAFE - Use predefined, validated scripts
execute_script({ script: "return document.title" })
```

### File Upload Restrictions

Both `upload_file` and `take_screenshot` tools validate file paths to prevent directory traversal attacks. Paths containing `..` are rejected.

## 🚨 Troubleshooting

### Common Issues
- **Server Won't Start**: Check Node.js version (18+) and run `npm run build`
- **Connection Issues**: Verify absolute paths in MCP configuration
- **Browser Driver Issues**: Ensure appropriate WebDriver is installed and browser versions are compatible
- **Element Not Found**: Increase timeout values or verify selectors using `validate_selectors`
- **Stale Element Reference**: Use `wait_for_element` before interacting with dynamic content

### Debugging Tips

1. **Use `get_page_summary()` first** to understand page structure
2. **Test selectors** with `validate_selectors()` before using them
3. **Increase timeouts** for slow-loading pages
4. **Take screenshots** at each step to debug visual issues
5. **Check console logs** in the terminal running the MCP server

## 📄 License

MIT License.
