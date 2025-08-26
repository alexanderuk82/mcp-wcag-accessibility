import { WCAGAnalyzer } from '../core/WCAGAnalyzer.js';
import { JSDOM } from 'jsdom';
import * as https from 'https';
import * as http from 'http';
import * as zlib from 'zlib';

export const liveUrlAuditTool = {
  definition: {
    name: 'live_url_audit',
    description: 'Analyze live websites for WCAG accessibility issues',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL of the website to audit',
        },
        level: {
          type: 'string',
          enum: ['A', 'AA', 'AAA'],
          description: 'WCAG compliance level to check',
          default: 'AA',
        },
        includeMetrics: {
          type: 'boolean',
          description: 'Include performance and SEO metrics',
          default: true,
        },
        checkMobile: {
          type: 'boolean',
          description: 'Check mobile accessibility',
          default: false,
        },
        depth: {
          type: 'number',
          description: 'How many linked pages to analyze (1-5)',
          default: 1,
          minimum: 1,
          maximum: 5,
        },
      },
      required: ['url'],
    },
  },
  
  handler: async (args: any) => {
    const { 
      url, 
      level = 'AA', 
      includeMetrics = true,
      checkMobile = false,
      depth = 1
    } = args;
    
    try {
      // Validate URL
      let validUrl: URL;
      try {
        validUrl = new URL(url);
        if (!['http:', 'https:'].includes(validUrl.protocol)) {
          throw new Error('URL must use HTTP or HTTPS protocol');
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Invalid URL: ${url}\n\nPlease provide a valid URL starting with http:// or https://`,
            },
          ],
        };
      }
      
      // Fetch the webpage with error handling
      const startTime = Date.now();
      let html = '';
      let fetchTime = 0;
      
      try {
        html = await fetchWebpage(validUrl.href);
        fetchTime = Date.now() - startTime;
      } catch (fetchError) {
        console.error('Failed to fetch webpage:', fetchError);
        return {
          content: [
            {
              type: 'text',
              text: `❌ Could not fetch webpage: ${url}\n\nError: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}\n\nPossible reasons:\n- Website is down or unreachable\n- SSL/TLS certificate issues\n- Website blocks automated requests\n- Network connectivity issues\n\nTry again or check if the URL is accessible in a browser.`,
            },
          ],
        };
      }
      
      if (!html) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Could not fetch webpage: ${url}\n\nThe website might be down or blocking automated requests.`,
            },
          ],
        };
      }
      
      // Parse HTML and extract metadata
      const dom = new JSDOM(html, { url: validUrl.href });
      const document = dom.window.document;
      const metadata = extractMetadata(document, validUrl);
      
      // Analyze with WCAG analyzer
      const analyzer = new WCAGAnalyzer();
      const analysisStart = Date.now();
      const results = await analyzer.analyze(html, { level, format: 'html' });
      const analysisTime = Date.now() - analysisStart;
      
      // Extract additional accessibility features
      const features = extractAccessibilityFeatures(document);
      
      // Find internal links for depth analysis
      let linkedPages: any[] = [];
      if (depth > 1) {
        const links = extractInternalLinks(document, validUrl);
        linkedPages = links.slice(0, Math.min(depth - 1, 3));
      }
      
      // Calculate scores
      const scores = calculateDetailedScores(results, features);
      
      // Extract page structure
      const structure = analyzePageStructure(document);
      
      // Check mobile if requested
      let mobileReport = '';
      if (checkMobile) {
        mobileReport = generateMobileReport(document, results);
      }
      
      // Performance metrics
      let performanceMetrics = '';
      if (includeMetrics) {
        performanceMetrics = generatePerformanceMetrics(html, fetchTime, analysisTime, metadata);
      }
      
      // Generate report
      const response = `
# 🌐 Live Website Accessibility Audit

## 🔍 Analyzing: ${validUrl.href}

### 📊 Quick Summary
- **Page Title:** ${metadata.title || 'No title found'}
- **Description:** ${metadata.description || 'No description found'}
- **Language:** ${metadata.language || 'Not specified'} ${metadata.language ? '✅' : '❌'}
- **Fetch Time:** ${fetchTime}ms
- **Analysis Time:** ${analysisTime}ms

---

## 🏆 Accessibility Score: ${scores.overall}/100 (${scores.grade})

### Compliance Levels
- **Level A:** ${scores.levelA}% ${scores.levelA >= 90 ? '✅' : scores.levelA >= 70 ? '🟡' : '❌'}
- **Level AA:** ${scores.levelAA}% ${scores.levelAA >= 90 ? '✅' : scores.levelAA >= 70 ? '🟡' : '❌'}
- **Level AAA:** ${scores.levelAAA}% ${scores.levelAAA >= 90 ? '✅' : scores.levelAAA >= 70 ? '🟡' : '❌'}

---

## 🚨 Accessibility Issues Found: ${results.violations.length}

### By Severity:
${generateSeveritySummary(results.violations)}

### Top Issues:
${generateTopIssues(results.violations)}

---

## ✅ Accessibility Features Detected

${generateFeatureReport(features)}

---

## 📐 Page Structure Analysis

${generateStructureReport(structure)}

---

## 🔗 Page Resources

- **Images:** ${structure.images.total} (${structure.images.withAlt} with alt text)
- **Links:** ${structure.links.total} (${structure.links.internal} internal, ${structure.links.external} external)
- **Forms:** ${structure.forms.total} (${structure.forms.withLabels} with proper labels)
- **Buttons:** ${structure.buttons.total} (${structure.buttons.withText} with accessible text)
- **Videos:** ${structure.media.videos} ${structure.media.videos > 0 ? '⚠️ Check for captions' : ''}
- **Audio:** ${structure.media.audio} ${structure.media.audio > 0 ? '⚠️ Check for transcripts' : ''}

---

## 🎯 Critical Fixes Required

${generateCriticalFixes(results.violations)}

---

## 📱 Responsive & Mobile Accessibility

${checkMobile ? mobileReport : generateBasicMobileCheck(document)}

---

${includeMetrics ? performanceMetrics : ''}

## 🔍 Detailed Violations

${generateDetailedViolations(results.violations)}

---

## ✨ Passed Checks (${results.passes.length})

<details>
<summary>Click to expand passed checks</summary>

${results.passes.slice(0, 10).map((pass: any) => `- ✅ ${pass.id}: ${pass.description}`).join('\n')}
${results.passes.length > 10 ? `\n... and ${results.passes.length - 10} more` : ''}

</details>

---

## 🔄 Linked Pages Analysis ${depth > 1 ? `(Depth: ${depth})` : ''}

${linkedPages.length > 0 ? `
Found ${linkedPages.length} internal pages to analyze:
${linkedPages.map((link: string) => `- ${link}`).join('\n')}

*Note: Deep analysis of linked pages would require additional calls*
` : 'Single page analysis only'}

---

## 📋 Recommendations

${generateRecommendations(results, scores, features, structure)}

---

## 🛠️ Tools & Resources

### Testing Tools:
- [WAVE WebAIM](https://wave.webaim.org/) - Visual feedback tool
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Chrome DevTools
- [Pa11y](https://pa11y.org/) - Command line tool

### Guidelines:
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

---

## 📊 Audit Metadata

- **Audit Date:** ${new Date().toISOString()}
- **WCAG Level Tested:** ${level}
- **User Agent:** MCP WCAG Audit Tool v2.0
- **Total Elements Analyzed:** ${structure.totalElements}
- **DOM Load Time:** ${fetchTime}ms
- **Analysis Time:** ${analysisTime}ms
- **Total Time:** ${fetchTime + analysisTime}ms

---

## ⚠️ Limitations

This automated audit covers approximately 30-40% of WCAG criteria. For complete compliance:
1. **Manual testing required** for subjective criteria
2. **Screen reader testing** recommended
3. **Real user testing** with people with disabilities
4. **Keyboard navigation** manual verification
5. **Color contrast** manual verification for images

---

*Live audit completed by MCP WCAG Accessibility Tool*
*For comprehensive testing, combine with manual review*
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
            text: `Error auditing URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
};

async function fetchWebpage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const client = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MCP-WCAG-Audit/2.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 10000,
    };
    
    const request = client.get(url, options, (response) => {
      // Handle redirects
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = new URL(response.headers.location, url).href;
        fetchWebpage(redirectUrl).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      let data = '';
      
      // Handle compression
      if (response.headers['content-encoding'] === 'gzip') {
        const gunzip = zlib.createGunzip();
        response.pipe(gunzip);
        gunzip.on('data', (chunk: Buffer) => {
          data += chunk.toString();
        });
        gunzip.on('end', () => {
          resolve(data);
        });
        gunzip.on('error', (error) => {
          console.error('Gzip decompression error:', error.message);
          // Try to return raw data if gzip fails
          resolve(data || '');
        });
      } else {
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          resolve(data);
        });
      }
    });
    
    request.on('error', (error) => {
      console.error('Request error:', error.message);
      reject(error);
    });
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
    } catch (error) {
      console.error('Fetch error:', error);
      reject(error);
    }
  });
}

function extractMetadata(document: Document, url: URL): any {
  return {
    title: document.title || document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                 document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    language: document.documentElement.lang,
    charset: document.characterSet,
    viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    author: document.querySelector('meta[name="author"]')?.getAttribute('content'),
    keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content'),
    favicon: document.querySelector('link[rel="icon"]')?.getAttribute('href') ||
             document.querySelector('link[rel="shortcut icon"]')?.getAttribute('href'),
    hostname: url.hostname,
  };
}

function extractAccessibilityFeatures(document: Document): any {
  return {
    skipLinks: document.querySelectorAll('a[href^="#"]:first-child').length > 0,
    ariaLandmarks: document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]').length,
    ariaLive: document.querySelectorAll('[aria-live]').length,
    ariaLabels: document.querySelectorAll('[aria-label], [aria-labelledby]').length,
    semanticHTML5: {
      nav: document.querySelectorAll('nav').length,
      main: document.querySelectorAll('main').length,
      header: document.querySelectorAll('header').length,
      footer: document.querySelectorAll('footer').length,
      article: document.querySelectorAll('article').length,
      section: document.querySelectorAll('section').length,
      aside: document.querySelectorAll('aside').length,
    },
    forms: {
      total: document.querySelectorAll('form').length,
      withFieldsets: document.querySelectorAll('form fieldset').length,
      withLegends: document.querySelectorAll('form fieldset legend').length,
      withLabels: document.querySelectorAll('form label').length,
      withRequired: document.querySelectorAll('[required], [aria-required="true"]').length,
    },
    headingStructure: {
      h1: document.querySelectorAll('h1').length,
      h2: document.querySelectorAll('h2').length,
      h3: document.querySelectorAll('h3').length,
      h4: document.querySelectorAll('h4').length,
      h5: document.querySelectorAll('h5').length,
      h6: document.querySelectorAll('h6').length,
    },
    tables: {
      total: document.querySelectorAll('table').length,
      withCaption: document.querySelectorAll('table caption').length,
      withThead: document.querySelectorAll('table thead').length,
      withScope: document.querySelectorAll('th[scope]').length,
    },
    multimedia: {
      images: document.querySelectorAll('img').length,
      imagesWithAlt: document.querySelectorAll('img[alt]').length,
      videos: document.querySelectorAll('video').length,
      videosWithCaptions: document.querySelectorAll('video track[kind="captions"]').length,
      audio: document.querySelectorAll('audio').length,
    },
  };
}

function extractInternalLinks(document: Document, baseUrl: URL): string[] {
  const links = Array.from(document.querySelectorAll('a[href]'));
  const internalLinks = new Set<string>();
  
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    try {
      const linkUrl = new URL(href, baseUrl.href);
      if (linkUrl.hostname === baseUrl.hostname && 
          linkUrl.pathname !== baseUrl.pathname &&
          !linkUrl.pathname.includes('#') &&
          !linkUrl.pathname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx|zip)$/i)) {
        internalLinks.add(linkUrl.href);
      }
    } catch (e) {
      // Invalid URL, skip
    }
  });
  
  return Array.from(internalLinks).slice(0, 10);
}

function calculateDetailedScores(results: any, features: any): any {
  const calculateCompliance = (violations: any[], level: string) => {
    const relevantViolations = violations.filter((v: any) => 
      v.tags.includes(`wcag2${level.toLowerCase()}`) || 
      v.tags.includes(`wcag21${level.toLowerCase()}`)
    );
    const totalChecks = results.passes.length + relevantViolations.length;
    if (totalChecks === 0) return 100;
    return Math.round((results.passes.length / totalChecks) * 100);
  };
  
  let overall = 100;
  results.violations.forEach((v: any) => {
    const penalty = v.impact === 'critical' ? 15 : 
                   v.impact === 'serious' ? 10 : 
                   v.impact === 'moderate' ? 5 : 2;
    overall -= penalty;
  });
  
  // Bonus points for good features
  if (features.skipLinks) overall += 2;
  if (features.ariaLandmarks > 3) overall += 3;
  if (features.semanticHTML5.main > 0) overall += 2;
  if (features.semanticHTML5.nav > 0) overall += 1;
  
  overall = Math.max(0, Math.min(100, overall));
  
  const grade = overall >= 90 ? 'A' :
                overall >= 80 ? 'B' :
                overall >= 70 ? 'C' :
                overall >= 60 ? 'D' : 'F';
  
  return {
    overall,
    grade,
    levelA: calculateCompliance(results.violations, 'A'),
    levelAA: calculateCompliance(results.violations, 'AA'),
    levelAAA: calculateCompliance(results.violations, 'AAA'),
  };
}

function analyzePageStructure(document: Document): any {
  const images = document.querySelectorAll('img');
  const links = document.querySelectorAll('a');
  const forms = document.querySelectorAll('form');
  const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
  const inputs = document.querySelectorAll('input, select, textarea');
  
  return {
    totalElements: document.querySelectorAll('*').length,
    images: {
      total: images.length,
      withAlt: document.querySelectorAll('img[alt]').length,
      withEmptyAlt: document.querySelectorAll('img[alt=""]').length,
      decorative: document.querySelectorAll('img[role="presentation"], img[aria-hidden="true"]').length,
    },
    links: {
      total: links.length,
      internal: Array.from(links).filter(a => {
        const href = a.getAttribute('href');
        return href && (href.startsWith('/') || href.startsWith('#') || !href.includes('://'));
      }).length,
      external: Array.from(links).filter(a => {
        const href = a.getAttribute('href');
        return href && href.includes('://');
      }).length,
      withText: Array.from(links).filter(a => a.textContent?.trim()).length,
      withAriaLabel: document.querySelectorAll('a[aria-label]').length,
    },
    forms: {
      total: forms.length,
      withLabels: Array.from(forms).filter(form => 
        form.querySelectorAll('label').length > 0
      ).length,
      withFieldsets: Array.from(forms).filter(form => 
        form.querySelectorAll('fieldset').length > 0
      ).length,
    },
    buttons: {
      total: buttons.length,
      withText: Array.from(buttons).filter(btn => 
        btn.textContent?.trim() || btn.getAttribute('aria-label') || btn.getAttribute('value')
      ).length,
    },
    inputs: {
      total: inputs.length,
      withLabels: Array.from(inputs).filter(input => {
        const id = input.id;
        return id && document.querySelector(`label[for="${id}"]`);
      }).length,
      required: document.querySelectorAll('[required], [aria-required="true"]').length,
    },
    headings: {
      total: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
      hierarchy: checkHeadingHierarchy(document),
    },
    media: {
      videos: document.querySelectorAll('video').length,
      audio: document.querySelectorAll('audio').length,
      iframes: document.querySelectorAll('iframe').length,
      embeds: document.querySelectorAll('embed, object').length,
    },
  };
}

function checkHeadingHierarchy(document: Document): string {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  if (headings.length === 0) return 'No headings found';
  
  let lastLevel = 0;
  let skipped = false;
  
  headings.forEach(h => {
    const level = parseInt(h.tagName[1]);
    if (lastLevel > 0 && level > lastLevel + 1) {
      skipped = true;
    }
    lastLevel = level;
  });
  
  return skipped ? '⚠️ Heading levels skipped' : '✅ Proper hierarchy';
}

function generateSeveritySummary(violations: any[]): string {
  const counts = {
    critical: violations.filter(v => v.impact === 'critical').length,
    serious: violations.filter(v => v.impact === 'serious').length,
    moderate: violations.filter(v => v.impact === 'moderate').length,
    minor: violations.filter(v => v.impact === 'minor').length,
  };
  
  return `
- 🔴 **Critical:** ${counts.critical}
- 🟠 **Serious:** ${counts.serious}
- 🟡 **Moderate:** ${counts.moderate}
- 🟢 **Minor:** ${counts.minor}
`;
}

function generateTopIssues(violations: any[]): string {
  const sorted = violations
    .sort((a, b) => {
      const impactWeight: any = { critical: 4, serious: 3, moderate: 2, minor: 1 };
      return (impactWeight[b.impact] || 0) - (impactWeight[a.impact] || 0);
    })
    .slice(0, 5);
  
  return sorted.map((v, i) => 
    `${i + 1}. **[${v.impact.toUpperCase()}]** ${v.id}: ${v.help} (${v.nodes.length} instances)`
  ).join('\n');
}

function generateFeatureReport(features: any): string {
  const checks = [
    { name: 'Skip Links', value: features.skipLinks, icon: features.skipLinks ? '✅' : '❌' },
    { name: 'ARIA Landmarks', value: features.ariaLandmarks, icon: features.ariaLandmarks > 0 ? '✅' : '❌' },
    { name: 'Semantic HTML5', value: features.semanticHTML5.main > 0, icon: features.semanticHTML5.main > 0 ? '✅' : '❌' },
    { name: 'Form Labels', value: features.forms.withLabels, icon: features.forms.withLabels > 0 ? '✅' : '⚠️' },
    { name: 'Image Alt Text', value: `${features.multimedia.imagesWithAlt}/${features.multimedia.images}`, icon: features.multimedia.imagesWithAlt === features.multimedia.images ? '✅' : '⚠️' },
    { name: 'Heading Structure', value: Object.values(features.headingStructure).some((v: any) => v > 0), icon: features.headingStructure.h1 > 0 ? '✅' : '⚠️' },
  ];
  
  return checks.map(check => 
    `${check.icon} **${check.name}:** ${typeof check.value === 'boolean' ? (check.value ? 'Yes' : 'No') : check.value}`
  ).join('\n');
}

function generateStructureReport(structure: any): string {
  return `
- **Total Elements:** ${structure.totalElements}
- **Heading Structure:** ${structure.headings.hierarchy}
- **Total Headings:** ${structure.headings.total}
- **Forms with Labels:** ${structure.forms.withLabels}/${structure.forms.total}
- **Inputs with Labels:** ${structure.inputs.withLabels}/${structure.inputs.total}
- **Required Fields:** ${structure.inputs.required}
`;
}

function generateCriticalFixes(violations: any[]): string {
  const critical = violations.filter(v => v.impact === 'critical' || v.impact === 'serious').slice(0, 3);
  
  if (critical.length === 0) {
    return '✅ No critical issues found!';
  }
  
  return critical.map((v, i) => `
${i + 1}. **${v.id}** (${v.impact})
   - Problem: ${v.description}
   - Fix: ${v.help}
   - Elements affected: ${v.nodes.length}
`).join('\n');
}

function generateBasicMobileCheck(document: Document): string {
  const viewport = document.querySelector('meta[name="viewport"]');
  const touchTargets = document.querySelectorAll('button, a, input, select, textarea');
  
  const checks = [
    `${viewport ? '✅' : '❌'} Viewport meta tag ${viewport ? 'present' : 'missing'}`,
    `📱 Touch targets found: ${touchTargets.length}`,
    `⚠️ Manual check needed for:`,
    `  - Touch target sizes (min 44x44px)`,
    `  - Zoom capabilities`,
    `  - Orientation support`,
    `  - Gesture alternatives`,
  ];
  
  return checks.join('\n');
}

function generateMobileReport(document: Document, results: any): string {
  const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content');
  const hasResponsiveImages = document.querySelectorAll('img[srcset], picture').length > 0;
  
  return `
### Mobile Accessibility Checks:
- ${viewport ? '✅' : '❌'} **Viewport Meta:** ${viewport || 'Not found'}
- ${hasResponsiveImages ? '✅' : '⚠️'} **Responsive Images:** ${hasResponsiveImages ? 'Yes' : 'No'}
- **Touch Targets:** Manual verification needed
- **Pinch-to-zoom:** ${viewport?.includes('user-scalable=no') ? '❌ Disabled' : '✅ Enabled'}
- **Text Scaling:** ${viewport?.includes('maximum-scale=1') ? '⚠️ Limited' : '✅ Allowed'}

### Mobile-Specific Issues:
${results.violations.filter((v: any) => 
  v.tags.includes('mobile') || v.id.includes('target-size')
).map((v: any) => `- ${v.help}`).join('\n') || '- No mobile-specific issues detected'}
`;
}

function generatePerformanceMetrics(html: string, fetchTime: number, analysisTime: number, metadata: any): string {
  const htmlSize = Buffer.byteLength(html, 'utf8');
  const performance = {
    htmlSize: (htmlSize / 1024).toFixed(2),
    fetchTime,
    analysisTime,
    totalTime: fetchTime + analysisTime,
    charset: metadata.charset || 'Not specified',
    viewport: metadata.viewport ? 'Yes' : 'No',
  };
  
  return `
## ⚡ Performance Metrics

- **HTML Size:** ${performance.htmlSize} KB
- **Fetch Time:** ${performance.fetchTime}ms
- **Analysis Time:** ${performance.analysisTime}ms
- **Total Time:** ${performance.totalTime}ms
- **Character Encoding:** ${performance.charset}
- **Mobile Optimized:** ${performance.viewport}

### Performance Recommendations:
${parseFloat(performance.htmlSize) > 100 ? '- ⚠️ Consider reducing HTML size (currently ' + performance.htmlSize + ' KB)' : '- ✅ HTML size is optimal'}
${performance.fetchTime > 3000 ? '- ⚠️ Slow server response time (' + performance.fetchTime + 'ms)' : '- ✅ Good server response time'}
${!metadata.charset ? '- ⚠️ Specify character encoding' : ''}
${!metadata.viewport ? '- ⚠️ Add viewport meta tag for mobile' : ''}

---
`;
}

function generateDetailedViolations(violations: any[]): string {
  if (violations.length === 0) {
    return '✅ No violations found!';
  }
  
  const top10 = violations.slice(0, 10);
  
  return top10.map((v, i) => `
### ${i + 1}. ${v.id} [${v.impact.toUpperCase()}]
- **Description:** ${v.description}
- **Help:** ${v.help}
- **WCAG Criteria:** ${v.tags.filter((t: string) => t.includes('wcag')).join(', ')}
- **Elements Affected:** ${v.nodes.length}
- **Learn More:** [Documentation](${v.helpUrl})
`).join('\n') + (violations.length > 10 ? `\n... and ${violations.length - 10} more violations` : '');
}

function generateRecommendations(results: any, scores: any, features: any, structure: any): string {
  const recommendations = [];
  
  // Based on score
  if (scores.overall < 60) {
    recommendations.push('🔴 **Critical:** Address all critical and serious violations immediately');
  } else if (scores.overall < 80) {
    recommendations.push('🟡 **Important:** Focus on fixing serious violations and improving structure');
  } else {
    recommendations.push('✅ **Good start:** Focus on minor improvements and manual testing');
  }
  
  // Based on violations
  if (results.violations.filter((v: any) => v.id.includes('alt-text')).length > 0) {
    recommendations.push('📷 Add alt text to all informative images');
  }
  
  if (results.violations.filter((v: any) => v.id.includes('label')).length > 0) {
    recommendations.push('📝 Ensure all form inputs have associated labels');
  }
  
  if (results.violations.filter((v: any) => v.id.includes('contrast')).length > 0) {
    recommendations.push('🎨 Improve color contrast ratios');
  }
  
  // Based on features
  if (!features.skipLinks) {
    recommendations.push('🔗 Add skip navigation links');
  }
  
  if (features.ariaLandmarks < 3) {
    recommendations.push('🏗️ Implement ARIA landmarks or HTML5 semantic elements');
  }
  
  if (structure.headings.hierarchy.includes('skipped')) {
    recommendations.push('📑 Fix heading hierarchy (don\'t skip levels)');
  }
  
  // Manual testing
  recommendations.push('');
  recommendations.push('### Manual Testing Required:');
  recommendations.push('1. **Keyboard Navigation:** Test all interactive elements');
  recommendations.push('2. **Screen Reader:** Test with NVDA, JAWS, or VoiceOver');
  recommendations.push('3. **Color Contrast:** Verify text over images and gradients');
  recommendations.push('4. **Motion & Animation:** Check for motion triggers and pause controls');
  recommendations.push('5. **Error Handling:** Test form validation and error messages');
  
  return recommendations.join('\n');
}
