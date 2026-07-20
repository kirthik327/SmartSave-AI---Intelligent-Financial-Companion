#!/bin/bash
echo "=== Starting SmartSave AI Automated Build ==="

# 1. Install frontend packages
echo "Installing frontend dependencies..."
npm install --prefix frontend

# 2. Build frontend production bundles
echo "Compiling React source files..."
npm run build --prefix frontend

# 3. Create root output directory and copy files
echo "Creating static deployment directory..."
mkdir -p dist
cp -R frontend/dist/* dist/

echo "=== Build Completed Successfully ==="
