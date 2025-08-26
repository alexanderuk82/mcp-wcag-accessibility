#!/bin/bash

# MCP WCAG Installation Script for Mac/Linux
# This script automates the installation process

echo "🚀 MCP WCAG Accessibility Tool - Installation Script"
echo "===================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
check_node() {
    echo -e "${YELLOW}Checking Node.js installation...${NC}"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "${GREEN}✅ Node.js $NODE_VERSION installed${NC}"
        
        # Check if version is 18+
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
        if [ $MAJOR_VERSION -lt 18 ]; then
            echo -e "${RED}❌ Node.js 18+ required. Current version: $NODE_VERSION${NC}"
            exit 1
        fi
    else
        echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first${NC}"
        echo "Visit: https://nodejs.org/"
        exit 1
    fi
}

# Install dependencies
install_deps() {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
}

# Build the project
build_project() {
    echo -e "${YELLOW}Building the project...${NC}"
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Project built successfully${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
}

# Verify installation
verify_install() {
    echo -e "${YELLOW}Verifying installation...${NC}"
    npm run verify
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Installation verified${NC}"
    else
        echo -e "${RED}❌ Verification failed${NC}"
        exit 1
    fi
}

# Configure Claude Desktop
configure_claude() {
    echo -e "${YELLOW}Configuring Claude Desktop...${NC}"
    
    # Detect OS
    OS="unknown"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="mac"
        CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
    else
        echo -e "${RED}Unsupported OS: $OSTYPE${NC}"
        return
    fi
    
    # Get absolute path to this project
    PROJECT_PATH=$(pwd)
    
    echo "Detected OS: $OS"
    echo "Config path: $CONFIG_PATH"
    echo "Project path: $PROJECT_PATH"
    
    # Create config directory if it doesn't exist
    CONFIG_DIR=$(dirname "$CONFIG_PATH")
    mkdir -p "$CONFIG_DIR"
    
    # Check if config file exists
    if [ -f "$CONFIG_PATH" ]; then
        echo -e "${YELLOW}Existing config found. Backing up...${NC}"
        cp "$CONFIG_PATH" "$CONFIG_PATH.backup"
        echo "Backup saved to: $CONFIG_PATH.backup"
    fi
    
    # Create or update config
    cat > "$CONFIG_PATH" << EOF
{
  "mcpServers": {
    "wcag-accessibility": {
      "command": "node",
      "args": ["$PROJECT_PATH/dist/index.js"]
    }
  }
}
EOF
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Claude Desktop configured successfully${NC}"
        echo -e "${YELLOW}Path added: $PROJECT_PATH/dist/index.js${NC}"
    else
        echo -e "${RED}❌ Failed to configure Claude Desktop${NC}"
    fi
}

# Main installation flow
main() {
    echo ""
    echo "Starting installation..."
    echo ""
    
    check_node
    install_deps
    build_project
    verify_install
    
    echo ""
    echo -e "${YELLOW}Would you like to configure Claude Desktop automatically? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        configure_claude
    else
        echo ""
        echo "Manual configuration needed. Add this to your Claude config:"
        echo ""
        echo '{
  "mcpServers": {
    "wcag-accessibility": {
      "command": "node",
      "args": ["'$(pwd)'/dist/index.js"]
    }
  }
}'
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Installation complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Restart Claude Desktop"
    echo "2. Test with: 'Analyze this HTML for accessibility: <img src=\"test.jpg\">'"
    echo ""
    echo "Available tools:"
    echo "  - analyze_accessibility"
    echo "  - refactor_for_wcag"
    echo "  - validate_compliance"
    echo "  - get_documentation"
    echo "  - annotate_code"
    echo "  - accessibility_score"
    echo "  - generate_component"
    echo "  - eslint_config"
    echo "  - live_url_audit"
    echo "  - wcag_github_sync"
    echo ""
}

# Run main installation
main
