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
    private store!: Store<GlobalState>;

    public async initialize(registry: PluginRegistry, store: Store<GlobalState>) {
        console.log('Copilot extension plugin: Starting initialization');
        this.store = store;

        // Add a channel header button to make the plugin visible
        registry.registerChannelHeaderButtonAction(
            window.React.createElement('button', {
                className: "channel-header__icon",
                'aria-label': "Copilot Extension"
            }, '🤖'),
            () => {
                console.log('Copilot button clicked!');
                this.logChannelInfo();
            },
            'Copilot Extension',
            'Open Copilot Assistant'
        );

        // Intercept fetch requests
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            const url = typeof input === 'string' 
                ? input 
                : input instanceof URL 
                    ? input.toString() 
                    : input.url;
            
            // Log information based on the URL pattern
            if (url.includes('/api/v4/channels/members/me')) {
                console.log('Channel members request intercepted');
                await this.logChannelInfo();
            }
            else if (url.includes('/api/v4/posts') && init?.method === 'POST') {
                // Log when a new message is posted
                const postData = init.body ? JSON.parse(init.body as string) : {};
                console.log('New message posted:', {
                    channelId: postData.channel_id,
                    message: postData.message,
                    props: postData.props
                });
            }

            // Get the response
            const response = await this.originalFetch(input, init);
            
            // Clone the response so we can read its body
            const responseClone = response.clone();
            
            try {
                // For channel members endpoint, log the response data
                if (url.includes('/api/v4/channels/members/me')) {
                    const data = await responseClone.json();
                    console.log('Channel members response:', data);
                }
            } catch (error) {
                console.error('Error parsing response:', error);
            }

            return response;
        };

        console.log('Copilot extension plugin: Initialization complete');
    }

    private async logChannelInfo() {
        try {
            const state = this.store.getState();
            const currentChannelId = state?.entities?.channels?.currentChannelId;
            const currentTeamId = state?.entities?.teams?.currentTeamId;
            
            if (currentChannelId) {
                // Get channel members
                const membersResponse = await this.originalFetch(
                    `http://localhost:8065/api/v4/channels/${currentChannelId}/members`,
                    { method: 'GET' }
                );
                const members = await membersResponse.json();

                // Get channel messages
                const messagesResponse = await this.originalFetch(
                    `http://localhost:8065/api/v4/channels/${currentChannelId}/posts`,
                    { method: 'GET' }
                );
                const messages = await messagesResponse.json();

                console.log('Channel Information:', {
                    channelId: currentChannelId,
                    teamId: currentTeamId,
                    memberCount: members.length,
                    recentMessages: messages.posts ? Object.values(messages.posts).slice(0, 5) : [],
                    members: members
                });
            }
        } catch (error) {
            console.error('Error fetching channel information:', error);
        }
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
            const state = this.store.getState();
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