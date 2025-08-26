import { WCAGAnalyzer } from '../core/WCAGAnalyzer.js';

export const analyzeAccessibilityTool = {
  definition: {
    name: 'analyze_accessibility',
    description: 'Analyze HTML/React code for WCAG accessibility issues',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'HTML or React code to analyze',
        },
        level: {
          type: 'string',
          enum: ['A', 'AA', 'AAA'],
          description: 'WCAG compliance level to check',
          default: 'AA',
        },
        format: {
          type: 'string',
          enum: ['html', 'react', 'vue', 'angular'],
          description: 'Code format',
          default: 'html',
        },
      },
      required: ['code'],
    },
  },
  
  handler: async (args: any) => {
    const { code, level = 'AA', format = 'html' } = args;
    
    try {
      const analyzer = new WCAGAnalyzer();
      const results = await analyzer.analyze(code, { level, format });
      
      // Formatear resultados
      const issues = results.violations.map((violation: any) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.length,
      }));
      
      const summary = `
🔍 **Accessibility Analysis Results**

📊 **Summary:**
- Total Issues: ${results.violations.length}
- Critical: ${results.violations.filter((v: any) => v.impact === 'critical').length}
- Serious: ${results.violations.filter((v: any) => v.impact === 'serious').length}
- Moderate: ${results.violations.filter((v: any) => v.impact === 'moderate').length}
- Minor: ${results.violations.filter((v: any) => v.impact === 'minor').length}

📋 **Issues Found:**
${issues.map((issue: any) => `
**${issue.id}** (${issue.impact})
- ${issue.description}
- Fix: ${issue.help}
- Affected elements: ${issue.nodes}
- More info: ${issue.helpUrl}
`).join('\n')}

✅ **Recommendation:** ${results.violations.length === 0 ? 'Code is WCAG compliant!' : 'Fix the issues above to improve accessibility.'}
      `;
      
      return {
        content: [
          {
            type: 'text',
            text: summary,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
};
