#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando instalación de MCP WCAG...\n');

const checks = [
  {
    name: 'Node.js instalado',
    check: () => process.version,
    success: (result) => `✅ Node.js ${result} instalado`
  },
  {
    name: 'Archivo principal compilado',
    check: () => {
      const mainFile = path.join(__dirname, 'dist', 'index.js');
      return fs.existsSync(mainFile);
    },
    success: () => '✅ Archivo principal (dist/index.js) existe'
  },
  {
    name: 'Herramientas compiladas',
    check: () => {
      const tools = [
        'dist/tools/analyzeAccessibility.js',
        'dist/tools/refactorForWCAG.js',
        'dist/tools/validateCompliance.js',
        'dist/tools/getDocumentation.js',
        'dist/tools/annotateCode.js',
        'dist/tools/accessibilityScore.js',
        'dist/tools/generateComponent.js',
        'dist/tools/eslintConfig.js',
        'dist/tools/liveUrlAudit.js',
        'dist/tools/wcagGithubSync.js'
      ];
      return tools.every(tool => fs.existsSync(path.join(__dirname, tool)));
    },
    success: () => '✅ Todas las herramientas compiladas'
  },
  {
    name: 'Core compilado',
    check: () => {
      const coreFiles = [
        'dist/core/WCAGAnalyzer.js',
        'dist/core/AccessibilityFixer.js',
        'dist/core/CodeParser.js'
      ];
      return coreFiles.every(file => fs.existsSync(path.join(__dirname, file)));
    },
    success: () => '✅ Motor de accesibilidad compilado'
  },
  {
    name: 'Dependencias instaladas',
    check: () => {
      const deps = [
        'node_modules/@modelcontextprotocol/sdk',
        'node_modules/axe-core',
        'node_modules/jsdom',
        'node_modules/cheerio'
      ];
      return deps.every(dep => fs.existsSync(path.join(__dirname, dep)));
    },
    success: () => '✅ Todas las dependencias instaladas'
  }
];

let allPassed = true;

checks.forEach(({ name, check, success }) => {
  try {
    const result = check();
    if (result) {
      console.log(success(result));
    } else {
      console.log(`❌ ${name} - FALLO`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('\n🎉 ¡INSTALACIÓN EXITOSA!\n');
  console.log('✅ Tu MCP WCAG está listo para usar.\n');
  console.log('📋 Próximos pasos:');
  console.log('1. Ejecuta: npm run install-mcp');
  console.log('2. Reinicia Claude Desktop');
  console.log('3. Prueba las herramientas de accesibilidad\n');
  
  const configPath = path.join(__dirname, 'dist', 'index.js').replace(/\\/g, '\\\\');
  console.log('📌 Ruta para Claude Desktop config:');
  console.log(`   "${configPath}"\n`);
} else {
  console.log('\n❌ INSTALACIÓN INCOMPLETA\n');
  console.log('Por favor, ejecuta estos comandos:');
  console.log('1. npm install');
  console.log('2. npm run build\n');
}

console.log('='.repeat(50));
