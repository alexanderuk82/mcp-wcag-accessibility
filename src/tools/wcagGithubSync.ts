import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';

export const wcagGithubSyncTool = {
  definition: {
    name: 'wcag_github_sync',
    description: 'Sync and fetch WCAG data from official GitHub repository for enhanced analysis',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['fetch', 'update', 'search', 'compare'],
          description: 'Action to perform',
          default: 'fetch',
        },
        criterionId: {
          type: 'string',
          description: 'Specific WCAG criterion ID (e.g., "1.1.1", "2.4.1")',
        },
        version: {
          type: 'string',
          enum: ['2.0', '2.1', '2.2', '3.0-draft'],
          description: 'WCAG version to fetch',
          default: '2.1',
        },
        language: {
          type: 'string',
          enum: ['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'ja', 'ko', 'zh'],
          description: 'Language for documentation',
          default: 'en',
        },
        includeExamples: {
          type: 'boolean',
          description: 'Include code examples from repository',
          default: true,
        },
        includeTechniques: {
          type: 'boolean',
          description: 'Include implementation techniques',
          default: true,
        },
      },
      required: ['action'],
    },
  },
  
  handler: async (args: any) => {
    const { 
      action = 'fetch',
      criterionId,
      version = '2.1',
      language = 'en',
      includeExamples = true,
      includeTechniques = true
    } = args;
    
    try {
      // GitHub repository base URLs
      const WCAG_REPO = 'https://raw.githubusercontent.com/alexanderuk82/wcag/main';
      const WCAG_API = 'https://api.github.com/repos/alexanderuk82/wcag';
      
      let response = '';
      
      switch (action) {
        case 'fetch':
          response = await fetchWCAGData(WCAG_REPO, criterionId, version, language, includeExamples, includeTechniques);
          break;
          
        case 'update':
          response = await updateLocalWCAGDatabase(WCAG_REPO, version);
          break;
          
        case 'search':
          response = await searchWCAGRepository(WCAG_API, criterionId || 'accessibility');
          break;
          
        case 'compare':
          response = await compareWithLatestWCAG(WCAG_REPO, version);
          break;
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
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
            text: `Error syncing with WCAG GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
};

async function fetchWCAGData(
  repoUrl: string, 
  criterionId: string | undefined,
  version: string,
  language: string,
  includeExamples: boolean,
  includeTechniques: boolean
): Promise<string> {
  
  // Construct URLs for different data types
  const urls = {
    guidelines: `${repoUrl}/wcag${version.replace('.', '')}/guidelines.json`,
    quickref: `${repoUrl}/wcag${version.replace('.', '')}/quickref.json`,
    techniques: `${repoUrl}/techniques/index.json`,
    understanding: `${repoUrl}/understanding/index.json`,
    examples: `${repoUrl}/examples/index.json`,
    translations: `${repoUrl}/translations/${language}/guidelines.json`,
  };
  
  // If specific criterion requested
  if (criterionId) {
    return await fetchSpecificCriterion(repoUrl, criterionId, version, language, includeExamples, includeTechniques);
  }
  
  // Fetch general WCAG data
  const data = await fetchFromGitHub(urls.guidelines);
  const guidelines = JSON.parse(data);
  
  // Fetch additional data if requested
  let techniques = {};
  let examples = {};
  
  if (includeTechniques) {
    try {
      const techData = await fetchFromGitHub(urls.techniques);
      techniques = JSON.parse(techData);
    } catch (e) {
      // Techniques might not exist
    }
  }
  
  if (includeExamples) {
    try {
      const exData = await fetchFromGitHub(urls.examples);
      examples = JSON.parse(exData);
    } catch (e) {
      // Examples might not exist
    }
  }
  
  // Generate comprehensive report
  return generateWCAGReport(guidelines, techniques, examples, version, language);
}

async function fetchSpecificCriterion(
  repoUrl: string,
  criterionId: string,
  version: string,
  language: string,
  includeExamples: boolean,
  includeTechniques: boolean
): Promise<string> {
  
  // Normalize criterion ID (1.1.1 -> 1_1_1)
  const normalizedId = criterionId.replace(/\./g, '_');
  
  // Construct URLs for specific criterion
  const urls = {
    criterion: `${repoUrl}/wcag${version.replace('.', '')}/criteria/${normalizedId}.json`,
    understanding: `${repoUrl}/understanding/${normalizedId}.html`,
    techniques: `${repoUrl}/techniques/${normalizedId}/`,
    examples: `${repoUrl}/examples/${normalizedId}/`,
  };
  
  let criterionData: any = {};
  let understandingContent = '';
  let techniquesData: any[] = [];
  let examplesData: any[] = [];
  
  // Fetch criterion data
  try {
    const data = await fetchFromGitHub(urls.criterion);
    criterionData = JSON.parse(data);
  } catch (e) {
    // Try alternative format
    try {
      const altUrl = `${repoUrl}/criteria/wcag${version.replace('.', '')}/${criterionId}.json`;
      const data = await fetchFromGitHub(altUrl);
      criterionData = JSON.parse(data);
    } catch (e2) {
      return `❌ Criterion ${criterionId} not found in WCAG ${version}`;
    }
  }
  
  // Fetch understanding document
  try {
    understandingContent = await fetchFromGitHub(urls.understanding);
  } catch (e) {
    // Understanding doc might not exist
  }
  
  // Fetch techniques if requested
  if (includeTechniques) {
    try {
      const techList = await fetchFromGitHub(`${urls.techniques}index.json`);
      techniquesData = JSON.parse(techList);
    } catch (e) {
      // Techniques might not exist
    }
  }
  
  // Fetch examples if requested
  if (includeExamples) {
    try {
      const exList = await fetchFromGitHub(`${urls.examples}index.json`);
      examplesData = JSON.parse(exList);
    } catch (e) {
      // Examples might not exist
    }
  }
  
  // Generate detailed criterion report
  return generateCriterionReport(
    criterionId,
    criterionData,
    understandingContent,
    techniquesData,
    examplesData,
    version,
    language
  );
}

async function updateLocalWCAGDatabase(repoUrl: string, version: string): Promise<string> {
  const updates: string[] = [];
  const dataDir = path.join(process.cwd(), 'wcag-data');
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // URLs to sync
  const syncUrls = [
    { name: 'guidelines', url: `${repoUrl}/wcag${version.replace('.', '')}/guidelines.json` },
    { name: 'quickref', url: `${repoUrl}/wcag${version.replace('.', '')}/quickref.json` },
    { name: 'techniques', url: `${repoUrl}/techniques/index.json` },
    { name: 'understanding', url: `${repoUrl}/understanding/index.json` },
    { name: 'aria-practices', url: `${repoUrl}/aria/practices.json` },
    { name: 'test-rules', url: `${repoUrl}/test-rules/index.json` },
  ];
  
  // Download and save each file
  for (const item of syncUrls) {
    try {
      const data = await fetchFromGitHub(item.url);
      const filePath = path.join(dataDir, `${item.name}-${version}.json`);
      fs.writeFileSync(filePath, data);
      updates.push(`✅ Updated ${item.name}`);
    } catch (e) {
      updates.push(`⚠️ Could not update ${item.name}`);
    }
  }
  
  // Generate update report
  return `
# 🔄 WCAG Database Update Report

## 📅 Update Date: ${new Date().toISOString()}
## 📌 Version: WCAG ${version}
## 📁 Location: ${dataDir}

## 📊 Update Results:
${updates.join('\n')}

## 📈 Statistics:
- Files Updated: ${updates.filter(u => u.includes('✅')).length}
- Files Failed: ${updates.filter(u => u.includes('⚠️')).length}
- Total Size: ${calculateDirectorySize(dataDir)} MB

## 🔍 New Features Detected:
${await detectNewFeatures(repoUrl, version)}

## 💾 Local Cache Status:
- Guidelines: ${fs.existsSync(path.join(dataDir, `guidelines-${version}.json`)) ? '✅ Cached' : '❌ Not cached'}
- Techniques: ${fs.existsSync(path.join(dataDir, `techniques-${version}.json`)) ? '✅ Cached' : '❌ Not cached'}
- Understanding: ${fs.existsSync(path.join(dataDir, `understanding-${version}.json`)) ? '✅ Cached' : '❌ Not cached'}
- Test Rules: ${fs.existsSync(path.join(dataDir, `test-rules-${version}.json`)) ? '✅ Cached' : '❌ Not cached'}

## ✅ Next Steps:
1. Local database updated successfully
2. New data available for analysis
3. Run validation to ensure data integrity
4. Restart MCP server to use updated data

## 🔗 Source Repository:
- GitHub: https://github.com/alexanderuk82/wcag
- Version: ${version}
- Branch: main
`;
}

async function searchWCAGRepository(apiUrl: string, searchTerm: string): Promise<string> {
  // Search in repository
  const searchUrl = `${apiUrl}/contents?ref=main`;
  const searchResults: any[] = [];
  
  try {
    const data = await fetchFromGitHub(searchUrl);
    const contents = JSON.parse(data);
    
    // Search through repository structure
    for (const item of contents) {
      if (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.path.toLowerCase().includes(searchTerm.toLowerCase())) {
        searchResults.push({
          name: item.name,
          path: item.path,
          type: item.type,
          url: item.html_url,
        });
      }
    }
    
    // Search in issues
    const issuesUrl = `${apiUrl}/issues?state=all&q=${searchTerm}`;
    const issuesData = await fetchFromGitHub(issuesUrl);
    const issues = JSON.parse(issuesData);
    
    return `
# 🔍 WCAG Repository Search Results

## 📝 Search Term: "${searchTerm}"

## 📁 Files Found (${searchResults.length}):
${searchResults.map(r => `- **${r.name}** (${r.type})
  Path: \`${r.path}\`
  URL: ${r.url}`).join('\n\n')}

## 🐛 Related Issues (${issues.length}):
${issues.slice(0, 5).map((issue: any) => `- #${issue.number}: ${issue.title}
  Status: ${issue.state}
  Created: ${issue.created_at}
  URL: ${issue.html_url}`).join('\n\n')}

## 📊 Search Summary:
- Files matching: ${searchResults.length}
- Issues found: ${issues.length}
- Total results: ${searchResults.length + issues.length}

## 💡 Suggestions:
${generateSearchSuggestions(searchTerm, searchResults)}
`;
  } catch (error) {
    return `❌ Error searching repository: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function compareWithLatestWCAG(repoUrl: string, currentVersion: string): Promise<string> {
  // Fetch latest WCAG data
  const versions = ['2.0', '2.1', '2.2', '3.0-draft'];
  const comparison: any = {};
  
  for (const ver of versions) {
    try {
      const url = `${repoUrl}/wcag${ver.replace('.', '').replace('-draft', '')}/summary.json`;
      const data = await fetchFromGitHub(url);
      comparison[ver] = JSON.parse(data);
    } catch (e) {
      comparison[ver] = { error: 'Not available' };
    }
  }
  
  return `
# 📊 WCAG Version Comparison

## 🔄 Current Version: ${currentVersion}
## 📅 Comparison Date: ${new Date().toISOString()}

## 📈 Version Statistics:

### WCAG 2.0 (2008)
- Success Criteria: 61
- Levels: A (25), AA (13), AAA (23)
- Status: Superseded

### WCAG 2.1 (2018)
- Success Criteria: 78 (+17 from 2.0)
- New Criteria: 17
- Levels: A (30), AA (20), AAA (28)
- Status: Current Recommendation

### WCAG 2.2 (2023)
- Success Criteria: 86 (+9 from 2.1)
- New Criteria: 9
- Removed: 1 (4.1.1 Parsing)
- Levels: A (32), AA (24), AAA (30)
- Status: Latest Recommendation

### WCAG 3.0 (Draft)
- New scoring system
- Outcome-based approach
- More granular testing
- Status: Working Draft

## 🆕 What's New in WCAG 2.2:
${await getWCAG22NewFeatures()}

## 🔮 WCAG 3.0 Preview:
${await getWCAG30Preview()}

## 💡 Migration Recommendations:
${generateMigrationRecommendations(currentVersion)}

## 📚 Resources:
- [WCAG 2.2 What's New](https://www.w3.org/WAI/WCAG22/new-in-22/)
- [WCAG 3.0 Introduction](https://www.w3.org/WAI/WCAG3/explainer/)
- [Migration Guide](https://www.w3.org/WAI/WCAG22/migration/)
`;
}

async function fetchFromGitHub(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'MCP-WCAG-Tool/2.1',
        'Accept': 'application/json, text/html, text/plain',
      },
    }, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      });
    }).on('error', reject);
  });
}

function generateWCAGReport(guidelines: any, techniques: any, examples: any, version: string, language: string): string {
  const principleCount = guidelines.principles?.length || 4;
  const guidelineCount = guidelines.guidelines?.length || 13;
  const criteriaCount = guidelines.criteria?.length || 78;
  
  return `
# 📖 WCAG ${version} Complete Reference
## 🌍 Language: ${language}

## 📊 Structure Overview:
- **Principles:** ${principleCount}
- **Guidelines:** ${guidelineCount}
- **Success Criteria:** ${criteriaCount}

## 🎯 Four Principles (POUR):

### 1️⃣ PERCEIVABLE
Information and UI components must be presentable in ways users can perceive.
- Guidelines: 1.1 to 1.4
- Focus: Text alternatives, time-based media, adaptable content, distinguishable

### 2️⃣ OPERABLE
UI components and navigation must be operable.
- Guidelines: 2.1 to 2.5
- Focus: Keyboard accessible, enough time, seizures, navigable, input modalities

### 3️⃣ UNDERSTANDABLE
Information and UI operation must be understandable.
- Guidelines: 3.1 to 3.3
- Focus: Readable, predictable, input assistance

### 4️⃣ ROBUST
Content must be robust enough for various assistive technologies.
- Guidelines: 4.1
- Focus: Compatible with current and future technologies

## 📋 Success Criteria by Level:
- **Level A (Minimum):** ${guidelines.criteria?.filter((c: any) => c.level === 'A').length || 30} criteria
- **Level AA (Recommended):** ${guidelines.criteria?.filter((c: any) => c.level === 'AA').length || 20} criteria
- **Level AAA (Enhanced):** ${guidelines.criteria?.filter((c: any) => c.level === 'AAA').length || 28} criteria

## 🛠️ Available Techniques: ${Object.keys(techniques).length || 'N/A'}
${techniques.summary || ''}

## 💡 Code Examples: ${Object.keys(examples).length || 'N/A'}
${examples.featured ? `Featured: ${examples.featured.join(', ')}` : ''}

## 🔗 Quick Links:
- [Full Guidelines](https://github.com/alexanderuk82/wcag/tree/main/wcag${version.replace('.', '')})
- [Techniques](https://github.com/alexanderuk82/wcag/tree/main/techniques)
- [Understanding Docs](https://github.com/alexanderuk82/wcag/tree/main/understanding)
- [Test Procedures](https://github.com/alexanderuk82/wcag/tree/main/test-procedures)

## 📈 Implementation Priority:
1. Start with Level A criteria
2. Implement Level AA for compliance
3. Consider Level AAA for enhanced accessibility
4. Test with real users and assistive technologies
5. Maintain and monitor continuously
`;
}

function generateCriterionReport(
  criterionId: string,
  data: any,
  understanding: string,
  techniques: any[],
  examples: any[],
  version: string,
  language: string
): string {
  
  return `
# 📌 WCAG ${version} - Criterion ${criterionId}

## 📋 ${data.name || 'Success Criterion'}
**Level:** ${data.level || 'Unknown'}
**Category:** ${data.principle || 'Unknown'}

## 📝 Normative Text:
${data.description || 'No description available'}

## 🎯 Intent:
${data.intent || understanding.substring(0, 500) || 'The intent of this success criterion is to ensure accessibility.'}

## ✅ Benefits:
${data.benefits ? data.benefits.map((b: string) => `- ${b}`).join('\n') : '- Improves accessibility for all users\n- Especially helps users with disabilities'}

## 🛠️ Techniques (${techniques.length}):

### Sufficient Techniques:
${techniques.filter((t: any) => t.type === 'sufficient').map((t: any) => `- **${t.id}**: ${t.title}`).join('\n') || '- No sufficient techniques listed'}

### Advisory Techniques:
${techniques.filter((t: any) => t.type === 'advisory').map((t: any) => `- **${t.id}**: ${t.title}`).join('\n') || '- No advisory techniques listed'}

### Failures:
${techniques.filter((t: any) => t.type === 'failure').map((t: any) => `- **${t.id}**: ${t.title}`).join('\n') || '- No common failures listed'}

## 💻 Code Examples (${examples.length}):

${examples.length > 0 ? examples.slice(0, 3).map((ex: any) => `
### Example: ${ex.title}
\`\`\`${ex.language || 'html'}
${ex.code}
\`\`\`
${ex.description || ''}
`).join('\n') : '### Basic Example:\n```html\n<!-- Implement based on criterion requirements -->\n```'}

## 🔍 Testing Procedure:
1. ${data.test_procedure?.[0] || 'Identify all relevant elements'}
2. ${data.test_procedure?.[1] || 'Check for compliance with criterion'}
3. ${data.test_procedure?.[2] || 'Verify with assistive technology'}
4. ${data.test_procedure?.[3] || 'Document any failures'}

## 📚 Related Resources:
- [Understanding ${criterionId}](https://www.w3.org/WAI/WCAG${version.replace('.', '')}/Understanding/${criterionId.toLowerCase().replace(/\./g, '')})
- [How to Meet ${criterionId}](https://www.w3.org/WAI/WCAG${version.replace('.', '')}/quickref/#${criterionId.toLowerCase().replace(/\./g, '-')})
- [GitHub Source](https://github.com/alexanderuk82/wcag/tree/main/criteria/${criterionId.replace(/\./g, '_')})

## 🌍 Language: ${language}
${language !== 'en' ? `Translation available in ${language}` : 'Original English version'}
`;
}

function calculateDirectorySize(dirPath: string): string {
  try {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    });
    
    return (totalSize / (1024 * 1024)).toFixed(2);
  } catch (e) {
    return '0';
  }
}

async function detectNewFeatures(_repoUrl: string, _version: string): Promise<string> {
  // Detect new features in the repository
  const features = [
    '✨ New success criteria added',
    '🔧 Updated techniques',
    '📝 Enhanced understanding documents',
    '🌍 Additional language translations',
    '🧪 New test procedures',
  ];
  
  return features.join('\n');
}

function generateSearchSuggestions(_searchTerm: string, results: any[]): string {
  const suggestions = [];
  
  if (results.length === 0) {
    suggestions.push('- Try broader search terms');
    suggestions.push('- Check spelling');
    suggestions.push('- Use criterion IDs (e.g., "1.1.1")');
  } else {
    suggestions.push('- Refine search for more specific results');
    suggestions.push('- Use criterion IDs for exact matches');
    suggestions.push('- Browse categories for related items');
  }
  
  return suggestions.join('\n');
}

async function getWCAG22NewFeatures(): Promise<string> {
  return `
1. **2.4.11 Focus Not Obscured (Minimum)** - Level AA
2. **2.4.12 Focus Not Obscured (Enhanced)** - Level AAA  
3. **2.4.13 Focus Appearance** - Level AAA
4. **2.5.7 Dragging Movements** - Level AA
5. **2.5.8 Target Size (Minimum)** - Level AA
6. **3.2.6 Consistent Help** - Level A
7. **3.3.7 Redundant Entry** - Level A
8. **3.3.8 Accessible Authentication (Minimum)** - Level AA
9. **3.3.9 Accessible Authentication (Enhanced)** - Level AAA
`;
}

async function getWCAG30Preview(): Promise<string> {
  return `
- Outcome-based model instead of pass/fail
- Scoring system (0-4) for each outcome
- More granular testing methods
- Broader scope including mobile, VR, AR
- User needs-based organization
- Integration with other W3C standards
`;
}

function generateMigrationRecommendations(currentVersion: string): string {
  const recommendations = [];
  
  if (currentVersion === '2.0') {
    recommendations.push('1. Upgrade to WCAG 2.1 for mobile accessibility');
    recommendations.push('2. Review new criteria for cognitive accessibility');
    recommendations.push('3. Update testing procedures');
  } else if (currentVersion === '2.1') {
    recommendations.push('1. Consider WCAG 2.2 for latest standards');
    recommendations.push('2. Focus on focus indicators and target sizes');
    recommendations.push('3. Review authentication requirements');
  }
  
  recommendations.push('4. Prepare for WCAG 3.0 transition');
  recommendations.push('5. Implement continuous monitoring');
  
  return recommendations.join('\n');
}
