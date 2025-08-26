import * as prettier from 'prettier';

export class CodeParser {
  async toHTML(code: string, format: string): Promise<string> {
    switch (format) {
      case 'react':
        return this.parseReact(code);
      case 'vue':
        return this.parseVue(code);
      case 'angular':
        return this.parseAngular(code);
      case 'html':
      default:
        return this.parseHTML(code);
    }
  }
  
  private parseHTML(code: string): string {
    // Clean and normalize HTML
    let html = code.trim();
    
    // Ensure it has a proper structure if it's a fragment
    if (!html.includes('<html')) {
      html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WCAG Analysis</title>
</head>
<body>
  ${html}
</body>
</html>`;
    }
    
    return html;
  }
  
  private parseReact(code: string): string {
    // Convert JSX to HTML (simplified version)
    let html = code;
    
    // Replace className with class
    html = html.replace(/className=/g, 'class=');
    
    // Replace self-closing tags
    html = html.replace(/<(\w+)([^>]*?)\/>/g, '<$1$2></$1>');
    
    // Handle React fragments
    html = html.replace(/<>/g, '<div>');
    html = html.replace(/<\/>/g, '</div>');
    
    // Remove JSX expressions (simplified)
    html = html.replace(/\{[^}]*\}/g, 'content');
    
    // Handle common React patterns
    html = html.replace(/onClick=/g, 'onclick=');
    html = html.replace(/onChange=/g, 'onchange=');
    html = html.replace(/onSubmit=/g, 'onsubmit=');
    
    // Wrap in HTML structure if needed
    return this.parseHTML(html);
  }
  
  private parseVue(code: string): string {
    // Parse Vue template (simplified)
    let html = code;
    
    // Extract template section if present
    const templateMatch = code.match(/<template>([\s\S]*?)<\/template>/);
    if (templateMatch) {
      html = templateMatch[1];
    }
    
    // Remove Vue directives
    html = html.replace(/v-[a-z]+="[^"]*"/g, '');
    html = html.replace(/:[\w-]+="[^"]*"/g, '');
    html = html.replace(/@[\w-]+="[^"]*"/g, '');
    
    // Replace Vue interpolations
    html = html.replace(/\{\{[^}]*\}\}/g, 'content');
    
    return this.parseHTML(html);
  }
  
  private parseAngular(code: string): string {
    // Parse Angular template (simplified)
    let html = code;
    
    // Remove Angular directives
    html = html.replace(/\*ngIf="[^"]*"/g, '');
    html = html.replace(/\*ngFor="[^"]*"/g, '');
    html = html.replace(/\[([\w-]+)\]="[^"]*"/g, '$1="value"');
    html = html.replace(/\(([\w-]+)\)="[^"]*"/g, 'on$1="handler"');
    
    // Replace Angular interpolations
    html = html.replace(/\{\{[^}]*\}\}/g, 'content');
    
    return this.parseHTML(html);
  }
  
  async format(code: string, format: string): Promise<string> {
    try {
      const options: any = {
        parser: format === 'html' ? 'html' : 'babel',
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
      };
      
      return await prettier.format(code, options);
    } catch (error) {
      // Return unformatted code if prettier fails
      return code;
    }
  }
}
