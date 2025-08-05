# Selenium MCP Server

A Model Context Protocol (MCP) server that provides seamless integration between MCP clients and Selenium WebDriver. This server enables natural language interactions with web browsers for automated testing, web scraping, and page analysis.

## Features

- **Natural Language Interface**: Control browsers using conversational commands
- **Complete Browser Automation**: 43 tools covering all essential Selenium operations
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

**Environment Variables**

You can limit available tools using the `MCP_TOOLS` environment variable:

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

## 🚨 Troubleshooting

### Common Issues
- **Server Won't Start**: Check Node.js version (18+) and run `npm run build`
- **Connection Issues**: Verify absolute paths in MCP configuration
- **Browser Driver Issues**: Ensure appropriate WebDriver is installed and browser versions are compatible

## 📄 License

MIT License.