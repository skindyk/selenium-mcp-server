#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { SeleniumClient } from "./selenium-client.js";
import { tools as allTools } from "./tools/index.js";

function getAllowedTools(): string[] | null {
    const allowed = process.env.MCP_TOOLS;
    if (!allowed) return null;
    try {
        return JSON.parse(allowed);
    } catch {
        return allowed.split(',').map(t => t.trim());
    }
}

class OptimizedSeleniumMCPServer {
    private server: Server;
    private seleniumClient: SeleniumClient | null = null;
    private tools: Tool[];

    constructor() {
        const allowedTools = getAllowedTools();
        this.tools = allowedTools
            ? allTools.filter((t: Tool) => allowedTools.includes(t.name))
            : allTools;

        this.server = new Server({
            name: "selenium-mcp-server-optimized",
            version: "2.0.0",
        });

        this.setupToolHandlers();
    }

    private setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.tools as Tool[],
            };
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
                    throw new Error(`Unknown tool: ${name}`);
                }

                const result = await this.executeToolMethod(name, args || {});

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }

    private async executeToolMethod(toolName: string, args: any): Promise<any> {
        if (!this.seleniumClient) {
            throw new Error("Selenium client not initialized");
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
            case "get_page_source":
                return this.seleniumClient.getPageSource();
            case "get_title":
                return this.seleniumClient.getTitle();
            case "find_element":
                return this.seleniumClient.findElement(args.by, args.value, args.timeout);
            case "find_elements":
                return this.seleniumClient.findElements(args.by, args.value, args.timeout);
            case "take_screenshot":
                return this.seleniumClient.takeScreenshot(args.outputPath);
            case "execute_script":
                return this.seleniumClient.executeScript(args.script, args.args);

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
                throw new Error(`Unknown tool: ${toolName}`);
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