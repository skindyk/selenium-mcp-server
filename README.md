# AI-Optimized Selenium MCP Server

An intelligent Model Context Protocol (MCP) server specifically designed for AI-powered test generation. This server provides AI assistants like Copilot with the perfect set of tools to discover, analyze, and understand web pages for generating high-quality Selenium and Selenide test code.

## 🤖 AI-First Design

Built specifically for AI assistants to:
* **Discover page structure** efficiently with intelligent analysis tools
* **Generate comprehensive test code** (Selenium WebDriver & Selenide)
* **Understand element relationships** through structured data
* **Create reliable selectors** with built-in validation
* **Analyze user interactions** for complete test coverage

## 🚀 Key Features

* **AI-Optimized Discovery**: 25 focused tools designed specifically for test generation
* **Intelligent Page Analysis**: Get structured page summaries instead of raw HTML
* **Bulk Element Discovery**: Find all forms, buttons, and links in single calls
* **Smart Selector Validation**: Test multiple selectors to find the most reliable ones
* **Multi-Browser Support**: Chrome, Firefox, and Microsoft Edge
* **Headless Mode Optimized**: Perfect for AI analysis workflows
* **TypeScript Implementation**: Full type safety and better error handling
* **Fast & Focused**: 60% fewer tool calls needed vs comprehensive automation servers

## Prerequisites

* **Node.js**: Version 18.0.0 or higher
* **TypeScript**: Version 5.0.0 or higher
* **Browser Drivers**: Appropriate WebDriver for your target browser(s)
  * Chrome: ChromeDriver (usually auto-managed by selenium-webdriver)
  * Firefox: GeckoDriver
  * Edge: EdgeDriver

## 📦 Installation

### Option 1: NPM Package (Recommended)
```bash
npm install -g selenium-mcp-server
```

### Option 2: From Source
```bash
# Clone the repository
git clone https://github.com/your-username/selenium-mcp-server.git
cd selenium-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Test the server (optional)
node dist/index.js
```

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **Browser Drivers**: Appropriate WebDriver for your target browser(s)
  - Chrome: ChromeDriver (usually auto-managed by selenium-webdriver)
  - Firefox: GeckoDriver
  - Edge: EdgeDriver

## Configuration

### MCP Client Configuration

**Windows:**
```json
{
  "servers": {
    "selenium": {
      "command": "node",
      "args": ["C:\\path\\to\\your\\selenium-mcp-server\\wrapper.cjs"],
      "env": {}
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
      "args": ["/path/to/your/selenium-mcp-server/wrapper.cjs"],
      "env": {}
    }
  }
}
```

Replace the paths with your actual absolute path to `wrapper.cjs`.

### Environment Variables

You can limit available tools using the `MCP_TOOLS` environment variable:

```json
{
  "servers": {
    "selenium": {
      "command": "node",
      "args": ["/path/to/your/selenium-mcp-server/wrapper.cjs"],
      "env": {
        "MCP_TOOLS": "[\"start_browser\", \"navigate\", \"click_element\", \"send_keys\"]"
      }
    }
  }
}
```

## 🛠️ AI-Optimized Tools (25 Total)

### Core Browser Management (4 tools)
- `start_browser` - Start browser session for page analysis
- `navigate` - Navigate to URL for analysis
- `get_current_url` - Get current URL (useful for SPA detection)
- `close_browser` - Close browser and cleanup

### Page Discovery (6 tools)
- `get_page_source` - Get complete HTML for AI analysis
- `get_title` - Get page title for context and test naming
- `find_element` - Verify single element selectors
- `find_elements` - Count multiple elements for validation
- `take_screenshot` - Capture visual context for AI
- `execute_script` - Run custom JavaScript analysis

### Element Analysis (8 tools)
- `get_element_text` - Read labels, buttons, content
- `get_element_attribute` - Get id, class, type, name, placeholder
- `get_element_property` - Get form values, checked states
- `is_element_displayed` - Check element visibility
- `is_element_enabled` - Check element interactivity
- `is_element_selected` - Check selection states
- `get_element_css_value` - Understand styling and layout
- `scroll_to_element` - Handle elements outside viewport

### Basic Interaction Testing (2 tools)
- `click_element` - Test element clickability
- `send_keys` - Test input field functionality

### 🆕 AI-Optimized Discovery (5 tools)
- `get_all_links` - **Discover all navigation links at once**
- `get_all_forms` - **Discover all forms with their fields**
- `get_all_buttons` - **Discover all interactive buttons**
- `get_page_summary` - **Get structured page overview for AI**
- `validate_selectors` - **Test selector reliability**

## Usage Examples

### AI Test Generation Workflow
```javascript
// AI Assistant analyzes a login page for test generation
await startBrowser({ browser: "chrome", options: { headless: true } });
await navigate({ url: "https://app.example.com/login" });

// AI gets comprehensive page overview in one call
const summary = await getPageSummary();
// Returns: { title: "Login", forms: 1, buttons: 2, links: 3, headings: [...] }

// AI discovers all forms and their fields
const forms = await getAllForms();
// Returns: [{ action: "/login", fields: [{ name: "username", type: "email", label: "Email" }] }]

// AI discovers all interactive elements
const buttons = await getAllButtons();
// Returns: [{ text: "Sign In", type: "submit", selector: "#login-btn" }]

// AI captures visual context
await takeScreenshot({ outputPath: "./login-analysis.png" });

await closeBrowser();
```

### Generated Test Code
Based on the AI analysis above, the assistant generates:

**Selenium WebDriver:**
```java
@Test
public void testLogin() {
    driver.get("https://app.example.com/login");
    driver.findElement(By.name("username")).sendKeys("test@example.com");
    driver.findElement(By.name("password")).sendKeys("password123");
    driver.findElement(By.id("login-btn")).click();
    
    WebDriverWait wait = new WebDriverWait(driver, 10);
    wait.until(ExpectedConditions.presenceOfElementLocated(By.className("welcome")));
}
```

**Selenide:**
```java
@Test
public void testLogin() {
    open("https://app.example.com/login");
    $("[name='username']").setValue("test@example.com");
    $("[name='password']").setValue("password123");
    $("#login-btn").click();
    $(".welcome").should(appear);
}
```

### Element Location Strategies
- `id` - Find by element ID
- `css` - Find by CSS selector
- `xpath` - Find by XPath expression
- `name` - Find by name attribute
- `tag` - Find by tag name
- `class` - Find by class name
- `linkText` - Find by exact link text
- `partialLinkText` - Find by partial link text

### Browser Options
```javascript
await startBrowser({
  browser: "chrome",
  options: {
    headless: true,
    windowSize: { width: 1920, height: 1080 },
    arguments: ["--disable-web-security", "--no-sandbox"]
  }
});
```

## Development

### Scripts
- `npm run build` - Build the TypeScript project
- `npm run start` - Start the server
- `npm run dev` - Start in development mode with tsx
- `npm run test` - Run tests
- `npm run lint` - Lint the code
- `npm run format` - Format the code

### Project Structure
```
selenium-mcp-server/
├── src/
│   ├── index.ts              # Main server entry point
│   ├── selenium-client.ts    # Selenium WebDriver client
│   └── tools/
│       └── index.ts          # Tool definitions
├── dist/                     # Compiled JavaScript
├── package.json
├── tsconfig.json
├── wrapper.cjs              # CommonJS wrapper
└── README.md
```

## Troubleshooting

### Common Issues

1. **Server Won't Start**
   - Check Node.js version (18+)
   - Run `npm run build` to compile TypeScript
   - Verify all dependencies are installed

2. **Browser Driver Issues**
   - Ensure appropriate WebDriver is installed
   - Check browser version compatibility
   - Try updating selenium-webdriver package

3. **Element Not Found**
   - Verify the locator strategy and value
   - Increase timeout values
   - Check if element is in a frame/iframe
   - Wait for page to fully load

4. **Connection Issues**
   - Verify absolute paths in MCP configuration
   - Check file permissions on wrapper.cjs
   - Ensure the server process can start

### Browser Driver Installation

**Chrome**: Usually auto-managed by selenium-webdriver

**Firefox**: Install GeckoDriver
```bash
# macOS with Homebrew
brew install geckodriver

# Ubuntu/Debian
sudo apt-get install firefox-geckodriver

# Windows - Download from Mozilla GitHub releases
```

**Edge**: Install EdgeDriver
```bash
# Windows with Chocolatey
choco install selenium-edge-driver

# Or download from Microsoft Edge Developer site
```

## License

MIT License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed information