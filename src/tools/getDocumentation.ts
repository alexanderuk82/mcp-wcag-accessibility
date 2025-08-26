import { wcagRules } from '../rules/wcagRules.js';

export const getDocumentationTool = {
  definition: {
    name: 'get_documentation',
    description: 'Get WCAG documentation for specific rules or guidelines',
    inputSchema: {
      type: 'object',
      properties: {
        ruleId: {
          type: 'string',
          description: 'WCAG rule ID (e.g., "1.1.1", "color-contrast", "aria-label")',
        },
        search: {
          type: 'string',
          description: 'Search term for finding relevant WCAG guidelines',
        },
        category: {
          type: 'string',
          enum: ['perceivable', 'operable', 'understandable', 'robust'],
          description: 'WCAG principle category',
        },
      },
    },
  },
  
  handler: async (args: any) => {
    const { ruleId, search, category } = args;
    
    try {
      let documentation = '';
      
      if (ruleId) {
        // Get specific rule documentation
        const rule = wcagRules.getRule(ruleId);
        if (rule) {
          documentation = `
📚 **WCAG Rule Documentation**

🔖 **Rule ID:** ${rule.id}
📌 **Name:** ${rule.name}
🎯 **Level:** ${rule.level}
📂 **Category:** ${rule.category}

📝 **Description:**
${rule.description}

✅ **Success Criteria:**
${rule.successCriteria}

🔧 **How to Fix:**
${rule.howToFix}

💡 **Examples:**

**❌ Incorrect:**
\`\`\`html
${rule.incorrectExample}
\`\`\`

**✅ Correct:**
\`\`\`html
${rule.correctExample}
\`\`\`

🔍 **Testing:**
${rule.testingMethod}

📖 **Resources:**
- [WCAG ${rule.wcagVersion} - ${rule.id}](${rule.wcagUrl})
- [Understanding ${rule.id}](${rule.understandingUrl})
- [Techniques for ${rule.id}](${rule.techniquesUrl})

🏷️ **Tags:** ${rule.tags.join(', ')}
`;
        } else {
          documentation = `❌ No documentation found for rule ID: ${ruleId}`;
        }
      } else if (search) {
        // Search for relevant rules
        const results = wcagRules.search(search);
        documentation = `
🔍 **Search Results for: "${search}"**

Found ${results.length} matching rules:

${results.map((rule: any) => `
📌 **${rule.id}: ${rule.name}**
- Level: ${rule.level}
- Category: ${rule.category}
- Description: ${rule.description.substring(0, 150)}...
- Use \`get_documentation\` with ruleId="${rule.id}" for full details
`).join('\n')}
`;
      } else if (category) {
        // Get rules by category
        const rules = wcagRules.getByCategory(category);
        documentation = `
📂 **WCAG Category: ${category.charAt(0).toUpperCase() + category.slice(1)}**

${rules.map((rule: any) => `
- **${rule.id}** (Level ${rule.level}): ${rule.name}
`).join('\n')}

💡 Use \`get_documentation\` with a specific ruleId for detailed information.
`;
      } else {
        // General WCAG overview
        documentation = `
📚 **WCAG 2.1 Overview**

**Four Main Principles:**

1️⃣ **Perceivable**
   - Users must be able to perceive the information
   - Includes: text alternatives, captions, contrast, etc.

2️⃣ **Operable**
   - Interface must be operable
   - Includes: keyboard accessible, seizure prevention, navigation, etc.

3️⃣ **Understandable**
   - Information and UI must be understandable
   - Includes: readable text, predictable functionality, input assistance

4️⃣ **Robust**
   - Content must be robust enough for various assistive technologies
   - Includes: parsing, name/role/value

**Conformance Levels:**
- **A**: Minimum level
- **AA**: Recommended target (legal requirement in many regions)
- **AAA**: Enhanced level (not required for entire sites)

**Quick Commands:**
- Get specific rule: \`get_documentation\` with ruleId
- Search rules: \`get_documentation\` with search term
- Category rules: \`get_documentation\` with category

**Common Rule IDs:**
- 1.1.1: Non-text Content (alt text)
- 1.4.3: Contrast (Minimum)
- 2.1.1: Keyboard accessible
- 2.4.6: Headings and Labels
- 3.3.2: Labels or Instructions
- 4.1.2: Name, Role, Value

📖 **Official Resources:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Understanding WCAG](https://www.w3.org/WAI/WCAG21/Understanding/)
- [WCAG Techniques](https://www.w3.org/WAI/WCAG21/Techniques/)
`;
      }
      
      return {
        content: [
          {
            type: 'text',
            text: documentation,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting documentation: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
};
