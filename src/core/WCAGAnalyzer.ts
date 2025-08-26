import { JSDOM } from 'jsdom';
import { CodeParser } from './CodeParser.js';

export interface AnalysisOptions {
  level: 'A' | 'AA' | 'AAA';
  format: 'html' | 'react' | 'vue' | 'angular';
}

export interface AnalysisResult {
  violations: any[];
  passes: any[];
  incomplete: any[];
  inapplicable: any[];
}

export class WCAGAnalyzer {
  private parser: CodeParser;
  
  constructor() {
    this.parser = new CodeParser();
  }
  
  async analyze(code: string, options: AnalysisOptions): Promise<AnalysisResult> {
    try {
      // Parse code to HTML if needed
      const html = await this.parser.toHTML(code, options.format);
      
      // Create virtual DOM
      const dom = new JSDOM(html, {
        pretendToBeVisual: true,
        resources: 'usable',
      });
      
      const window = dom.window as any;
      const document = window.document;
      
      // For now, use static analysis as axe-core requires a real browser environment
      // In a real implementation, you would use puppeteer or playwright for full axe-core support
      const results = this.performStaticAnalysis(document, options.level);
      
      // Clean up
      dom.window.close();
      
      return {
        violations: results.violations || [],
        passes: results.passes || [],
        incomplete: results.incomplete || [],
        inapplicable: results.inapplicable || [],
      };
    } catch (error) {
      console.error('Analysis error:', error);
      // Return a basic analysis if axe-core fails
      return this.basicAnalysis(code, options);
    }
  }
  
  private performStaticAnalysis(document: Document, _level: string): any {
    const violations: any[] = [];
    const passes: any[] = [];
    const incomplete: any[] = [];
    
    // Check images for alt text
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.hasAttribute('alt')) {
        violations.push({
          id: 'image-alt',
          impact: 'critical',
          description: 'Images must have alternate text',
          help: 'Ensures <img> elements have alternate text or a role of none or presentation',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
          nodes: [{ html: img.outerHTML }],
          tags: ['wcag2a', 'wcag111', 'section508'],
        });
      } else {
        passes.push({
          id: 'image-alt',
          description: 'Image has alt text',
          nodes: [{ html: img.outerHTML }],
        });
      }
    });
    
    // Check form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      const id = input.getAttribute('id');
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledby && input.getAttribute('type') !== 'hidden') {
        violations.push({
          id: 'label',
          impact: 'serious',
          description: 'Form elements must have labels',
          help: 'Ensures every form element has a label',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
          nodes: [{ html: input.outerHTML }],
          tags: ['wcag2a', 'wcag332', 'section508'],
        });
      } else if (label || ariaLabel || ariaLabelledby) {
        passes.push({
          id: 'label',
          description: 'Form element has a label',
          nodes: [{ html: input.outerHTML }],
        });
      }
    });
    
    // Check heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      if (lastLevel > 0 && level > lastLevel + 1) {
        violations.push({
          id: 'heading-order',
          impact: 'moderate',
          description: 'Heading levels should only increase by one',
          help: 'Ensures the order of headings is semantically correct',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
          nodes: [{ html: heading.outerHTML }],
          tags: ['wcag2a', 'wcag131'],
        });
      }
      lastLevel = level;
    });
    
    // Check document language
    if (!document.documentElement.hasAttribute('lang')) {
      violations.push({
        id: 'html-has-lang',
        impact: 'serious',
        description: 'The HTML element must have a lang attribute',
        help: 'Ensures every HTML document has a lang attribute',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
        nodes: [{ html: '<html>' }],
        tags: ['wcag2a', 'wcag311'],
      });
    } else {
      passes.push({
        id: 'html-has-lang',
        description: 'HTML has lang attribute',
        nodes: [{ html: '<html>' }],
      });
    }
    
    // Check page title
    const title = document.querySelector('title');
    if (!title || !title.textContent?.trim()) {
      violations.push({
        id: 'document-title',
        impact: 'serious',
        description: 'Documents must have a title element',
        help: 'Ensures each HTML document contains a non-empty title element',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/page-titled.html',
        nodes: [{ html: '<title>' }],
        tags: ['wcag2a', 'wcag242'],
      });
    }
    
    // Check buttons for text
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button) => {
      if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
        violations.push({
          id: 'button-name',
          impact: 'critical',
          description: 'Buttons must have discernible text',
          help: 'Ensures buttons have discernible text',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
          nodes: [{ html: button.outerHTML }],
          tags: ['wcag2a', 'wcag412', 'section508'],
        });
      }
    });
    
    // Check links for text
    const links = document.querySelectorAll('a[href]');
    links.forEach((link) => {
      if (!link.textContent?.trim() && !link.getAttribute('aria-label')) {
        violations.push({
          id: 'link-name',
          impact: 'serious',
          description: 'Links must have discernible text',
          help: 'Ensures links have discernible text',
          helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
          nodes: [{ html: link.outerHTML }],
          tags: ['wcag2a', 'wcag244', 'section508'],
        });
      }
    });
    
    return {
      violations,
      passes,
      incomplete,
      inapplicable: [],
    };
  }

  
  private basicAnalysis(code: string, options: AnalysisOptions): AnalysisResult {
    const violations: any[] = [];
    const passes: any[] = [];
    
    // Basic checks when axe-core is not available
    const checks = [
      {
        id: 'image-alt',
        test: /<img(?![^>]*\balt\s*=)[^>]*>/gi,
        message: 'Images must have alt text',
        impact: 'critical',
      },
      {
        id: 'label-content',
        test: /<label(?![^>]*\bfor\s*=)[^>]*>/gi,
        message: 'Form labels must be associated with controls',
        impact: 'serious',
      },
      {
        id: 'button-name',
        test: /<button[^>]*>\s*<\/button>/gi,
        message: 'Buttons must have accessible text',
        impact: 'serious',
      },
      {
        id: 'html-lang',
        test: /<html(?![^>]*\blang\s*=)[^>]*>/gi,
        message: 'HTML element must have a lang attribute',
        impact: 'serious',
      },
      {
        id: 'heading-order',
        test: /<h[1-6][^>]*>/gi,
        message: 'Heading levels should not skip',
        impact: 'moderate',
      },
    ];
    
    checks.forEach((check) => {
      const matches = code.match(check.test);
      if (matches && matches.length > 0) {
        violations.push({
          id: check.id,
          impact: check.impact,
          description: check.message,
          help: check.message,
          helpUrl: `https://www.w3.org/WAI/WCAG21/Understanding/${check.id}`,
          nodes: matches.map(match => ({ html: match })),
          tags: ['wcag2a', options.level.toLowerCase()],
        });
      } else if (check.id === 'html-lang' && code.includes('<html')) {
        // Special check for html lang
        if (code.match(/<html[^>]*\blang\s*=/)) {
          passes.push({
            id: check.id,
            description: check.message,
          });
        }
      }
    });
    
    return {
      violations,
      passes,
      incomplete: [],
      inapplicable: [],
    };
  }
}
