#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    Tool,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { SeleniumClient } from "./selenium-client.js";
import { tools as allTools } from "./tools/index.js";
import { SeleniumError } from "./core/errors.js";

// Read version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
    readFileSync(join(__dirname, "../package.json"), "utf-8")
);
const VERSION = packageJson.version;

function getAllowedTools(): string[] | null {
    const allowed = process.env.MCP_TOOLS;
    if (!allowed) return null; // No filtering - use all tools
    
    const availableToolNames = allTools.map(t => t.name);
    
    try {
        const parsed = JSON.parse(allowed);
        // If it's an array, use it for filtering
        if (Array.isArray(parsed)) {
            // Validate tool names and warn about invalid ones
            const invalidTools = parsed.filter(name => !availableToolNames.includes(name));
            if (invalidTools.length > 0) {
                console.error(`Warning: Invalid tool names in MCP_TOOLS will be ignored: ${invalidTools.join(', ')}`);
            }
            const validTools = parsed.filter(name => availableToolNames.includes(name));
            return validTools.length > 0 ? validTools : null;
        }
        // If it's "*", return null to indicate all tools
        if (parsed === "*") {
            return null;
        }
        return null; // Default to all tools for any other JSON value
    } catch {
        // Try to parse as comma-separated string
        const split = allowed.split(',').map(t => t.trim()).filter(t => t.length > 0);
        // Validate tool names
        const invalidTools = split.filter(name => !availableToolNames.includes(name));
        if (invalidTools.length > 0) {
            console.error(`Warning: Invalid tool names in MCP_TOOLS will be ignored: ${invalidTools.join(', ')}`);
        }
        const validTools = split.filter(name => availableToolNames.includes(name));
        return validTools.length > 0 ? validTools : null;
    }
}

class OptimizedSeleniumMCPServer {
    private server: Server;
    private seleniumClient: SeleniumClient | null = null;
    private tools: Tool[];
    private screenshots: Map<string, { path: string; timestamp: number; base64?: string }> = new Map();
    private pageHtml: Map<string, { url: string; html: string; timestamp: number }> = new Map();

    constructor() {
        const allowedTools = getAllowedTools();
        
        // Use all tools by default, filter only when specific tools are requested
        if (allowedTools === null) {
            // No MCP_TOOLS specified or "*" specified - use all tools
            this.tools = [...allTools]; // Create a copy to avoid mutations
        } else {
            // Specific tools requested - filter to only those tools
            this.tools = allTools.filter((t: Tool) => allowedTools.includes(t.name));
            
            // Fallback: if filtering results in no tools, use all tools
            if (this.tools.length === 0) {
                console.error("Warning: No valid tools found after filtering, using all tools as fallback");
                this.tools = [...allTools];
            }
        }

        this.server = new Server({
            name: "selenium",
            version: VERSION,
        }, {
            capabilities: {
                tools: {},
                resources: {}
            }
        });

        this.setupToolHandlers();
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            // Return a clean copy of tools array
            return {
                tools: this.tools.map(tool => ({ ...tool })),
            };
        });

        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            const resources = [];
            
            // Add screenshots as resources
            for (const [id, data] of this.screenshots.entries()) {
                resources.push({
                    uri: `screenshot://${id}`,
                    name: `Screenshot ${id}`,
                    description: `Screenshot taken at ${new Date(data.timestamp).toISOString()}`,
                    mimeType: "image/png"
                });
            }
            
            // Add page HTML as resources
            for (const [id, data] of this.pageHtml.entries()) {
                resources.push({
                    uri: `html://${id}`,
                    name: `Page HTML: ${data.url}`,
                    description: `HTML captured at ${new Date(data.timestamp).toISOString()}`,
                    mimeType: "text/html"
                });
            }
            
            return { resources };
        });

        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const uri = request.params.uri;
            
            if (uri.startsWith("screenshot://")) {
                const id = uri.substring("screenshot://".length);
                const screenshot = this.screenshots.get(id);
                
                if (!screenshot) {
                    throw new McpError(ErrorCode.InvalidRequest, `Screenshot not found: ${id}`);
                }
                
                // Read the screenshot file if not already cached
                if (!screenshot.base64) {
                    const fs = await import("fs/promises");
                    const buffer = await fs.readFile(screenshot.path);
                    screenshot.base64 = buffer.toString("base64");
                }
                
                return {
                    contents: [{
                        uri: uri,
                        mimeType: "image/png",
                        blob: screenshot.base64
                    }]
                };
            }
            
            if (uri.startsWith("html://")) {
                const id = uri.substring("html://".length);
                const html = this.pageHtml.get(id);
                
                if (!html) {
                    throw new McpError(ErrorCode.InvalidRequest, `HTML not found: ${id}`);
                }
                
                return {
                    contents: [{
                        uri: uri,
                        mimeType: "text/html",
                        text: html.html
                    }]
                };
            }
            
            throw new McpError(ErrorCode.InvalidRequest, `Unknown resource URI: ${uri}`);
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                // Initialize Selenium client if not already done
                if (!this.seleniumClient) {
                    this.seleniumClient = new SeleniumClient();
                }

                // Find and execute the appropriate tool
                const tool = this.tools.find(t => t.name === name);
                if (!tool) {
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }

                const result = await this.executeToolMethod(name, args || {});

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                    structuredContent: result,
                };
            } catch (error) {
                // If it's already an MCP error, rethrow it
                if (error instanceof McpError) {
                    throw error;
                }
                
                // If it's one of our custom SeleniumError errors, convert to MCP error
                if (error instanceof SeleniumError) {
                    throw error.toMcpError();
                }
                
                // For any other error, wrap in a generic InternalError
                const errorMessage = error instanceof Error ? error.message : String(error);
                throw new McpError(ErrorCode.InternalError, errorMessage);
            }
        });
    }

    private async executeToolMethod(toolName: string, args: any): Promise<unknown> {
        if (!this.seleniumClient) {
            throw new McpError(ErrorCode.InternalError, "Selenium client not initialized");
        }

        // Route to appropriate method based on tool name
        switch (toolName) {
            // BROWSER MANAGEMENT (8 tools)
            case "start_browser":
                return this.seleniumClient.startBrowser(args.browser, args.options);
            case "navigate":
                return this.seleniumClient.navigate(args.url);
            case "get_current_url":
                return this.seleniumClient.getCurrentUrl();
            case "close_browser":
                return this.seleniumClient.closeBrowser();
            case "get_title":
                return this.seleniumClient.getTitle();
            case "refresh":
                return this.seleniumClient.refresh();
            case "go_back":
                return this.seleniumClient.goBack();
            case "go_forward":
                return this.seleniumClient.goForward();

            // PAGE DISCOVERY (6 tools)
            case "get_page_source": {
                const result = await this.seleniumClient.getPageSource();
                // Store HTML as a resource
                const url = await this.seleniumClient.getCurrentUrl();
                const id = `page-${Date.now()}`;
                this.pageHtml.set(id, {
                    url: (url as any).url || "unknown",
                    html: (result as any).source || "",
                    timestamp: Date.now()
                });
                return result;
            }
            case "find_element":
                return this.seleniumClient.findElement(args.by, args.value, args.timeout);
            case "find_elements":
                return this.seleniumClient.findElements(args.by, args.value, args.timeout);
            case "take_screenshot": {
                const result = await this.seleniumClient.takeScreenshot(args.outputPath);
                // Store screenshot as a resource
                const id = `screenshot-${Date.now()}`;
                this.screenshots.set(id, {
                    path: (result as any).path || "",
                    timestamp: Date.now()
                });
                return result;
            }
            case "execute_script":
                return this.seleniumClient.executeScript(args.script, args.args);

            // ALERT/DIALOG OPERATIONS (4 tools)
            case "accept_alert":
                return this.seleniumClient.acceptAlert();
            case "dismiss_alert":
                return this.seleniumClient.dismissAlert();
            case "get_alert_text":
                return this.seleniumClient.getAlertText();
            case "send_alert_text":
                return this.seleniumClient.sendAlertText(args.text);

            // ELEMENT ANALYSIS (8 tools)
            case "get_element_text":
                return this.seleniumClient.getElementText(args.by, args.value, args.timeout);
            case "get_element_attribute":
                return this.seleniumClient.getElementAttribute(args.by, args.value, args.attribute, args.timeout);
            case "get_element_property":
                return this.seleniumClient.getElementProperty(args.by, args.value, args.property, args.timeout);
            case "is_element_displayed":
                return this.seleniumClient.isElementDisplayed(args.by, args.value, args.timeout);
            case "is_element_enabled":
                return this.seleniumClient.isElementEnabled(args.by, args.value, args.timeout);
            case "is_element_selected":
                return this.seleniumClient.isElementSelected(args.by, args.value, args.timeout);
            case "get_element_css_value":
                return this.seleniumClient.getElementCssValue(args.by, args.value, args.cssProperty, args.timeout);
            case "scroll_to_element":
                return this.seleniumClient.scrollToElement(args.by, args.value, args.timeout);

            // ELEMENT INTERACTION (7 tools)
            case "click_element":
                return this.seleniumClient.clickElement(args.by, args.value, args.timeout);
            case "send_keys":
                return this.seleniumClient.sendKeys(args.by, args.value, args.text, args.timeout);
            case "hover_element":
                return this.seleniumClient.hoverElement(args.by, args.value, args.timeout);
            case "clear_element":
                return this.seleniumClient.clearElement(args.by, args.value, args.timeout);
            case "double_click_element":
                return this.seleniumClient.doubleClickElement(args.by, args.value, args.timeout);
            case "right_click_element":
                return this.seleniumClient.rightClickElement(args.by, args.value, args.timeout);
            case "drag_and_drop":
                return this.seleniumClient.dragAndDrop(args.sourceBy, args.sourceValue, args.targetBy, args.targetValue, args.timeout);

            // KEYBOARD ACTIONS (2 tools)
            case "press_key":
                return this.seleniumClient.pressKey(args.key);
            case "press_key_combo":
                return this.seleniumClient.pressKeyCombo(args.keys);

            // FILE OPERATIONS (1 tool)
            case "upload_file":
                return this.seleniumClient.uploadFile(args.by, args.value, args.filePath, args.timeout);

            // WINDOW MANAGEMENT (6 tools)
            case "maximize_window":
                return this.seleniumClient.maximizeWindow();
            case "minimize_window":
                return this.seleniumClient.minimizeWindow();
            case "set_window_size":
                return this.seleniumClient.setWindowSize(args.width, args.height);
            case "get_window_size":
                return this.seleniumClient.getWindowSize();
            case "switch_to_window":
                return this.seleniumClient.switchToWindow(args.windowHandle);
            case "get_window_handles":
                return this.seleniumClient.getWindowHandles();

            // FRAME MANAGEMENT (2 tools)
            case "switch_to_frame":
                return this.seleniumClient.switchToFrame(args.frameReference);
            case "switch_to_default_content":
                return this.seleniumClient.switchToDefaultContent();

            // WAIT CONDITIONS (4 tools)
            case "wait_for_element":
                return this.seleniumClient.waitForElement(args.by, args.value, args.timeout);
            case "wait_for_element_visible":
                return this.seleniumClient.waitForElementVisible(args.by, args.value, args.timeout);
            case "wait_for_element_clickable":
                return this.seleniumClient.waitForElementClickable(args.by, args.value, args.timeout);
            case "wait_for_text_present":
                return this.seleniumClient.waitForTextPresent(args.by, args.value, args.text, args.timeout);

            // AI-OPTIMIZED DISCOVERY TOOLS (5 tools)
            case "get_all_links":
                return this.seleniumClient.getAllLinks();
            case "get_all_forms":
                return this.seleniumClient.getAllForms();
            case "get_all_buttons":
                return this.seleniumClient.getAllButtons();
            case "get_page_summary":
                return this.seleniumClient.getPageSummary();
            case "validate_selectors":
                return this.seleniumClient.validateSelectors(args.selectors);

            default:
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Selenium MCP Server running on stdio");
    }
}

const server = new OptimizedSeleniumMCPServer();
server.run().catch(console.error);