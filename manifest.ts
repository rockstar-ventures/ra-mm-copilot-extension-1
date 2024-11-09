export default {
    id: 'com.mattermost.copilot-extension',
    name: 'Copilot Extension',
    version: '1.0.0',
    min_server_version: '10.0.0',
    webapp: {
        bundle_path: 'webapp/dist/main.js'
    },
    settings_schema: {
        header: "Configure Copilot Extension",
        footer: "This plugin extends Mattermost with AI capabilities.",
        settings: [
            {
                key: "BackendURL",
                display_name: "Backend API URL",
                type: "text",
                help_text: "URL for the NLP backend service",
                placeholder: "https://your-backend-url.com",
                default: ""
            }
        ]
    }
}