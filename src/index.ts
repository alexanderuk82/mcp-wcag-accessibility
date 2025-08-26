#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Importar herramientas
import { analyzeAccessibilityTool } from './tools/analyzeAccessibility.js';
import { refactorForWCAGTool } from './tools/refactorForWCAG.js';
import { validateComplianceTool } from './tools/validateCompliance.js';
import { getDocumentationTool } from './tools/getDocumentation.js';
import { annotateCodeTool } from './tools/annotateCode.js';
import { accessibilityScoreTool } from './tools/accessibilityScore.js';
import { generateComponentTool } from './tools/generateComponent.js';
import { eslintConfigTool } from './tools/eslintConfig.js';
import { liveUrlAuditTool } from './tools/liveUrlAudit.js';
import { wcagGithubSyncTool } from './tools/wcagGithubSync.js';

// Crear servidor MCP
const server = new Server(
  {
    name: 'wcag-accessibility',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Listar herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      analyzeAccessibilityTool.definition,
      refactorForWCAGTool.definition,
      validateComplianceTool.definition,
      getDocumentationTool.definition,
      annotateCodeTool.definition,
      accessibilityScoreTool.definition,
      generateComponentTool.definition,
      eslintConfigTool.definition,
      liveUrlAuditTool.definition,
      wcagGithubSyncTool.definition,
    ],
  };
});

// Manejar llamadas a herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'analyze_accessibility':
        return await analyzeAccessibilityTool.handler(args);
      
      case 'refactor_for_wcag':
        return await refactorForWCAGTool.handler(args);
      
      case 'validate_compliance':
        return await validateComplianceTool.handler(args);
      
      case 'get_documentation':
        return await getDocumentationTool.handler(args);
      
      case 'annotate_code':
        return await annotateCodeTool.handler(args);
      
      case 'accessibility_score':
        return await accessibilityScoreTool.handler(args);
      
      case 'generate_component':
        return await generateComponentTool.handler(args);
      
      case 'eslint_config':
        return await eslintConfigTool.handler(args);
      
      case 'live_url_audit':
        return await liveUrlAuditTool.handler(args);
      
      case 'wcag_github_sync':
        return await wcagGithubSyncTool.handler(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ],
    };
  }
});

// Función principal
async function main() {
  console.error('Starting MCP WCAG Accessibility Server...');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('MCP WCAG Server v3.0 - 10 tools loaded successfully!');
  console.error('Tools: analyze, refactor, validate, docs, annotate, score, generate, eslint, live-audit, github-sync');
}

// Ejecutar servidor
main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
