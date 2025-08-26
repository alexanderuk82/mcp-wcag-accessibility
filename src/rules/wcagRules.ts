interface WCAGRule {
  id: string;
  name: string;
  level: 'A' | 'AA' | 'AAA';
  category: string;
  description: string;
  successCriteria: string;
  howToFix: string;
  incorrectExample: string;
  correctExample: string;
  testingMethod: string;
  wcagVersion: string;
  wcagUrl: string;
  understandingUrl: string;
  techniquesUrl: string;
  tags: string[];
}

class WCAGRules {
  private rules: Map<string, WCAGRule>;
  
  constructor() {
    this.rules = new Map();
    this.initializeRules();
  }
  
  private initializeRules(): void {
    // Add common WCAG rules
    this.addRule({
      id: '1.1.1',
      name: 'Non-text Content',
      level: 'A',
      category: 'perceivable',
      description: 'All non-text content must have a text alternative that serves the equivalent purpose.',
      successCriteria: 'Images, form controls, and other non-text content have appropriate text alternatives.',
      howToFix: 'Add alt attributes to images, labels to form controls, and text alternatives to other non-text content.',
      incorrectExample: '<img src="logo.png">',
      correctExample: '<img src="logo.png" alt="Company Logo">',
      testingMethod: 'Check all images for alt attributes, ensure form controls have labels.',
      wcagVersion: '2.1',
      wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
      understandingUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
      techniquesUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/#non-text-content',
      tags: ['images', 'alt-text', 'wcag2a', 'perceivable'],
    });
    
    this.addRule({
      id: '1.4.3',
      name: 'Contrast (Minimum)',
      level: 'AA',
      category: 'perceivable',
      description: 'Text must have a contrast ratio of at least 4.5:1 against its background.',
      successCriteria: 'Normal text has 4.5:1 contrast, large text has 3:1 contrast.',
      howToFix: 'Adjust text or background colors to meet minimum contrast ratios.',
      incorrectExample: 'color: #777; background: #fff;',
      correctExample: 'color: #595959; background: #fff;',
      testingMethod: 'Use a color contrast analyzer tool to verify ratios.',
      wcagVersion: '2.1',
      wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
      understandingUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
      techniquesUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/#contrast-minimum',
      tags: ['color', 'contrast', 'wcag2aa', 'perceivable'],
    });
    
    this.addRule({
      id: '2.1.1',
      name: 'Keyboard',
      level: 'A',
      category: 'operable',
      description: 'All functionality must be available from a keyboard.',
      successCriteria: 'All interactive elements can be accessed and operated using only a keyboard.',
      howToFix: 'Ensure all interactive elements are keyboard accessible, add keyboard event handlers.',
      incorrectExample: '<div onclick="doSomething()">Click me</div>',
      correctExample: '<button onclick="doSomething()">Click me</button>',
      testingMethod: 'Navigate through the page using only Tab, Enter, and arrow keys.',
      wcagVersion: '2.1',
      wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
      understandingUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
      techniquesUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/#keyboard',
      tags: ['keyboard', 'navigation', 'wcag2a', 'operable'],
    });
    
    this.addRule({
      id: '2.4.6',
      name: 'Headings and Labels',
      level: 'AA',
      category: 'operable',
      description: 'Headings and labels must describe topic or purpose.',
      successCriteria: 'Headings clearly describe the content they precede, labels clearly describe form controls.',
      howToFix: 'Write descriptive headings and labels that clearly indicate content or purpose.',
      incorrectExample: '<h2>Section</h2>',
      correctExample: '<h2>Contact Information</h2>',
      testingMethod: 'Review all headings and labels for clarity and descriptiveness.',
      wcagVersion: '2.1',
      wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
      understandingUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/headings-and-labels.html',
      techniquesUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/#headings-and-labels',
      tags: ['headings', 'labels', 'wcag2aa', 'operable'],
    });
    
    this.addRule({
      id: '3.3.2',
      name: 'Labels or Instructions',
      level: 'A',
      category: 'understandable',
      description: 'Labels or instructions are provided when content requires user input.',
      successCriteria: 'Form fields have visible labels or instructions.',
      howToFix: 'Add labels to all form fields and provide instructions where needed.',
      incorrectExample: '<input type="text" name="email">',
      correctExample: '<label for="email">Email Address:</label><input type="text" id="email" name="email">',
      testingMethod: 'Check all form fields for associated labels or instructions.',
      wcagVersion: '2.1',
      wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
      understandingUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
      techniquesUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/#labels-or-instructions',
      tags: ['forms', 'labels', 'wcag2a', 'understandable'],
    });
    
    this.addRule({
      id: '4.1.2',
      name: 'Name, Role, Value',
      level: 'A',
      category: 'robust',
      description: 'User interface components must have names and roles that can be programmatically determined.',
      successCriteria: 'All UI components have accessible names and roles.',
      howToFix: 'Use semantic HTML or add appropriate ARIA attributes.',
      incorrectExample: '<div class="button">Submit</div>',
      correctExample: '<button>Submit</button> or <div role="button" tabindex="0">Submit</div>',
      testingMethod: 'Use screen reader to verify all controls are properly announced.',
      wcagVersion: '2.1',
      wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
      understandingUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
      techniquesUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/#name-role-value',
      tags: ['aria', 'semantics', 'wcag2a', 'robust'],
    });
    
    // Add more rules as needed...
    this.addRule({
      id: 'color-contrast',
      name: 'Color Contrast',
      level: 'AA',
      category: 'perceivable',
      description: 'Ensure sufficient color contrast between text and background.',
      successCriteria: 'Text has sufficient contrast against its background.',
      howToFix: 'Increase contrast between text and background colors.',
      incorrectExample: 'color: #999; background: #fff;',
      correctExample: 'color: #595959; background: #fff;',
      testingMethod: 'Use color contrast analyzer tools.',
      wcagVersion: '2.1',
      wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
      understandingUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
      techniquesUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/#contrast',
      tags: ['color', 'contrast', 'visual'],
    });
    
    this.addRule({
      id: 'aria-label',
      name: 'ARIA Labels',
      level: 'A',
      category: 'robust',
      description: 'Elements must have accessible names via aria-label or aria-labelledby.',
      successCriteria: 'Interactive elements have accessible names.',
      howToFix: 'Add aria-label or aria-labelledby attributes.',
      incorrectExample: '<button></button>',
      correctExample: '<button aria-label="Close dialog"></button>',
      testingMethod: 'Check all interactive elements for accessible names.',
      wcagVersion: '2.1',
      wcagUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
      understandingUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
      techniquesUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA14',
      tags: ['aria', 'labels', 'accessibility'],
    });
  }
  
  private addRule(rule: WCAGRule): void {
    this.rules.set(rule.id, rule);
  }
  
  getRule(id: string): WCAGRule | undefined {
    return this.rules.get(id);
  }
  
  search(term: string): WCAGRule[] {
    const searchTerm = term.toLowerCase();
    const results: WCAGRule[] = [];
    
    this.rules.forEach(rule => {
      if (
        rule.id.toLowerCase().includes(searchTerm) ||
        rule.name.toLowerCase().includes(searchTerm) ||
        rule.description.toLowerCase().includes(searchTerm) ||
        rule.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      ) {
        results.push(rule);
      }
    });
    
    return results;
  }
  
  getByCategory(category: string): WCAGRule[] {
    const results: WCAGRule[] = [];
    
    this.rules.forEach(rule => {
      if (rule.category === category.toLowerCase()) {
        results.push(rule);
      }
    });
    
    return results;
  }
  
  getByLevel(level: string): WCAGRule[] {
    const results: WCAGRule[] = [];
    
    this.rules.forEach(rule => {
      if (rule.level === level.toUpperCase()) {
        results.push(rule);
      }
    });
    
    return results;
  }
}

export const wcagRules = new WCAGRules();
