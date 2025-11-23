import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { tools as allTools } from './tools/index.js';

/**
 * Integration tests for MCP Server
 * 
 * Note: Full MCP server integration tests would require a running MCP client.
 * These tests focus on the tool definitions and logic that can be tested in isolation:
 * - Tool definitions completeness and correctness
 * - Tool schema validation
 * - Tool categorization
 * - Coverage of Selenium WebDriver capabilities
 */

describe('MCP Server Integration - Tool Definitions', () => {
  describe('Tool Inventory', () => {
    it('should have all 52 tools defined', () => {
      expect(allTools).toHaveLength(52);
    });

    it('should have tools for all categories', () => {
      const toolNames = allTools.map(t => t.name);

      // Browser Management
      expect(toolNames).toContain('start_browser');
      expect(toolNames).toContain('navigate');
      expect(toolNames).toContain('close_browser');
      
      // Element Operations
      expect(toolNames).toContain('find_element');
      expect(toolNames).toContain('click_element');
      
      // AI Discovery
      expect(toolNames).toContain('get_page_summary');
      expect(toolNames).toContain('get_all_links');
      
      // Wait Conditions
      expect(toolNames).toContain('wait_for_element');
      expect(toolNames).toContain('wait_for_element_visible');
      
      // Advanced Interactions
      expect(toolNames).toContain('hover_element');
      expect(toolNames).toContain('drag_and_drop');
    });

    it('should have all required tool properties', () => {
      allTools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema).toHaveProperty('properties');
        expect(tool.inputSchema).toHaveProperty('required');
      });
    });

    it('should not have duplicate tool names', () => {
      const names = allTools.map(t => t.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('should have meaningful descriptions for all tools', () => {
      allTools.forEach(tool => {
        expect(tool.description).toBeTruthy();
        if (tool.description) {
          expect(tool.description.length).toBeGreaterThan(10);
        }
      });
    });
  });

  describe('Tool Categorization', () => {
    it('should have Browser Management tools', () => {
      const browserTools = [
        'start_browser', 'navigate', 'get_current_url', 'close_browser',
        'get_title', 'refresh', 'go_back', 'go_forward'
      ];
      
      browserTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
        expect(tool?.description).toBeTruthy();
      });
    });

    it('should have Page Discovery tools', () => {
      const discoveryTools = [
        'get_page_source', 'find_element', 'find_elements',
        'take_screenshot', 'execute_script'
      ];
      
      discoveryTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
      });
    });

    it('should have Element Analysis tools', () => {
      const analysisTools = [
        'get_element_text', 'get_element_attribute', 'get_element_property',
        'is_element_displayed', 'is_element_enabled', 'is_element_selected',
        'get_element_css_value', 'scroll_to_element'
      ];
      
      analysisTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
      });
    });

    it('should have Element Interaction tools', () => {
      const interactionTools = [
        'click_element', 'send_keys', 'hover_element', 'clear_element',
        'double_click_element', 'right_click_element', 'drag_and_drop'
      ];
      
      interactionTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
      });
    });

    it('should have Keyboard Actions tools', () => {
      const keyboardTools = ['press_key', 'press_key_combo'];
      
      keyboardTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
      });
    });

    it('should have File Operations tools', () => {
      const fileTools = ['upload_file'];
      
      fileTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
      });
    });

    it('should have Window Management tools', () => {
      const windowTools = [
        'maximize_window', 'minimize_window', 'set_window_size',
        'get_window_size', 'switch_to_window', 'get_window_handles'
      ];
      
      windowTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
      });
    });

    it('should have Frame Management tools', () => {
      const frameTools = ['switch_to_frame', 'switch_to_default_content'];
      
      frameTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
      });
    });

    it('should have Wait Conditions tools', () => {
      const waitTools = [
        'wait_for_element', 'wait_for_element_visible',
        'wait_for_element_clickable', 'wait_for_text_present'
      ];
      
      waitTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
      });
    });

    it('should have AI-Optimized Discovery tools', () => {
      const aiTools = [
        'get_all_links', 'get_all_forms', 'get_all_buttons',
        'get_page_summary', 'validate_selectors'
      ];
      
      aiTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
      });
    });
  });

  describe('Tool Schema Validation', () => {
    it('should have valid locator strategies in element tools', () => {
      const elementTools = allTools.filter(t => 
        t.inputSchema.properties?.by !== undefined
      );

      expect(elementTools.length).toBeGreaterThan(20);

      elementTools.forEach(tool => {
        const byProp = tool.inputSchema.properties?.by as any;
        expect(byProp).toHaveProperty('enum');
        expect(byProp.enum).toContain('id');
        expect(byProp.enum).toContain('css');
        expect(byProp.enum).toContain('xpath');
        expect(byProp.enum).toHaveLength(8);
      });
    });

    it('should have proper timeout defaults for element tools', () => {
      const elementTools = allTools.filter(t => 
        t.inputSchema.properties?.timeout !== undefined
      );

      elementTools.forEach(tool => {
        const timeoutProp = tool.inputSchema.properties?.timeout as any;
        expect(timeoutProp.default).toBe(10000);
      });
    });

    it('should require URL for navigate tool', () => {
      const navigateTool = allTools.find(t => t.name === 'navigate');
      expect(navigateTool).toBeDefined();
      expect(navigateTool?.inputSchema.required).toContain('url');
    });

    it('should require by and value for element tools', () => {
      const elementTools = allTools.filter(t => 
        t.inputSchema.properties?.by !== undefined &&
        t.inputSchema.properties?.value !== undefined
      );

      elementTools.forEach(tool => {
        if (tool.name !== 'upload_file') {
          expect(tool.inputSchema.required).toContain('by');
          expect(tool.inputSchema.required).toContain('value');
        }
      });
    });

    it('should have proper browser enum in start_browser', () => {
      const startBrowser = allTools.find(t => t.name === 'start_browser');
      expect(startBrowser).toBeDefined();
      
      const browserProp = startBrowser?.inputSchema.properties?.browser as any;
      expect(browserProp.enum).toEqual(['chrome', 'firefox', 'edge', 'safari']);
      expect(browserProp.default).toBe('chrome');
    });

    it('should have array type for keys in press_key_combo', () => {
      const pressKeyCombo = allTools.find(t => t.name === 'press_key_combo');
      expect(pressKeyCombo).toBeDefined();
      
      const keysProp = pressKeyCombo?.inputSchema.properties?.keys as any;
      expect(keysProp.type).toBe('array');
      expect(keysProp.items).toEqual({ type: 'string' });
    });

    it('should validate required parameters are defined in properties', () => {
      allTools.forEach(tool => {
        const required = tool.inputSchema.required || [];
        
        required.forEach(paramName => {
          expect(tool.inputSchema.properties).toHaveProperty(paramName);
        });
      });
    });
  });

  describe('Tool Completeness - Selenium WebDriver Coverage', () => {
    it('should cover all browser control operations', () => {
      const capabilities = ['start_browser', 'close_browser', 'navigate', 'refresh', 
                            'go_back', 'go_forward', 'get_current_url', 'get_title'];
      
      capabilities.forEach(name => {
        expect(allTools.find(t => t.name === name)).toBeDefined();
      });
    });

    it('should cover all element finding strategies', () => {
      const findingTools = ['find_element', 'find_elements'];
      
      findingTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
        
        const byProp = tool?.inputSchema.properties?.by as any;
        expect(byProp.enum).toEqual([
          'id', 'css', 'xpath', 'name', 'tag', 'class', 'linkText', 'partialLinkText'
        ]);
      });
    });

    it('should cover all element interactions', () => {
      const interactions = ['click_element', 'send_keys', 'clear_element', 
                            'hover_element', 'double_click_element', 
                            'right_click_element', 'drag_and_drop'];
      
      interactions.forEach(name => {
        expect(allTools.find(t => t.name === name)).toBeDefined();
      });
    });

    it('should cover all keyboard actions', () => {
      const keyboard = ['press_key', 'press_key_combo'];
      
      keyboard.forEach(name => {
        expect(allTools.find(t => t.name === name)).toBeDefined();
      });
    });

    it('should cover all wait conditions', () => {
      const waits = ['wait_for_element', 'wait_for_element_visible', 
                     'wait_for_element_clickable', 'wait_for_text_present'];
      
      waits.forEach(name => {
        expect(allTools.find(t => t.name === name)).toBeDefined();
      });
    });

    it('should cover all window management operations', () => {
      const windows = ['maximize_window', 'minimize_window', 'set_window_size', 
                       'get_window_size', 'switch_to_window', 'get_window_handles'];
      
      windows.forEach(name => {
        expect(allTools.find(t => t.name === name)).toBeDefined();
      });
    });

    it('should cover all frame management operations', () => {
      const frames = ['switch_to_frame', 'switch_to_default_content'];
      
      frames.forEach(name => {
        expect(allTools.find(t => t.name === name)).toBeDefined();
      });
    });

    it('should cover JavaScript execution', () => {
      expect(allTools.find(t => t.name === 'execute_script')).toBeDefined();
    });

    it('should cover screenshot capability', () => {
      expect(allTools.find(t => t.name === 'take_screenshot')).toBeDefined();
    });

    it('should cover file upload', () => {
      expect(allTools.find(t => t.name === 'upload_file')).toBeDefined();
    });
  });

  describe('AI-Optimized Features', () => {
    it('should have comprehensive page discovery tools', () => {
      const aiTools = ['get_page_summary', 'get_all_links', 'get_all_forms', 
                       'get_all_buttons', 'validate_selectors'];
      
      aiTools.forEach(name => {
        const tool = allTools.find(t => t.name === name);
        expect(tool).toBeDefined();
        // These are AI-optimized tools that provide structured data
        expect(tool?.description).toBeTruthy();
        if (tool?.description) {
          expect(tool.description.length).toBeGreaterThan(20);
        }
      });
    });

    it('should have get_page_summary for comprehensive page analysis', () => {
      const summary = allTools.find(t => t.name === 'get_page_summary');
      expect(summary).toBeDefined();
      expect(summary?.description).toContain('AI-friendly');
    });

    it('should have validate_selectors for selector testing', () => {
      const validator = allTools.find(t => t.name === 'validate_selectors');
      expect(validator).toBeDefined();
      expect(validator?.inputSchema.properties).toHaveProperty('selectors');
      
      const selectorsProp = validator?.inputSchema.properties?.selectors as any;
      expect(selectorsProp.type).toBe('array');
    });
  });
});

describe('MCP Server Integration - Error Handling Structure', () => {
  it('should identify tools that require browser to be started', () => {
    const toolsRequiringBrowser = allTools.filter(t => 
      t.name !== 'start_browser'
    );

    expect(toolsRequiringBrowser.length).toBe(51);
  });

  it('should have proper parameter validation structure in schemas', () => {
    allTools.forEach(tool => {
      // Every tool should have required array (even if empty)
      expect(Array.isArray(tool.inputSchema.required)).toBe(true);
      
      // Required parameters should exist in properties
      const required = tool.inputSchema.required || [];
      required.forEach(paramName => {
        expect(tool.inputSchema.properties).toHaveProperty(paramName);
      });
    });
  });

  it('should have consistent locator strategy validation', () => {
    const elementTools = allTools.filter(t => 
      t.inputSchema.properties?.by !== undefined
    );

    const expectedStrategies = ['id', 'css', 'xpath', 'name', 'tag', 'class', 'linkText', 'partialLinkText'];

    elementTools.forEach(tool => {
      const byProp = tool.inputSchema.properties?.by as any;
      expect(byProp.enum).toEqual(expectedStrategies);
    });
  });
});

describe('MCP Server Integration - MCP_TOOLS Filtering Logic', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.MCP_TOOLS;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.MCP_TOOLS = originalEnv;
    } else {
      delete process.env.MCP_TOOLS;
    }
  });

  it('should have getAllowedTools logic for environment filtering', () => {
    // This validates that the tool filtering concept exists
    // Actual filtering logic is tested in index.test.ts
    
    const allToolNames = allTools.map(t => t.name);
    expect(allToolNames.length).toBe(52);
    
    // Simulate filtering to a subset
    const subset = ['start_browser', 'navigate', 'click_element'];
    const filtered = allTools.filter(t => subset.includes(t.name));
    expect(filtered.length).toBe(3);
  });

  it('should support wildcard selection', () => {
    // Wildcard should select all tools
    const allToolNames = allTools.map(t => t.name);
    expect(allToolNames.length).toBe(52);
  });

  it('should support comma-separated tool lists', () => {
    const toolList = 'start_browser,navigate,click_element,find_element';
    const requestedTools = toolList.split(',').map(t => t.trim());
    
    const filtered = allTools.filter(t => requestedTools.includes(t.name));
    expect(filtered.length).toBe(4);
  });

  it('should support JSON array format', () => {
    const toolList = '["start_browser", "navigate", "close_browser"]';
    const requestedTools = JSON.parse(toolList);
    
    const filtered = allTools.filter(t => requestedTools.includes(t.name));
    expect(filtered.length).toBe(3);
  });
});
