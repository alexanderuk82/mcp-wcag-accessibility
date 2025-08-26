# ⚠️ SOLUCIÓN AL PROBLEMA DE DETECCIÓN DEL MCP

## ❌ EL PROBLEMA
Claude Desktop no detectaba el MCP porque estaba en la sección incorrecta del archivo de configuración.

### Configuración INCORRECTA:
```json
{
  "mcps": {  // ❌ SECCIÓN INCORRECTA
    "wcag-accessibility": { ... }
  }
}
```

### Configuración CORRECTA:
```json
{
  "mcpServers": {  // ✅ SECCIÓN CORRECTA
    "wcag-accessibility": { ... }
  }
}
```

---

## ✅ YA ESTÁ ARREGLADO

He movido tu MCP a la sección correcta. La configuración ahora está en:
`C:\Users\alexb\AppData\Roaming\Claude\claude_desktop_config.json`

---

## 🚀 PASOS PARA QUE FUNCIONE

### 1. CIERRA CLAUDE DESKTOP COMPLETAMENTE
- **NO solo cierres la ventana**
- Ve a la **bandeja del sistema** (junto al reloj)
- Busca el icono de Claude
- **Click derecho → Salir/Exit**

### 2. ESPERA 5 SEGUNDOS

### 3. VUELVE A ABRIR CLAUDE DESKTOP

### 4. PRUEBA EL MCP
Escribe en Claude:
```
Analiza la accesibilidad de:
<img src="test.jpg">
<button></button>
```

---

## 🧪 VERIFICACIÓN RÁPIDA

En Claude Desktop, pregunta:
```
¿Qué herramientas MCP tienes disponibles?
```

Deberías ver algo como:
- analyze_accessibility
- refactor_for_wcag
- validate_compliance
- get_documentation

---

## 🔍 SI AÚN NO FUNCIONA

### Opción 1: Verifica el path
```bash
cd "C:\Users\alexb\OneDrive\Alexander's Studio\MCP WCAG"
dir dist\index.js
```
El archivo debe existir.

### Opción 2: Reinstala la configuración
```bash
npm run install-mcp
```

### Opción 3: Verifica manualmente
Abre: `%APPDATA%\Claude\claude_desktop_config.json`

Busca esta sección:
```json
"mcpServers": {
  ...
  "wcag-accessibility": {
    "command": "node",
    "args": ["C:\\Users\\alexb\\OneDrive\\Alexander's Studio\\MCP WCAG\\dist\\index.js"]
  }
}
```

---

## 📝 NOTA IMPORTANTE

**El MCP DEBE estar en la sección `mcpServers`, NO en `mcps`**

Esta es la diferencia clave que causaba el problema.

---

## ✨ RESUMEN

1. ✅ Configuración movida a la sección correcta
2. ✅ Script de instalación actualizado
3. ✅ Todo listo para funcionar

**Solo necesitas reiniciar Claude Desktop completamente.**

---

¡Tu MCP WCAG ahora debería funcionar perfectamente! 🎉
