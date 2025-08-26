import { WCAGAnalyzer } from '../core/WCAGAnalyzer.js';

export const validateComplianceTool = {
  definition: {
    name: 'validate_compliance',
    description: 'Validate if code meets WCAG compliance requirements',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'HTML or React code to validate',
        },
        level: {
          type: 'string',
          enum: ['A', 'AA', 'AAA'],
          description: 'WCAG compliance level to validate against',
          default: 'AA',
        },
        format: {
          type: 'string',
          enum: ['html', 'react', 'vue', 'angular'],
          description: 'Code format',
          default: 'html',
        },
        detailed: {
          type: 'boolean',
          description: 'Show detailed report',
          default: false,
        },
      },
      required: ['code'],
    },
  },
  
  handler: async (args: any) => {
    const { code, level = 'AA', format = 'html', detailed = false } = args;
    
    try {
      const analyzer = new WCAGAnalyzer();
      const results = await analyzer.analyze(code, { level, format });
      
      const isCompliant = results.violations.length === 0;
      const complianceScore = Math.max(0, 100 - (results.violations.length * 5));
      
      let response = `
🏆 **WCAG ${level} Compliance Validation**

${isCompliant ? '✅ **PASSED**' : '❌ **FAILED**'}

📊 **Compliance Score: ${complianceScore}%**

📈 **Metrics:**
- Total Violations: ${results.violations.length}
- Passes: ${results.passes.length}
- Inapplicable Rules: ${results.inapplicable.length}
- Incomplete Checks: ${results.incomplete.length}
`;

      if (!isCompliant && detailed) {
        response += `
\n🔍 **Violations Detail:**
${results.violations.map((v: any, i: number) => `
${i + 1}. **${v.id}** [${v.impact.toUpperCase()}]
   - Description: ${v.description}
   - Elements affected: ${v.nodes.length}
   - WCAG Criteria: ${v.tags.join(', ')}
   - Solution: ${v.help}
`).join('\n')}`;
      }

      response += `
\n💡 **Recommendations:**
${isCompliant 
  ? '- Your code meets WCAG ' + level + ' standards!\n- Consider testing with real users\n- Run automated tests regularly'
  : '- Fix ' + (results.violations.filter((v: any) => v.impact === 'critical' || v.impact === 'serious').length) + ' critical/serious issues first\n- Use the refactor_for_wcag tool for automatic fixes\n- Review WCAG documentation for manual fixes'}

📋 **Compliance Certificate:**
- Standard: WCAG 2.1 Level ${level}
- Date: ${new Date().toISOString()}
- Status: ${isCompliant ? 'COMPLIANT ✅' : 'NON-COMPLIANT ❌'}
- Score: ${complianceScore}/100
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
            text: `Error validating compliance: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
};
