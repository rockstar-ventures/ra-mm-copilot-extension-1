{
    "id": "com.mattermost.copilot-extension",
    "name": "Copilot Extension",
    "version": "1.0.0",
    "min_server_version": "10.0.0",
    "webapp": {
        "bundle_path": "webapp/dist/main.js"
    },
    "settings_schema": {
        "header": "Configure Copilot Extension",
        "footer": "This plugin extends Mattermost Copilot functionality.",
        "settings": [
            {
                "key": "BackendURL",
                "display_name": "Backend API URL",
                "type": "text",
                "help_text": "URL for your custom backend API",
                "placeholder": "https://your-api.example.com",
                "default": ""
            },
            {
                "key": "APIKey",
                "display_name": "API Key",
                "type": "text",
                "help_text": "API key for backend authentication",
                "placeholder": "your-api-key",
                "default": ""
            }
        ]
    }
}