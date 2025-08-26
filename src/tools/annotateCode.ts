import { WCAGAnalyzer } from '../core/WCAGAnalyzer.js';

export const annotateCodeTool = {
  definition: {
    name: 'annotate_code',
    description: 'Add inline WCAG issue comments to code for better developer experience',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Code to annotate with WCAG issues',
        },
        format: {
          type: 'string',
          enum: ['html', 'react', 'vue', 'angular'],
          description: 'Code format',
          default: 'html',
        },
        style: {
          type: 'string',
          enum: ['comments', 'hover', 'inline', 'vscode'],
          description: 'Annotation style',
          default: 'comments',
        },
        severity: {
          type: 'boolean',
          description: 'Include severity indicators',
          default: true,
        },
      },
      required: ['code'],
    },
  },
  
  handler: async (args: any) => {
    const { code, format = 'html', style = 'comments', severity = true } = args;
    
    try {
      const analyzer = new WCAGAnalyzer();
      const results = await analyzer.analyze(code, { level: 'AA', format });
      
      // Split code into lines for annotation
      const lines = code.split('\n');
      const annotations: Map<number, string[]> = new Map();
      
      // Process each violation
      results.violations.forEach((violation: any) => {
        violation.nodes.forEach((node: any) => {
          const html = node.html;
          
          // Find line number where this HTML appears
          lines.forEach((line: string, index: number) => {
            if (line.includes(html) || (html && line.includes(html.split('>')[0]))) {
              if (!annotations.has(index)) {
                annotations.set(index, []);
              }
              
              const severityIcon = severity ? getSeverityIcon(violation.impact) : '';
              const comment = formatComment(violation, style, severityIcon);
              annotations.get(index)?.push(comment);
            }
          });
        });
      });
      
      // Build annotated code
      let annotatedCode = '';
      const lineNumbers: string[] = [];
      
      lines.forEach((line: string, index: number) => {
        const lineNum = (index + 1).toString().padStart(3, ' ');
        lineNumbers.push(lineNum);
        
        // Add annotations before the line
        if (annotations.has(index)) {
          const comments = annotations.get(index)!;
          
          if (style === 'comments') {
            comments.forEach(comment => {
              annotatedCode += `${getIndentation(line)}${comment}\n`;
            });
          } else if (style === 'inline') {
            const inlineComment = comments.join(' | ');
            line = `${line} ${inlineComment}`;
          }
        }
        
        annotatedCode += line;
        
        if (style === 'hover' && annotations.has(index)) {
          const hoverText = annotations.get(index)!.join('\\n');
          annotatedCode += ` <!-- WCAG: ${hoverText} -->`;
        }
        
        if (index < lines.length - 1) {
          annotatedCode += '\n';
        }
      });
      
      // Generate summary
      const summary = generateAnnotationSummary(results, annotations);
      
      // VSCode problem matcher format
      let vsCodeProblems = '';
      if (style === 'vscode') {
        vsCodeProblems = generateVSCodeProblems(results, code);
      }
      
      const response = `
📝 **Code Annotated with WCAG Issues**

📊 **Summary:**
${summary}

📋 **Annotated Code:**
\`\`\`${format}
${annotatedCode}
\`\`\`

${vsCodeProblems}

💡 **Legend:**
${severity ? `
🔴 Critical - Must fix immediately
🟠 Serious - Should fix soon  
🟡 Moderate - Consider fixing
🟢 Minor - Nice to fix
` : ''}

**Annotation Styles:**
- \`comments\` - Full comments above lines
- \`inline\` - Short comments at end of lines
- \`hover\` - Hidden comments for IDE hover
- \`vscode\` - VSCode problem matcher format

✅ **Next Steps:**
1. Fix critical issues first (🔴)
2. Address serious issues (🟠)
3. Review moderate issues (🟡)
4. Consider minor improvements (🟢)
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
            text: `Error annotating code: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
};

function getSeverityIcon(impact: string): string {
  switch (impact) {
    case 'critical': return '🔴';
    case 'serious': return '🟠';
    case 'moderate': return '🟡';
    case 'minor': return '🟢';
    default: return '⚪';
  }
}

function formatComment(violation: any, style: string, icon: string): string {
  const base = `${icon} WCAG ${violation.id}: ${violation.help}`;
  
  switch (style) {
    case 'comments':
      return `// ${base}\n// Fix: ${violation.description}`;
    case 'inline':
      return `// ${icon} ${violation.id}`;
    case 'hover':
      return base;
    case 'vscode':
      return `${base} [${violation.impact}]`;
    default:
      return `// ${base}`;
  }
}

function getIndentation(line: string): string {
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

function generateAnnotationSummary(results: any, annotations: Map<number, string[]>): string {
  const totalIssues = results.violations.reduce((sum: number, v: any) => sum + v.nodes.length, 0);
  const annotatedLines = annotations.size;
  
  return `
- Total Issues Found: ${totalIssues}
- Lines with Issues: ${annotatedLines}
- Critical: ${results.violations.filter((v: any) => v.impact === 'critical').length}
- Serious: ${results.violations.filter((v: any) => v.impact === 'serious').length}
- Moderate: ${results.violations.filter((v: any) => v.impact === 'moderate').length}
- Minor: ${results.violations.filter((v: any) => v.impact === 'minor').length}
`;
}

function generateVSCodeProblems(results: any, code: string): string {
  if (results.violations.length === 0) return '';
  
  let problems = '\n🔧 **VSCode Problems Format:**\n```\n';
  
  results.violations.forEach((violation: any) => {
    violation.nodes.forEach((node: any) => {
      const line = findLineNumber(code, node.html) + 1;
      problems += `file.html:${line}:1: ${violation.impact} - ${violation.id}: ${violation.help}\n`;
    });
  });
  
  problems += '```';
  return problems;
}

function findLineNumber(code: string, html: string): number {
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(html) || (html && lines[i].includes(html.split('>')[0]))) {
      return i;
    }
  }
  return 0;
}
