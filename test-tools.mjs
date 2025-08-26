// Test script para verificar que las herramientas funcionan
// Ejecutar con: node test-tools.mjs

import { liveUrlAuditTool } from './dist/tools/liveUrlAudit.js';
import { eslintConfigTool } from './dist/tools/eslintConfig.js';

console.log('🧪 Testing MCP WCAG Tools...\n');

// Test 1: ESLint Config
console.log('1️⃣ Testing eslint_config tool...');
try {
  const eslintResult = await eslintConfigTool.handler({
    framework: 'react',
    level: 'recommended',
    typescript: true,
    prettier: true,
    outputFormat: 'json'
  });
  console.log('✅ eslint_config works!\n');
} catch (error) {
  console.error('❌ eslint_config failed:', error.message, '\n');
}

// Test 2: Live URL Audit (con URL simple)
console.log('2️⃣ Testing live_url_audit tool...');
try {
  const auditResult = await liveUrlAuditTool.handler({
    url: 'https://www.example.com',
    level: 'AA',
    includeMetrics: true,
    checkMobile: false,
    depth: 1
  });
  console.log('✅ live_url_audit works!\n');
} catch (error) {
  console.error('❌ live_url_audit failed:', error.message, '\n');
}

console.log('🎉 Test complete!');
console.log('If both tools show ✅, the fix worked correctly.');
console.log('\n📝 Note: Restart Claude Desktop to use the fixed version.');
