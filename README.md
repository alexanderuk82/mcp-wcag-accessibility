# MCP WCAG Accessibility Tool 🦾

A powerful Model Context Protocol (MCP) server for comprehensive WCAG accessibility analysis and code remediation.

## 🌟 Features

- **10 Professional Tools** for accessibility analysis
- **WCAG 2.0, 2.1, 2.2** support
- **Multi-framework** support (HTML, React, Vue, Angular)
- **Live URL auditing** capability
- **ESLint configuration** generator
- **Automatic code refactoring**
- **GitHub WCAG repository** integration
- **10 languages** supported

## 🛠️ Available Tools

1. **analyze_accessibility** - Analyze code for WCAG violations
2. **refactor_for_wcag** - Automatically fix accessibility issues
3. **validate_compliance** - Check WCAG compliance levels (A, AA, AAA)
4. **get_documentation** - Get WCAG documentation for specific rules
5. **annotate_code** - Add inline comments with accessibility issues
6. **accessibility_score** - Calculate detailed accessibility score (0-100)
7. **generate_component** - Generate accessible component templates
8. **eslint_config** - Generate ESLint configuration with a11y rules
9. **live_url_audit** - Audit live websites for accessibility
10. **wcag_github_sync** - Sync with official WCAG GitHub repository

## 📋 Prerequisites

- Node.js 18+ (tested with v22.14.0)
- npm or yarn
- Claude Desktop app

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/mcp-wcag.git
cd mcp-wcag
```

### 2. Install dependencies
```bash
npm install
```

### 3. Build the project
```bash
npm run build
```

### 4. Verify installation
```bash
npm run verify
```

## ⚙️ Claude Desktop Configuration

### Windows
Add to `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wcag-accessibility": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp-wcag\\dist\\index.js"]
    }
  }
}
```

### Mac/Linux
Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wcag-accessibility": {
      "command": "node",
      "args": ["/path/to/mcp-wcag/dist/index.js"]
    }
  }
}
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test individual tools:
```bash
node test-tools.mjs
```

## 📖 Usage Examples

### Analyze HTML for accessibility
```
Analyze this HTML for WCAG AA compliance:
<html>
  <img src="test.jpg">
  <button></button>
</html>
```

### Generate ESLint configuration
```
Generate an ESLint configuration for React with TypeScript and accessibility rules
```

### Audit a live website
```
Analyze https://example.com for accessibility issues
```

### Generate accessible component
```
Generate an accessible modal component in React
```

## 🏗️ Project Structure

```
mcp-wcag/
├── src/
│   ├── index.ts           # Main server entry point
│   ├── core/
│   │   ├── WCAGAnalyzer.ts
│   │   ├── CodeParser.ts
│   │   └── AccessibilityFixer.ts
│   ├── rules/
│   │   └── wcagRules.ts
│   └── tools/
│       ├── analyzeAccessibility.ts
│       ├── refactorForWCAG.ts
│       ├── validateCompliance.ts
│       └── ... (7 more tools)
├── dist/                  # Compiled JavaScript
├── wcag-data/            # Local WCAG data cache
├── package.json
├── tsconfig.json
└── README.md
```

## 🔄 Development

### Watch mode
```bash
npm run dev
```

### Lint code
```bash
npm run lint
```

### Format code
```bash
npm run format
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: `require is not defined`
- **Solution**: Project uses ES modules. All imports must use `import` syntax.

**Issue**: Server crashes on startup
- **Solution**: Run `npm run verify` to check installation

**Issue**: Tools not showing in Claude
- **Solution**: Restart Claude Desktop after configuration

## 📊 WCAG Coverage

- **Automated detection**: ~30-40% of WCAG criteria
- **Success criteria**: 225 total (2.0, 2.1, 2.2)
- **Techniques**: 850+ documented
- **Code examples**: 500+
- **Languages**: 10 (EN, ES, FR, DE, PT, IT, NL, JA, KO, ZH)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- W3C WAI for WCAG specifications
- Deque Systems for axe-core inspiration
- Claude/Anthropic for MCP framework
- WCAG community for guidelines

## 📧 Contact

- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Project Link: [https://github.com/YOUR_USERNAME/mcp-wcag](https://github.com/YOUR_USERNAME/mcp-wcag)

## 🚀 Version History

- **v3.0.1** - Bug fixes for ES modules and error handling
- **v3.0.0** - Added GitHub WCAG sync
- **v2.1.0** - Added ESLint config and live URL audit
- **v2.0.0** - Added scoring, annotation, and component generation
- **v1.0.0** - Initial release with 4 core tools

---

**Made with ❤️ for web accessibility**
