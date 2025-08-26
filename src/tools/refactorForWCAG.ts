import { WCAGAnalyzer } from '../core/WCAGAnalyzer.js';
import { AccessibilityFixer } from '../core/AccessibilityFixer.js';

export const refactorForWCAGTool = {
  definition: {
    name: 'refactor_for_wcag',
    description: 'Automatically refactor code to be WCAG compliant',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'HTML or React code to refactor',
        },
        level: {
          type: 'string',
          enum: ['A', 'AA', 'AAA'],
          description: 'Target WCAG compliance level',
          default: 'AA',
        },
        format: {
          type: 'string',
          enum: ['html', 'react', 'vue', 'angular'],
          description: 'Code format',
          default: 'html',
        },
        autoFix: {
          type: 'boolean',
          description: 'Automatically apply all possible fixes',
          default: true,
        },
      },
      required: ['code'],
    },
  },
  
  handler: async (args: any) => {
    const { code, level = 'AA', format = 'html', autoFix = true } = args;
    
    try {
      const analyzer = new WCAGAnalyzer();
      const fixer = new AccessibilityFixer();
      
      // Analizar código
      const analysis = await analyzer.analyze(code, { level, format });
      
      // Aplicar fixes
      const fixedCode = await fixer.fix(code, analysis.violations, {
        level,
        format,
        autoFix,
      });
      
      // Analizar código arreglado
      const reAnalysis = await analyzer.analyze(fixedCode, { level, format });
      
      const response = `
🔧 **WCAG Refactoring Complete**

📊 **Changes Applied:**
- Fixed Issues: ${analysis.violations.length - reAnalysis.violations.length}
- Remaining Issues: ${reAnalysis.violations.length}
- Compliance Level: ${level}

📝 **Refactored Code:**
\`\`\`${format}
${fixedCode}
\`\`\`

✅ **Fixes Applied:**
${analysis.violations
  .filter((v: any) => !reAnalysis.violations.find((rv: any) => rv.id === v.id))
  .map((v: any) => `- ✓ ${v.id}: ${v.description}`)
  .join('\n')}

⚠️ **Manual Review Needed:**
${reAnalysis.violations
  .map((v: any) => `- ${v.id}: ${v.description} (requires manual fix)`)
  .join('\n') || 'None - All issues were fixed automatically!'}

💡 **Next Steps:**
${reAnalysis.violations.length > 0 
  ? '1. Review the remaining issues\n2. Apply manual fixes where needed\n3. Re-run validation' 
  : 'Your code is now WCAG ' + level + ' compliant! 🎉'}
      `;
      
      return {
        content: [
          {
            type: 'text',
            text: response,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error refactoring code: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
};
