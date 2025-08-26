# 📦 **GUÍA COMPLETA: PUBLICAR EN GITHUB E INSTALAR EN MAC**

## 🎯 **PARTE 1: PUBLICAR EN GITHUB DESDE WINDOWS**

### Paso 1: Inicializar Git en tu proyecto
```bash
cd "C:\Users\alexb\OneDrive\Alexander's Studio\MCP WCAG"
git init
```

### Paso 2: Agregar todos los archivos
```bash
git add .
```

### Paso 3: Hacer el primer commit
```bash
git commit -m "Initial commit: MCP WCAG v3.0.1 - 10 accessibility tools"
```

### Paso 4: Crear repositorio en GitHub
1. Ve a https://github.com
2. Click en "New repository"
3. Nombre: `mcp-wcag`
4. Descripción: "MCP server for WCAG accessibility analysis"
5. Público o Privado (tu elección)
6. NO inicialices con README (ya tenemos uno)
7. Click "Create repository"

### Paso 5: Conectar y subir
```bash
# Reemplaza YOUR_USERNAME con tu usuario de GitHub
git remote add origin https://github.com/YOUR_USERNAME/mcp-wcag.git
git branch -M main
git push -u origin main
```

---

## 🎯 **PARTE 2: INSTALAR EN MAC**

### Método 1: Instalación Automática (RECOMENDADO)

#### En tu Mac, abre Terminal y ejecuta:
```bash
# 1. Clonar el repositorio
git clone https://github.com/YOUR_USERNAME/mcp-wcag.git
cd mcp-wcag

# 2. Dar permisos al script de instalación
chmod +x install.sh

# 3. Ejecutar instalación automática
./install.sh
```

El script automáticamente:
- ✅ Verificará Node.js 18+
- ✅ Instalará dependencias
- ✅ Compilará el proyecto
- ✅ Configurará Claude Desktop
- ✅ Verificará la instalación

---

### Método 2: Instalación Manual

#### Si prefieres hacerlo manualmente:
```bash
# 1. Clonar repositorio
git clone https://github.com/YOUR_USERNAME/mcp-wcag.git
cd mcp-wcag

# 2. Instalar dependencias
npm install

# 3. Compilar TypeScript
npm run build

# 4. Verificar instalación
npm run verify

# 5. Obtener la ruta absoluta
pwd
# Ejemplo: /Users/alex/projects/mcp-wcag
```

#### Configurar Claude Desktop en Mac:
```bash
# 1. Abrir el archivo de configuración
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json

# 2. Agregar esta configuración (reemplaza PATH con tu ruta):
{
  "mcpServers": {
    "wcag-accessibility": {
      "command": "node",
      "args": ["/Users/alex/projects/mcp-wcag/dist/index.js"]
    }
  }
}

# 3. Guardar y salir (Ctrl+X, Y, Enter)
```

---

## 📱 **PARTE 3: VERIFICAR EN MAC**

### 1. Reiniciar Claude Desktop
```bash
# Cerrar Claude completamente
killall Claude

# Abrir Claude nuevamente
open -a Claude
```

### 2. Probar las herramientas
En Claude, escribe:
```
Analyze this HTML for accessibility:
<img src="test.jpg">
<button></button>
```

### 3. Si hay problemas, verificar logs:
```bash
# Ver logs de Claude
tail -f ~/Library/Logs/Claude/mcp.log
```

---

## 🔄 **ACTUALIZAR EN EL FUTURO**

### En Windows (después de hacer cambios):
```bash
# Guardar cambios
git add .
git commit -m "Update: descripción del cambio"
git push
```

### En Mac (para obtener actualizaciones):
```bash
cd mcp-wcag
git pull
npm install  # Por si hay nuevas dependencias
npm run build
# Reiniciar Claude
```

---

## 📂 **ARCHIVOS QUE SE SUBIRÁN A GITHUB**

### ✅ SE INCLUYEN:
- `src/` - Todo el código fuente TypeScript
- `package.json` - Dependencias y scripts
- `tsconfig.json` - Configuración TypeScript
- `README.md` - Documentación
- `LICENSE` - Licencia MIT
- `.gitignore` - Archivos a ignorar
- `install.sh` - Script instalación Mac/Linux
- `install.bat` - Script instalación Windows
- `test-tools.mjs` - Script de prueba
- `verify.cjs` - Script de verificación

### ❌ NO SE INCLUYEN (gracias a .gitignore):
- `node_modules/` - Se instalan con npm install
- `dist/` - Se genera con npm run build
- `.env` - Variables de entorno (si las tuvieras)
- `*.log` - Archivos de logs

---

## 🛠️ **COMANDOS ÚTILES**

### En Windows (Git Bash recomendado):
```bash
# Ver estado de git
git status

# Ver historial
git log --oneline

# Crear nueva rama
git checkout -b feature/nueva-caracteristica

# Cambiar de rama
git checkout main
```

### En Mac (Terminal):
```bash
# Ver versión de Node
node --version

# Ver logs en tiempo real
npm run dev

# Limpiar y reconstruir
rm -rf dist
npm run build

# Ver tamaño del proyecto
du -sh .
```

---

## 🆘 **SOLUCIÓN DE PROBLEMAS**

### Problema: "Permission denied" en Mac
```bash
chmod +x install.sh
sudo npm install -g
```

### Problema: "Command not found: git" en Windows
- Instala Git desde: https://git-scm.com/download/win

### Problema: "Command not found: git" en Mac
```bash
# Instalar con Homebrew
brew install git

# O instalar Xcode Command Line Tools
xcode-select --install
```

### Problema: Claude no reconoce las herramientas
1. Verifica la ruta en el config:
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```
2. Asegúrate que la ruta sea absoluta y correcta
3. Reinicia Claude completamente

---

## 🎯 **CHECKLIST ANTES DE PUBLICAR**

- [ ] Cambiar "YOUR_USERNAME" en README.md
- [ ] Verificar que `npm run build` funciona
- [ ] Verificar que `npm run verify` pasa
- [ ] Actualizar información de contacto
- [ ] Decidir si será público o privado
- [ ] Agregar descripción en GitHub
- [ ] Agregar topics: `wcag`, `accessibility`, `mcp`, `claude`, `a11y`

---

## 🚀 **COMANDO RÁPIDO TODO-EN-UNO**

### Para subir todo a GitHub desde Windows:
```bash
git init && git add . && git commit -m "Initial commit: MCP WCAG v3.0.1" && git branch -M main && git remote add origin https://github.com/YOUR_USERNAME/mcp-wcag.git && git push -u origin main
```

### Para instalar en Mac:
```bash
git clone https://github.com/YOUR_USERNAME/mcp-wcag.git && cd mcp-wcag && chmod +x install.sh && ./install.sh
```

---

## ✅ **¡LISTO!**

Con estos pasos tendrás tu MCP WCAG:
1. ✅ Publicado en GitHub
2. ✅ Instalable en cualquier computadora
3. ✅ Funcionando en Mac y Windows
4. ✅ Fácil de actualizar y mantener

¿Necesitas ayuda con algún paso específico?
