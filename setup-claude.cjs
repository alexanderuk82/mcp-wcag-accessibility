// Script para configurar Claude Desktop automáticamente
const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_PATH = path.join(
  os.homedir(),
  'AppData',
  'Roaming',
  'Claude',
  'claude_desktop_config.json'
);

const MCP_PATH = path.join(__dirname, 'dist', 'index.js');

console.log('🔧 Configurando Claude Desktop para MCP WCAG...\n');

// Leer configuración existente o crear nueva
let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf8');
    config = JSON.parse(content);
    console.log('✅ Configuración existente encontrada');
  } catch (error) {
    console.log('⚠️  Error leyendo configuración, creando nueva...');
  }
} else {
  console.log('📝 Creando nueva configuración...');
}

// Asegurar estructura correcta - IMPORTANTE: mcpServers, no mcps
if (!config.mcpServers) {
  config.mcpServers = {};
}

// Remover de la sección incorrecta si existe
if (config.mcps && config.mcps['wcag-accessibility']) {
  delete config.mcps['wcag-accessibility'];
  if (Object.keys(config.mcps).length === 0) {
    delete config.mcps;
  }
}

// Agregar o actualizar MCP WCAG en la sección correcta
config.mcpServers['wcag-accessibility'] = {
  command: 'node',
  args: [MCP_PATH]
};

// Guardar configuración
try {
  // Crear directorio si no existe
  const configDir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  
  console.log('\n✅ ¡Configuración completada con éxito!\n');
  console.log('📋 Configuración guardada en:');
  console.log(`   ${CONFIG_PATH}\n`);
  console.log('🚀 Próximos pasos:');
  console.log('   1. Cierra Claude Desktop COMPLETAMENTE');
  console.log('   2. Vuelve a abrir Claude Desktop');
  console.log('   3. Prueba escribiendo: "Analiza este código para accesibilidad"');
  console.log('\n⚠️  IMPORTANTE: Debes cerrar Claude Desktop completamente');
  console.log('   No solo minimizarlo - ciérralo desde la bandeja del sistema');
  console.log('\n✨ ¡Tu MCP WCAG está listo para usar!');
} catch (error) {
  console.error('❌ Error guardando configuración:', error.message);
  console.log('\n📝 Configuración manual necesaria:');
  console.log(`   Abre: ${CONFIG_PATH}`);
  console.log('   En la sección "mcpServers", agrega:\n');
  console.log(JSON.stringify({
    'wcag-accessibility': {
      command: 'node',
      args: [MCP_PATH]
    }
  }, null, 2));
}
