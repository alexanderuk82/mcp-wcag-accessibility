export const eslintConfigTool = {
  definition: {
    name: 'eslint_config',
    description: 'Generate ESLint configuration with accessibility rules for your project',
    inputSchema: {
      type: 'object',
      properties: {
        framework: {
          type: 'string',
          enum: ['react', 'vue', 'angular', 'vanilla', 'next', 'nuxt'],
          description: 'Framework for the project',
          default: 'react',
        },
        level: {
          type: 'string',
          enum: ['recommended', 'strict', 'custom'],
          description: 'Level of accessibility rules strictness',
          default: 'recommended',
        },
        typescript: {
          type: 'boolean',
          description: 'Include TypeScript support',
          default: false,
        },
        prettier: {
          type: 'boolean',
          description: 'Include Prettier integration',
          default: true,
        },
        outputFormat: {
          type: 'string',
          enum: ['json', 'js', 'yaml'],
          description: 'Output format for the config file',
          default: 'json',
        },
      },
      required: [],
    },
  },
  
  handler: async (args: any) => {
    const { 
      framework = 'react', 
      level = 'recommended', 
      typescript = false,
      prettier = true,
      outputFormat = 'json'
    } = args;
    
    try {
      // Generate base configuration
      const config = generateESLintConfig(framework, level, typescript, prettier);
      
      // Format based on output type
      let configOutput = '';
      let fileName = '';
      
      switch (outputFormat) {
        case 'json':
          configOutput = JSON.stringify(config, null, 2);
          fileName = '.eslintrc.json';
          break;
        case 'js':
          configOutput = `module.exports = ${JSON.stringify(config, null, 2)};`;
          fileName = '.eslintrc.js';
          break;
        case 'yaml':
          configOutput = jsonToYaml(config);
          fileName = '.eslintrc.yml';
          break;
      }
      
      // Generate package.json dependencies
      const dependencies = generateDependencies(framework, typescript, prettier);
      
      // Generate VS Code settings
      const vscodeSettings = generateVSCodeSettings();
      
      // Generate npm scripts
      const npmScripts = generateNpmScripts(framework, typescript);
      
      // Generate .eslintignore
      const eslintIgnore = generateEslintIgnore();
      
      const response = `
# 🔧 ESLint Accessibility Configuration Generated

## 📋 Configuration for: ${framework.toUpperCase()} ${typescript ? '+ TypeScript' : ''}

### ✅ Accessibility Level: ${level.toUpperCase()}

---

## 📝 ${fileName}

\`\`\`${outputFormat === 'yaml' ? 'yaml' : outputFormat === 'js' ? 'javascript' : 'json'}
${configOutput}
\`\`\`

---

## 📦 Required Dependencies

Add these to your \`package.json\`:

\`\`\`json
{
  "devDependencies": {
${Object.entries(dependencies).map(([pkg, version]) => `    "${pkg}": "${version}"`).join(',\n')}
  }
}
\`\`\`

### Install command:
\`\`\`bash
npm install --save-dev ${Object.keys(dependencies).join(' ')}
\`\`\`

---

## 📜 NPM Scripts

Add to your \`package.json\`:

\`\`\`json
{
  "scripts": {
${Object.entries(npmScripts).map(([name, cmd]) => `    "${name}": "${cmd}"`).join(',\n')}
  }
}
\`\`\`

---

## 🚫 .eslintignore

Create \`.eslintignore\` file:

\`\`\`
${eslintIgnore}
\`\`\`

---

## ⚙️ VS Code Settings

Add to \`.vscode/settings.json\`:

\`\`\`json
${JSON.stringify(vscodeSettings, null, 2)}
\`\`\`

---

## 📊 Accessibility Rules Included

### ${level === 'recommended' ? '✅ Recommended Rules' : level === 'strict' ? '🔒 Strict Rules' : '🎯 Custom Rules'}

${generateRulesList(framework, level)}

---

## 🎯 Usage Instructions

1. **Install dependencies:**
   \`\`\`bash
   npm install --save-dev ${Object.keys(dependencies).slice(0, 3).join(' ')}
   \`\`\`

2. **Create config file:**
   - Copy the ${fileName} content above
   - Save it in your project root

3. **Run linting:**
   \`\`\`bash
   npm run lint
   \`\`\`

4. **Auto-fix issues:**
   \`\`\`bash
   npm run lint:fix
   \`\`\`

5. **Check accessibility only:**
   \`\`\`bash
   npm run lint:a11y
   \`\`\`

---

## 🔍 Rule Severity Levels

- **error** 🔴 - Must fix, breaks accessibility
- **warn** 🟡 - Should fix, impacts accessibility
- **off** ⚪ - Disabled (not recommended)

---

## 📚 Additional Resources

- [ESLint Plugin JSX A11y](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)
- [ESLint Plugin Vue A11y](https://github.com/vue-a11y/eslint-plugin-vuejs-accessibility)
- [Angular ESLint](https://github.com/angular-eslint/angular-eslint)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 💡 Pro Tips

1. **Start with recommended** and gradually move to strict
2. **Use auto-fix** for quick wins: \`npm run lint:fix\`
3. **Add pre-commit hooks** with husky and lint-staged
4. **Integrate with CI/CD** to catch issues early
5. **Customize rules** based on your team's needs

---

## 🚀 Next Steps

1. Install the dependencies
2. Add the configuration files
3. Run \`npm run lint\` to see current issues
4. Fix critical accessibility issues first
5. Add to your CI/CD pipeline

${level === 'strict' ? `
⚠️ **Note:** Strict mode enables ALL accessibility rules.
This might generate many warnings initially. Consider starting with 'recommended' level.
` : ''}

---

*ESLint configuration generated with full WCAG compliance in mind*
*Customize rules as needed for your specific requirements*
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
            text: `Error generating ESLint config: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  },
};

function generateESLintConfig(framework: string, level: string, typescript: boolean, prettier: boolean): any {
  const baseConfig: any = {
    root: true,
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
  };
  
  // Framework-specific configurations
  switch (framework) {
    case 'react':
      return generateReactConfig(baseConfig, level, typescript, prettier);
    case 'vue':
      return generateVueConfig(baseConfig, level, typescript, prettier);
    case 'angular':
      return generateAngularConfig(baseConfig, level, typescript, prettier);
    case 'next':
      return generateNextConfig(baseConfig, level, typescript, prettier);
    case 'vanilla':
    default:
      return generateVanillaConfig(baseConfig, level, typescript, prettier);
  }
}

function generateReactConfig(base: any, level: string, typescript: boolean, prettier: boolean): any {
  const config = {
    ...base,
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:jsx-a11y/' + level,
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: [
      'react',
      'react-hooks',
      'jsx-a11y',
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: generateA11yRules('react', level),
  };
  
  if (typescript) {
    config.extends.push(
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/recommended-requiring-type-checking'
    );
    config.plugins.push('@typescript-eslint');
    (config as any).parser = '@typescript-eslint/parser';
    config.parserOptions.project = './tsconfig.json';
  }
  
  if (prettier) {
    config.extends.push('plugin:prettier/recommended');
    config.plugins.push('prettier');
  }
  
  return config;
}

function generateVueConfig(base: any, level: string, typescript: boolean, prettier: boolean): any {
  const config = {
    ...base,
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-recommended',
      'plugin:vuejs-accessibility/' + level,
    ],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: [
      'vue',
      'vuejs-accessibility',
    ],
    rules: generateA11yRules('vue', level),
  };
  
  if (typescript) {
    config.extends.push('plugin:@typescript-eslint/recommended');
    config.plugins.push('@typescript-eslint');
    config.parserOptions.parser = '@typescript-eslint/parser';
  }
  
  if (prettier) {
    config.extends.push('plugin:prettier/recommended');
  }
  
  return config;
}

function generateAngularConfig(base: any, level: string, _typescript: boolean, _prettier: boolean): any {
  return {
    ...base,
    extends: [
      'eslint:recommended',
      'plugin:@angular-eslint/recommended',
      'plugin:@angular-eslint/template/process-inline-templates',
    ],
    plugins: ['@angular-eslint'],
    rules: generateA11yRules('angular', level),
    overrides: [
      {
        files: ['*.ts'],
        parserOptions: {
          project: ['tsconfig.json'],
          createDefaultProgram: true,
        },
        extends: [
          'plugin:@angular-eslint/recommended',
          'plugin:@angular-eslint/template/process-inline-templates',
        ],
        rules: {
          '@angular-eslint/directive-selector': [
            'error',
            {
              type: 'attribute',
              prefix: 'app',
              style: 'camelCase',
            },
          ],
        },
      },
      {
        files: ['*.html'],
        extends: ['plugin:@angular-eslint/template/recommended'],
        rules: {
          '@angular-eslint/template/accessibility-alt-text': 'error',
          '@angular-eslint/template/accessibility-elements-content': 'error',
          '@angular-eslint/template/accessibility-label-has-associated-control': 'error',
        },
      },
    ],
  };
}

function generateNextConfig(base: any, level: string, typescript: boolean, prettier: boolean): any {
  const config = generateReactConfig(base, level, typescript, prettier);
  config.extends.unshift('next/core-web-vitals');
  return config;
}

function generateVanillaConfig(base: any, _level: string, typescript: boolean, prettier: boolean): any {
  const config = {
    ...base,
    extends: ['eslint:recommended'],
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Basic accessibility rules for vanilla JS
      'no-alert': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  };
  
  if (typescript) {
    config.extends.push('plugin:@typescript-eslint/recommended');
    (config as any).parser = '@typescript-eslint/parser';
  }
  
  if (prettier) {
    config.extends.push('plugin:prettier/recommended');
  }
  
  return config;
}

function generateA11yRules(framework: string, level: string): any {
  const rules: any = {};
  
  if (framework === 'react') {
    if (level === 'strict') {
      // All rules as errors
      rules['jsx-a11y/alt-text'] = 'error';
      rules['jsx-a11y/anchor-has-content'] = 'error';
      rules['jsx-a11y/anchor-is-valid'] = 'error';
      rules['jsx-a11y/aria-activedescendant-has-tabindex'] = 'error';
      rules['jsx-a11y/aria-props'] = 'error';
      rules['jsx-a11y/aria-proptypes'] = 'error';
      rules['jsx-a11y/aria-role'] = 'error';
      rules['jsx-a11y/aria-unsupported-elements'] = 'error';
      rules['jsx-a11y/autocomplete-valid'] = 'error';
      rules['jsx-a11y/click-events-have-key-events'] = 'error';
      rules['jsx-a11y/heading-has-content'] = 'error';
      rules['jsx-a11y/html-has-lang'] = 'error';
      rules['jsx-a11y/iframe-has-title'] = 'error';
      rules['jsx-a11y/img-redundant-alt'] = 'error';
      rules['jsx-a11y/interactive-supports-focus'] = 'error';
      rules['jsx-a11y/label-has-associated-control'] = 'error';
      rules['jsx-a11y/lang'] = 'error';
      rules['jsx-a11y/media-has-caption'] = 'error';
      rules['jsx-a11y/mouse-events-have-key-events'] = 'error';
      rules['jsx-a11y/no-access-key'] = 'error';
      rules['jsx-a11y/no-autofocus'] = 'error';
      rules['jsx-a11y/no-distracting-elements'] = 'error';
      rules['jsx-a11y/no-interactive-element-to-noninteractive-role'] = 'error';
      rules['jsx-a11y/no-noninteractive-element-interactions'] = 'error';
      rules['jsx-a11y/no-noninteractive-element-to-interactive-role'] = 'error';
      rules['jsx-a11y/no-noninteractive-tabindex'] = 'error';
      rules['jsx-a11y/no-redundant-roles'] = 'error';
      rules['jsx-a11y/no-static-element-interactions'] = 'error';
      rules['jsx-a11y/role-has-required-aria-props'] = 'error';
      rules['jsx-a11y/role-supports-aria-props'] = 'error';
      rules['jsx-a11y/scope'] = 'error';
      rules['jsx-a11y/tabindex-no-positive'] = 'error';
    } else if (level === 'custom') {
      // Custom balanced rules
      rules['jsx-a11y/alt-text'] = 'error';
      rules['jsx-a11y/anchor-is-valid'] = 'warn';
      rules['jsx-a11y/aria-props'] = 'error';
      rules['jsx-a11y/aria-role'] = 'error';
      rules['jsx-a11y/click-events-have-key-events'] = 'warn';
      rules['jsx-a11y/heading-has-content'] = 'error';
      rules['jsx-a11y/html-has-lang'] = 'error';
      rules['jsx-a11y/img-redundant-alt'] = 'warn';
      rules['jsx-a11y/label-has-associated-control'] = 'error';
      rules['jsx-a11y/no-autofocus'] = 'warn';
      rules['jsx-a11y/tabindex-no-positive'] = 'error';
    }
    // Recommended level uses plugin defaults
  }
  
  if (framework === 'vue') {
    if (level === 'strict') {
      rules['vuejs-accessibility/alt-text'] = 'error';
      rules['vuejs-accessibility/anchor-has-content'] = 'error';
      rules['vuejs-accessibility/aria-props'] = 'error';
      rules['vuejs-accessibility/aria-role'] = 'error';
      rules['vuejs-accessibility/aria-unsupported-elements'] = 'error';
      rules['vuejs-accessibility/click-events-have-key-events'] = 'error';
      rules['vuejs-accessibility/form-control-has-label'] = 'error';
      rules['vuejs-accessibility/heading-has-content'] = 'error';
      rules['vuejs-accessibility/iframe-has-title'] = 'error';
      rules['vuejs-accessibility/interactive-supports-focus'] = 'error';
      rules['vuejs-accessibility/label-has-for'] = 'error';
      rules['vuejs-accessibility/media-has-caption'] = 'error';
      rules['vuejs-accessibility/mouse-events-have-key-events'] = 'error';
      rules['vuejs-accessibility/no-access-key'] = 'error';
      rules['vuejs-accessibility/no-autofocus'] = 'error';
      rules['vuejs-accessibility/no-distracting-elements'] = 'error';
      rules['vuejs-accessibility/no-redundant-roles'] = 'error';
      rules['vuejs-accessibility/role-has-required-aria-props'] = 'error';
      rules['vuejs-accessibility/tabindex-no-positive'] = 'error';
    }
  }
  
  return rules;
}

function generateDependencies(framework: string, typescript: boolean, prettier: boolean): any {
  const deps: any = {
    'eslint': '^8.56.0',
  };
  
  switch (framework) {
    case 'react':
      deps['eslint-plugin-react'] = '^7.33.0';
      deps['eslint-plugin-react-hooks'] = '^4.6.0';
      deps['eslint-plugin-jsx-a11y'] = '^6.8.0';
      break;
    case 'vue':
      deps['eslint-plugin-vue'] = '^9.20.0';
      deps['eslint-plugin-vuejs-accessibility'] = '^2.2.0';
      deps['vue-eslint-parser'] = '^9.4.0';
      break;
    case 'angular':
      deps['@angular-eslint/eslint-plugin'] = '^17.0.0';
      deps['@angular-eslint/eslint-plugin-template'] = '^17.0.0';
      deps['@angular-eslint/template-parser'] = '^17.0.0';
      break;
    case 'next':
      deps['eslint-config-next'] = '^14.0.0';
      deps['eslint-plugin-react'] = '^7.33.0';
      deps['eslint-plugin-react-hooks'] = '^4.6.0';
      deps['eslint-plugin-jsx-a11y'] = '^6.8.0';
      break;
  }
  
  if (typescript) {
    deps['@typescript-eslint/parser'] = '^6.19.0';
    deps['@typescript-eslint/eslint-plugin'] = '^6.19.0';
    deps['typescript'] = '^5.3.0';
  }
  
  if (prettier) {
    deps['prettier'] = '^3.2.0';
    deps['eslint-config-prettier'] = '^9.1.0';
    deps['eslint-plugin-prettier'] = '^5.1.0';
  }
  
  return deps;
}

function generateVSCodeSettings(): any {
  return {
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': true,
    },
    'eslint.validate': [
      'javascript',
      'javascriptreact',
      'typescript',
      'typescriptreact',
      'vue',
      'html',
    ],
    'eslint.options': {
      'extensions': ['.js', '.jsx', '.ts', '.tsx', '.vue'],
    },
    'editor.formatOnSave': false,
  };
}

function generateNpmScripts(framework: string, typescript: boolean): any {
  const scripts: any = {
    'lint': 'eslint .',
    'lint:fix': 'eslint . --fix',
    'lint:a11y': 'eslint . --ext .jsx,.tsx --rule "jsx-a11y/*: error"',
  };
  
  if (framework === 'vue') {
    scripts.lint = 'eslint . --ext .js,.jsx,.ts,.tsx,.vue';
  }
  
  if (framework === 'angular') {
    scripts.lint = 'ng lint';
  }
  
  if (typescript) {
    scripts['type-check'] = 'tsc --noEmit';
  }
  
  return scripts;
}

function generateEslintIgnore(): string {
  return `node_modules/
dist/
build/
coverage/
.next/
.nuxt/
*.min.js
*.config.js
public/`;
}

function generateRulesList(framework: string, level: string): string {
  const rules = {
    react: {
      recommended: [
        '✅ alt-text - Enforce alt text for images',
        '✅ aria-props - Validate ARIA props',
        '✅ aria-role - Validate ARIA roles',
        '✅ heading-has-content - Headings must have content',
        '✅ html-has-lang - HTML element must have lang',
        '✅ iframe-has-title - iframes must have title',
        '✅ img-redundant-alt - Avoid redundant alt text',
        '✅ label-has-associated-control - Labels must be associated',
      ],
      strict: [
        '🔒 All recommended rules PLUS:',
        '🔒 click-events-have-key-events - Click must have keyboard event',
        '🔒 no-autofocus - No autofocus attribute',
        '🔒 no-static-element-interactions - No interactions on static elements',
        '🔒 mouse-events-have-key-events - Mouse events need keyboard equivalents',
        '🔒 media-has-caption - Media must have captions',
        '🔒 no-noninteractive-element-interactions - Non-interactive elements should not have handlers',
        '🔒 tabindex-no-positive - No positive tabindex',
      ],
    },
    vue: {
      recommended: [
        '✅ alt-text - Images must have alt text',
        '✅ form-control-has-label - Form controls need labels',
        '✅ heading-has-content - Headings need content',
        '✅ iframe-has-title - iframes need titles',
        '✅ label-has-for - Labels need for attribute',
      ],
      strict: [
        '🔒 All recommended rules PLUS:',
        '🔒 click-events-have-key-events - Keyboard support for click',
        '🔒 mouse-events-have-key-events - Keyboard support for mouse',
        '🔒 no-autofocus - Avoid autofocus',
        '🔒 media-has-caption - Media needs captions',
        '🔒 interactive-supports-focus - Interactive elements must be focusable',
      ],
    },
    angular: [
      '✅ accessibility-alt-text - Images need alt text',
      '✅ accessibility-elements-content - Elements need content',
      '✅ accessibility-label-has-associated-control - Labels need controls',
      '✅ no-positive-tabindex - No positive tabindex values',
    ],
    vanilla: [
      '✅ Basic JavaScript best practices',
      '✅ No console statements in production',
      '✅ Prefer const over let/var',
      '✅ No alert dialogs',
    ],
  };
  
  if (framework === 'next') {
    const nextRules = rules.react[level as keyof typeof rules.react];
    if (Array.isArray(nextRules)) {
      return nextRules.join('\n');
    }
    return rules.react.recommended.join('\n');
  }
  
  const frameworkRules = rules[framework as keyof typeof rules];
  if (Array.isArray(frameworkRules)) {
    return frameworkRules.join('\n');
  }
  
  return frameworkRules?.[level as keyof typeof frameworkRules]?.join('\n') || 
         frameworkRules?.recommended?.join('\n') || 
         'Standard accessibility rules';
}

function jsonToYaml(obj: any, indent: number = 0): string {
  let yaml = '';
  const spaces = '  '.repeat(indent);
  
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object') {
          yaml += `${spaces}  -\n`;
          yaml += jsonToYaml(item, indent + 2);
        } else {
          yaml += `${spaces}  - ${item}\n`;
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      yaml += `${spaces}${key}:\n`;
      yaml += jsonToYaml(value, indent + 1);
    } else {
      yaml += `${spaces}${key}: ${value}\n`;
    }
  }
  
  return yaml;
}
