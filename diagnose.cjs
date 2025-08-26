const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔍 DIAGNÓSTICO DE MCP WCAG\n');
console.log('='.repeat(50));

const CONFIG_PATH = path.join(
  os.homedir(),
  'AppData',
  'Roaming',
  'Claude',
  'claude_desktop_config.json'
);

const MCP_PATH = path.join(__dirname, 'dist', 'index.js');

// 1. Verificar archivo compilado
console.log('\n1️⃣ VERIFICANDO ARCHIVO COMPILADO:');
if (fs.existsSync(MCP_PATH)) {
  console.log('   ✅ dist/index.js existe');
} else {
  console.log('   ❌ dist/index.js NO EXISTE - Ejecuta: npm run build');
}

// 2. Verificar configuración de Claude
console.log('\n2️⃣ VERIFICANDO CONFIGURACIÓN DE CLAUDE:');
if (fs.existsSync(CONFIG_PATH)) {
  console.log('   ✅ Archivo de configuración encontrado');
  
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    
    // Verificar sección incorrecta
    if (config.mcps && config.mcps['wcag-accessibility']) {
      console.log('   ⚠️  MCP en sección INCORRECTA (mcps)');
      console.log('   ❌ Necesita moverse a "mcpServers"');
    }
    
    // Verificar sección correcta
    if (config.mcpServers && config.mcpServers['wcag-accessibility']) {
      console.log('   ✅ MCP en sección CORRECTA (mcpServers)');
      
      const configuredPath = config.mcpServers['wcag-accessibility'].args[0];
      const expectedPath = MCP_PATH;
      
      console.log('\n3️⃣ VERIFICANDO RUTAS:');
      console.log('   Configurada:', configuredPath);
      console.log('   Esperada:   ', expectedPath);
      
      if (configuredPath === expectedPath || 
          configuredPath === expectedPath.replace(/\\/g, '\\\\')) {
        console.log('   ✅ Ruta correcta');
      } else {
        console.log('   ⚠️  Las rutas no coinciden exactamente');
      }
    } else if (!config.mcps || !config.mcps['wcag-accessibility']) {
      console.log('   ❌ MCP NO CONFIGURADO');
      console.log('   Ejecuta: npm run install-mcp');
    }
    
    // Contar otros MCPs
    const mcpCount = config.mcpServers ? Object.keys(config.mcpServers).length : 0;
    console.log(`\n4️⃣ OTROS MCPs INSTALADOS: ${mcpCount}`);
    
  } catch (error) {
    console.log('   ❌ Error leyendo configuración:', error.message);
  }
} else {
  console.log('   ❌ No se encuentra el archivo de configuración');
  console.log('   Ruta esperada:', CONFIG_PATH);
}

console.log('\n' + '='.repeat(50));

// Diagnóstico final
console.log('\n📊 DIAGNÓSTICO FINAL:\n');

if (fs.existsSync(MCP_PATH) && fs.existsSync(CONFIG_PATH)) {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    
    if (config.mcpServers && config.mcpServers['wcag-accessibility']) {
      console.log('✅ TODO CONFIGURADO CORRECTAMENTE');
      console.log('\n⚠️  IMPORTANTE:');
      console.log('   1. CIERRA Claude Desktop COMPLETAMENTE');
      console.log('      (desde la bandeja del sistema)');
      console.log('   2. Vuelve a abrirlo');
      console.log('   3. El MCP debería funcionar');
    } else if (config.mcps && config.mcps['wcag-accessibility']) {
      console.log('❌ CONFIGURACIÓN EN SECCIÓN INCORRECTA');
      console.log('\n🔧 SOLUCIÓN:');
      console.log('   Ejecuta: npm run install-mcp');
      console.log('   Esto moverá el MCP a la sección correcta');
    } else {
      console.log('❌ MCP NO CONFIGURADO');
      console.log('\n🔧 SOLUCIÓN:');
      console.log('   Ejecuta: npm run install-mcp');
    }
  } catch (error) {
    console.log('❌ ERROR EN LA CONFIGURACIÓN');
    console.log('   Ejecuta: npm run install-mcp');
  }
} else {
  console.log('❌ INSTALACIÓN INCOMPLETA');
  console.log('\n🔧 SOLUCIÓN:');
  if (!fs.existsSync(MCP_PATH)) {
    console.log('   1. npm run build');
  }
  console.log('   2. npm run install-mcp');
}

console.log('\n' + '='.repeat(50));
console.log('\n💡 Si necesitas ayuda, revisa FIX_DETECTION.md');
