# Selenium MCP Server

A Model Context Protocol (MCP) server that provides seamless integration between MCP clients and Selenium WebDriver. This server enables natural language interactions with web browsers for automated testing, web scraping, and page analysis.

## Features

- **Natural Language Interface**: Control browsers using conversational commands
- **Complete Browser Automation**: 48 tools covering all essential Selenium operations
- **Multi-Browser Support**: Chrome, Firefox, and Microsoft Edge
- **AI-Optimized Discovery**: Specialized tools for page analysis and test generation
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

4.  **Test the server (optional)**:
    ```bash
    node dist/index.js
    ```
    You should see: `Selenium MCP Server running on stdio`

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

- **No `MCP_TOOLS` set** or **no `env` section**: All 48 tools are available by default
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
