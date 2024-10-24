@echo off
REM build.cmd
call npm run build

REM Create plugin directory structure
if not exist "dist\com.mattermost.copilot-extension\webapp\dist" mkdir "dist\com.mattermost.copilot-extension\webapp\dist"

REM Copy files
copy "dist\main.js" "dist\com.mattermost.copilot-extension\webapp\dist\"
copy "plugin.json" "dist\com.mattermost.copilot-extension\"

REM Create tar.gz (modified to use correct path)
cd dist
if exist "com.mattermost.copilot-extension" (
    tar -czf copilot-extension.tar.gz com.mattermost.copilot-extension
) else (
    echo Error: Directory com.mattermost.copilot-extension not found
    exit /b 1
)
cd ..

echo Build completed successfully!