#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { SeleniumClient } from "./selenium-client.js";
import { tools } from "./tools/index.js";

class OptimizedSeleniumMCPServer {
    private server: Server;
    private seleniumClient: SeleniumClient | null = null;
    private tools: Tool[];

    constructor() {
        this.tools = tools;

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
            // CORE BROWSER MANAGEMENT (4 tools)
            case "start_browser":
                return this.seleniumClient.startBrowser(args.browser, args.options);
            case "navigate":
                return this.seleniumClient.navigate(args.url);
            case "get_current_url":
                return this.seleniumClient.getCurrentUrl();
            case "close_browser":
                return this.seleniumClient.closeBrowser();

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

            // BASIC INTERACTION TESTING (2 tools)
            case "click_element":
                return this.seleniumClient.clickElement(args.by, args.value, args.timeout);
            case "send_keys":
                return this.seleniumClient.sendKeys(args.by, args.value, args.text, args.timeout);

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
        console.error("AI-Optimized Selenium MCP Server running on stdio");
    }
}

const server = new OptimizedSeleniumMCPServer();
server.run().catch(console.error);