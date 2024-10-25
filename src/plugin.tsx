import { Store } from 'redux';
import { GlobalState } from 'mattermost-redux/types/store';
import { PluginRegistry } from 'mattermost-redux/types/plugins';

declare global {
    interface Window {
        React: any;
    }
}

export default class Plugin {
    private originalFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = window.fetch.bind(window);

    public async initialize(registry: PluginRegistry, store: Store<GlobalState>) {
        console.log('Copilot extension plugin: Starting initialization');

        // Add a channel header button to make the plugin visible
        registry.registerChannelHeaderButtonAction(
            window.React.createElement('button', {
                className: "channel-header__icon",
                'aria-label': "Copilot Extension"
            }, '🤖'),
            () => {
                console.log('Copilot button clicked!');
                // Add your button click handler here
            },
            'Copilot Extension',
            'Open Copilot Assistant'
        );

        // Rest of your code...
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            console.log('Copilot extension plugin: Intercepted fetch request', { url: input });
            
            const url = typeof input === 'string' 
                ? input 
                : input instanceof URL 
                    ? input.toString() 
                    : input.url;
            
            if (url.includes('/api/v1/copilot') || url.includes('/mattermost-copilot/')) {
                console.log('Copilot extension plugin: Handling Copilot request');
                return this.handleCopilotRequest(url, init);
            }
            
            return this.originalFetch(input, init);
        };

        console.log('Copilot extension plugin: Initialization complete');
    }

    private async handleCopilotRequest(url: string, init?: RequestInit): Promise<Response> {
        try {
            // Extract the original request data
            const originalBody = init?.body ? JSON.parse(init.body as string) : {};
            
            // Get current Mattermost state
            const context = this.getMattermostContext();
            
            // Forward to your backend
            const response = await this.originalFetch('your-backend-url/api/copilot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(init?.headers || {})
                },
                body: JSON.stringify({
                    original_request: originalBody,
                    mattermost_context: context,
                    original_url: url
                })
            });

            // Transform response to match Copilot's format
            const responseData = await response.json();
            return new Response(JSON.stringify(this.transformResponse(responseData)), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

        } catch (error) {
            console.error('Error in Copilot interceptor:', error);
            // Fall back to original request
            return this.originalFetch(url, init);
        }
    }

    private getMattermostContext(): Record<string, any> {
        try {
            // Access global store if available
            const state = (window as any)?.store?.getState();
            return {
                currentTeam: state?.entities?.teams?.currentTeamId,
                currentChannel: state?.entities?.channels?.currentChannelId,
                currentUser: state?.entities?.users?.currentUserId
            };
        } catch (error) {
            console.error('Error getting Mattermost context:', error);
            return {};
        }
    }

    private transformResponse(backendResponse: any): any {
        // Transform your backend response to match Copilot's expected format
        return {
            type: 'copilot_response',
            text: backendResponse.response || '',
            suggestions: backendResponse.suggestions || [],
            metadata: backendResponse.metadata || {}
        };
    }
}