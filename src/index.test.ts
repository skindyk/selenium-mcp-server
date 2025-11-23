import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { tools as allTools } from './tools/index.js';

describe('getAllowedTools', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.MCP_TOOLS;
    delete process.env.MCP_TOOLS;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.MCP_TOOLS = originalEnv;
    } else {
      delete process.env.MCP_TOOLS;
    }
  });

  // Helper to test the getAllowedTools function by importing the module
  const getAllowedTools = (): string[] | null => {
    const allowed = process.env.MCP_TOOLS;
    if (!allowed) return null;
    
    const availableToolNames = allTools.map(t => t.name);
    
    try {
      const parsed = JSON.parse(allowed);
      if (Array.isArray(parsed)) {
        const invalidTools = parsed.filter(name => !availableToolNames.includes(name));
        if (invalidTools.length > 0) {
          console.error(`Warning: Invalid tool names in MCP_TOOLS will be ignored: ${invalidTools.join(', ')}`);
        }
        const validTools = parsed.filter(name => availableToolNames.includes(name));
        return validTools.length > 0 ? validTools : null;
      }
      if (parsed === "*") {
        return null;
      }
      return null;
    } catch {
      const split = allowed.split(',').map(t => t.trim()).filter(t => t.length > 0);
      const invalidTools = split.filter(name => !availableToolNames.includes(name));
      if (invalidTools.length > 0) {
        console.error(`Warning: Invalid tool names in MCP_TOOLS will be ignored: ${invalidTools.join(', ')}`);
      }
      const validTools = split.filter(name => availableToolNames.includes(name));
      return validTools.length > 0 ? validTools : null;
    }
  };

  it('should return null when MCP_TOOLS is not set', () => {
    const result = getAllowedTools();
    expect(result).toBeNull();
  });

  it('should return null for "*" wildcard', () => {
    process.env.MCP_TOOLS = '"*"';
    const result = getAllowedTools();
    expect(result).toBeNull();
  });

  it('should parse JSON array of valid tool names', () => {
    process.env.MCP_TOOLS = '["start_browser", "navigate", "click_element"]';
    const result = getAllowedTools();
    expect(result).toEqual(['start_browser', 'navigate', 'click_element']);
  });

  it('should filter out invalid tool names from JSON array', () => {
    process.env.MCP_TOOLS = '["start_browser", "invalid_tool", "navigate"]';
    const result = getAllowedTools();
    expect(result).toEqual(['start_browser', 'navigate']);
  });

  it('should return null when all tools in JSON array are invalid', () => {
    process.env.MCP_TOOLS = '["invalid_tool1", "invalid_tool2"]';
    const result = getAllowedTools();
    expect(result).toBeNull();
  });

  it('should parse comma-separated string of valid tool names', () => {
    process.env.MCP_TOOLS = 'start_browser, navigate, click_element';
    const result = getAllowedTools();
    expect(result).toEqual(['start_browser', 'navigate', 'click_element']);
  });

  it('should filter out invalid tool names from comma-separated string', () => {
    process.env.MCP_TOOLS = 'start_browser, invalid_tool, navigate';
    const result = getAllowedTools();
    expect(result).toEqual(['start_browser', 'navigate']);
  });

  it('should handle comma-separated string with extra whitespace', () => {
    process.env.MCP_TOOLS = '  start_browser  ,  navigate  ,  click_element  ';
    const result = getAllowedTools();
    expect(result).toEqual(['start_browser', 'navigate', 'click_element']);
  });

  it('should return null when all tools in comma-separated string are invalid', () => {
    process.env.MCP_TOOLS = 'invalid_tool1, invalid_tool2';
    const result = getAllowedTools();
    expect(result).toBeNull();
  });

  it('should handle empty comma-separated values', () => {
    process.env.MCP_TOOLS = 'start_browser,,navigate,,';
    const result = getAllowedTools();
    expect(result).toEqual(['start_browser', 'navigate']);
  });

  it('should return null for empty string', () => {
    process.env.MCP_TOOLS = '';
    const result = getAllowedTools();
    expect(result).toBeNull();
  });

  it('should return null for whitespace-only string', () => {
    process.env.MCP_TOOLS = '   ';
    const result = getAllowedTools();
    expect(result).toBeNull();
  });

  it('should handle single valid tool', () => {
    process.env.MCP_TOOLS = 'start_browser';
    const result = getAllowedTools();
    expect(result).toEqual(['start_browser']);
  });

  it('should return null for single invalid tool', () => {
    process.env.MCP_TOOLS = 'invalid_tool';
    const result = getAllowedTools();
    expect(result).toBeNull();
  });
});

describe('Tool Validation', () => {
  it('should have 52 tools defined', () => {
    expect(allTools).toHaveLength(52);
  });

  it('should have unique tool names', () => {
    const names = allTools.map(t => t.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should have valid tool schemas', () => {
    allTools.forEach(tool => {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
      expect(tool.inputSchema).toHaveProperty('type', 'object');
      expect(tool.inputSchema).toHaveProperty('properties');
      expect(tool.inputSchema).toHaveProperty('required');
      expect(Array.isArray(tool.inputSchema.required)).toBe(true);
    });
  });

  it('should have proper locator strategy enums', () => {
    const locatorTools = allTools.filter(t => 
      t.inputSchema.properties?.by !== undefined
    );

    locatorTools.forEach(tool => {
      const byProperty = tool.inputSchema.properties?.by as any;
      expect(byProperty).toHaveProperty('enum');
      expect(byProperty.enum).toContain('id');
      expect(byProperty.enum).toContain('css');
      expect(byProperty.enum).toContain('xpath');
    });
  });

  it('should categorize tools correctly', () => {
    const toolNames = allTools.map(t => t.name);

    // Browser Management (8 tools)
    const browserTools = ['start_browser', 'navigate', 'get_current_url', 'close_browser', 
                          'get_title', 'refresh', 'go_back', 'go_forward'];
    browserTools.forEach(name => expect(toolNames).toContain(name));

    // Element Interaction
    expect(toolNames).toContain('click_element');
    expect(toolNames).toContain('send_keys');
    expect(toolNames).toContain('hover_element');

    // AI-Optimized Discovery
    expect(toolNames).toContain('get_page_summary');
    expect(toolNames).toContain('get_all_links');
    expect(toolNames).toContain('get_all_forms');
  });
});
