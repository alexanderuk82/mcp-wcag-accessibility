# 🚀 INSTRUCCIONES DE INICIO RÁPIDO

## ✅ PASO 1: INSTALAR DEPENDENCIAS
Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
cd "C:\Users\alexb\OneDrive\Alexander's Studio\MCP WCAG"
npm install
```

## ✅ PASO 2: PRIMER ARCHIVO - SERVIDOR MCP BÁSICO

### Crea el archivo principal del servidor:
**Archivo:** `src/index.ts`

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { analyzeAccessibilityTool } from './tools/analyzeAccessibility.js';
import { refactorForWCAGTool } from './tools/refactorForWCAG.js';

// Crear servidor MCP
const server = new Server(
  {
    name: 'wcag-accessibility',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Registrar herramientas
server.setRequestHandler('tools/list', async () => ({
  tools: [
    analyzeAccessibilityTool,
    refactorForWCAGTool,
  ],
}));

// Iniciar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP WCAG Server started successfully');
}

main().catch(console.error);
```

## ✅ PASO 3: CONFIGURACIÓN CLAUDE DESKTOP

### Ubicación del archivo de configuración:
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

### Agrega esta configuración:

```json
{
  "mcps": {
    "wcag-accessibility": {
      "command": "node",
      "args": ["C:\\Users\\alexb\\OneDrive\\Alexander's Studio\\MCP WCAG\\dist\\index.js"]
    }
  }
}
```

## ✅ PASO 4: COMPILAR Y EJECUTAR

```bash
# Compilar TypeScript a JavaScript
npm run build

# Probar localmente
npm run dev
```

## ✅ PASO 5: REINICIAR CLAUDE DESKTOP

1. Cierra completamente Claude Desktop
2. Vuelve a abrirlo
3. En Claude, escribe: "¿Qué herramientas MCP tienes disponibles?"
4. Deberías ver las herramientas de WCAG

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### HOY (Día 1):
1. ✅ Instalar dependencias
2. ✅ Crear servidor básico
3. ✅ Probar conexión con Claude

### MAÑANA (Día 2):
1. Implementar primera herramienta funcional
2. Integrar axe-core
3. Hacer primera prueba real

## 🆘 TROUBLESHOOTING

### Error: "No se encuentra el módulo"
```bash
npm install
npm run build
```

### Error: "Claude no ve las herramientas"
1. Verifica la ruta en `claude_desktop_config.json`
2. Asegúrate de que sea la ruta a `/dist/index.js`
3. Reinicia Claude Desktop completamente

### Error: "Permission denied"
Ejecuta el terminal como Administrador

## 📞 COMANDOS ÚTILES

```bash
# Ver logs en tiempo real
npm run dev

# Compilar para producción
npm run build

# Limpiar y recompilar
npm run clean && npm run build

# Ver errores de TypeScript
npx tsc --noEmit
```

## ⚡ DESARROLLO RÁPIDO

Para desarrollo rápido sin recompilar:
```bash
npm run dev
```

Esto ejecutará el código TypeScript directamente con `tsx`.

## 🎉 ¡LISTO PARA EMPEZAR!

Tu proyecto está configurado y listo para desarrollo.
Siguiente paso: ejecuta `npm install` y empieza a codificar.

---

**RECUERDA:** Todo es 100% GRATUITO y LOCAL en tu máquina.
