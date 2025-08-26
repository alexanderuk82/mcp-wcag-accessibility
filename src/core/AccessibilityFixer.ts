import * as cheerio from 'cheerio';
import { CodeParser } from './CodeParser.js';

export interface FixOptions {
  level: string;
  format: string;
  autoFix: boolean;
}

export class AccessibilityFixer {
  private parser: CodeParser;
  
  constructor() {
    this.parser = new CodeParser();
  }
  
  async fix(code: string, violations: any[], options: FixOptions): Promise<string> {
    // Convert to HTML for processing
    const html = await this.parser.toHTML(code, options.format);
    const $ = cheerio.load(html);
    
    // Apply fixes for each violation
    for (const violation of violations) {
      if (options.autoFix) {
        await this.applyFix($, violation);
      }
    }
    
    // Get the fixed HTML
    let fixedCode = $.html();
    
    // Convert back to original format if needed
    if (options.format === 'react') {
      fixedCode = this.htmlToReact(fixedCode);
    } else if (options.format === 'vue') {
      fixedCode = this.htmlToVue(fixedCode);
    } else if (options.format === 'angular') {
      fixedCode = this.htmlToAngular(fixedCode);
    }
    
    // Format the code
    return await this.parser.format(fixedCode, options.format);
  }
  
  private async applyFix($: cheerio.CheerioAPI, violation: any): Promise<void> {
    switch (violation.id) {
      case 'image-alt':
      case 'img-alt-text':
        this.fixImageAlt($);
        break;
        
      case 'label':
      case 'label-content':
        this.fixLabels($);
        break;
        
      case 'button-name':
        this.fixButtonNames($);
        break;
        
      case 'html-has-lang':
      case 'html-lang':
        this.fixHtmlLang($);
        break;
        
      case 'heading-order':
        this.fixHeadingOrder($);
        break;
        
      case 'color-contrast':
        this.fixColorContrast($);
        break;
        
      case 'aria-label':
      case 'aria-labelledby':
        this.fixAriaLabels($);
        break;
        
      case 'link-name':
        this.fixLinkNames($);
        break;
        
      case 'list':
        this.fixLists($);
        break;
        
      case 'form-field-multiple-labels':
        this.fixFormFields($);
        break;
        
      default:
        // Unknown violation, skip
        break;
    }
  }
  
  private fixImageAlt($: cheerio.CheerioAPI): void {
    $('img:not([alt])').each((_i, elem) => {
      const $img = $(elem);
      const src = $img.attr('src') || '';
      
      // Generate meaningful alt text based on src
      let altText = 'Image';
      if (src) {
        const filename = src.split('/').pop()?.split('.')[0] || 'image';
        altText = filename
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }
      
      $img.attr('alt', altText);
    });
  }
  
  private fixLabels($: cheerio.CheerioAPI): void {
    // Fix labels without for attribute
    $('label:not([for])').each((_i, elem) => {
      const $label = $(elem);
      const $input = $label.find('input, select, textarea').first();
      
      if ($input.length) {
        // Label wraps the input
        let id = $input.attr('id');
        if (!id) {
          id = `input-${Date.now()}-${_i}`;
          $input.attr('id', id);
        }
        $label.attr('for', id);
      }
    });
    
    // Fix inputs without labels
    $('input:not([type="submit"]):not([type="button"]), select, textarea').each((_i, elem) => {
      const $input = $(elem);
      const id = $input.attr('id');
      const hasLabel = id && $(`label[for="${id}"]`).length > 0;
      const hasAriaLabel = $input.attr('aria-label');
      
      if (!hasLabel && !hasAriaLabel) {
        // Add aria-label based on type or name
        const type = $input.attr('type') || 'text';
        const name = $input.attr('name') || type;
        const ariaLabel = name
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
        
        $input.attr('aria-label', ariaLabel);
      }
    });
  }
  
  private fixButtonNames($: cheerio.CheerioAPI): void {
    $('button').each((_i, elem) => {
      const $button = $(elem);
      const text = $button.text().trim();
      const ariaLabel = $button.attr('aria-label');
      
      if (!text && !ariaLabel) {
        // Add text or aria-label
        const type = $button.attr('type') || 'button';
        const defaultText = type === 'submit' ? 'Submit' : 'Click here';
        $button.attr('aria-label', defaultText);
      }
    });
  }
  
  private fixHtmlLang($: cheerio.CheerioAPI): void {
    const $html = $('html');
    if (!$html.attr('lang')) {
      $html.attr('lang', 'en');
    }
  }
  
  private fixHeadingOrder($: cheerio.CheerioAPI): void {
    const headings = $('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    
    headings.each((_i, elem) => {
      const $heading = $(elem);
      const tagName = elem.tagName.toLowerCase();
      const level = parseInt(tagName.charAt(1));
      
      if (lastLevel > 0 && level > lastLevel + 1) {
        // Skip level detected, fix it
        const newLevel = lastLevel + 1;
        const newTag = `h${newLevel}`;
        const $newHeading = $(`<${newTag}>`).html($heading.html() || '');
        
        // Copy attributes
        const attrs = $heading.attr();
        if (attrs) {
          Object.keys(attrs).forEach(key => {
            $newHeading.attr(key, attrs[key]);
          });
        }
        
        $heading.replaceWith($newHeading);
        lastLevel = newLevel;
      } else {
        lastLevel = level;
      }
    });
  }
  
  private fixColorContrast($: cheerio.CheerioAPI): void {
    // Add high contrast styles
    const style = $('<style>').html(`
      /* WCAG AA Compliant Color Contrast Fixes */
      body { color: #212529; background-color: #ffffff; }
      a { color: #0066cc; }
      a:visited { color: #551a8b; }
      button, input[type="submit"] { 
        background-color: #0066cc; 
        color: #ffffff;
        border: 2px solid #0052a3;
      }
      button:hover, input[type="submit"]:hover {
        background-color: #0052a3;
      }
      ::placeholder { color: #6c757d; }
    `);
    
    $('head').append(style);
  }
  
  private fixAriaLabels($: cheerio.CheerioAPI): void {
    // Fix interactive elements without accessible names
    $('a, button, [role="button"], [role="link"]').each((_i, elem) => {
      const $elem = $(elem);
      const text = $elem.text().trim();
      const ariaLabel = $elem.attr('aria-label');
      const ariaLabelledby = $elem.attr('aria-labelledby');
      
      if (!text && !ariaLabel && !ariaLabelledby) {
        // Try to generate meaningful label
        const href = $elem.attr('href');
        const title = $elem.attr('title');
        
        if (title) {
          $elem.attr('aria-label', title);
        } else if (href) {
          const label = href === '#' ? 'Link' : `Link to ${href}`;
          $elem.attr('aria-label', label);
        } else {
          $elem.attr('aria-label', 'Interactive element');
        }
      }
    });
  }
  
  private fixLinkNames($: cheerio.CheerioAPI): void {
    $('a').each((_i, elem) => {
      const $link = $(elem);
      const text = $link.text().trim();
      const ariaLabel = $link.attr('aria-label');
      
      if (!text && !ariaLabel) {
        const href = $link.attr('href') || '#';
        const title = $link.attr('title');
        
        if (title) {
          $link.attr('aria-label', title);
        } else if (href !== '#') {
          // Extract meaningful text from URL
          const urlText = href
            .replace(/https?:\/\//g, '')
            .replace(/www\./g, '')
            .split('/')[0];
          $link.attr('aria-label', `Link to ${urlText}`);
        } else {
          $link.text('Link');
        }
      }
    });
  }
  
  private fixLists($: cheerio.CheerioAPI): void {
    // Fix orphaned list items
    $('li').each((_i, elem) => {
      const $li = $(elem);
      const parent = $li.parent();
      
      if (!parent.is('ul') && !parent.is('ol')) {
        // Wrap in ul
        const $ul = $('<ul>');
        $li.wrap($ul);
      }
    });
  }
  
  private fixFormFields($: cheerio.CheerioAPI): void {
    // Add required indicators
    $('input[required], select[required], textarea[required]').each((_i, elem) => {
      const $field = $(elem);
      const ariaLabel = $field.attr('aria-label');
      
      if (ariaLabel && !ariaLabel.includes('required')) {
        $field.attr('aria-label', `${ariaLabel} (required)`);
      }
      
      // Add aria-required
      $field.attr('aria-required', 'true');
    });
  }
  
  private htmlToReact(html: string): string {
    let jsx = html;
    
    // Convert class to className
    jsx = jsx.replace(/class=/g, 'className=');
    
    // Convert for to htmlFor
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    
    // Convert event handlers
    jsx = jsx.replace(/onclick=/g, 'onClick=');
    jsx = jsx.replace(/onchange=/g, 'onChange=');
    jsx = jsx.replace(/onsubmit=/g, 'onSubmit=');
    
    // Remove DOCTYPE and html/head/body tags for component
    jsx = jsx.replace(/<!DOCTYPE[^>]*>/gi, '');
    jsx = jsx.replace(/<html[^>]*>|<\/html>/gi, '');
    jsx = jsx.replace(/<head>[\s\S]*?<\/head>/gi, '');
    jsx = jsx.replace(/<body[^>]*>|<\/body>/gi, '');
    
    return jsx.trim();
  }
  
  private htmlToVue(html: string): string {
    // Keep as template HTML for Vue
    return `<template>\n${html}\n</template>`;
  }
  
  private htmlToAngular(html: string): string {
    // Keep as template HTML for Angular
    return html;
  }
}
