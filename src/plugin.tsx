import { Store } from 'redux';
import { GlobalState } from 'mattermost-redux/types/store';
import { PluginRegistry } from 'mattermost-redux/types/plugins';
import ChatWindow from './components/ChatWindow';
import { backendService } from './services/BackendService';

declare global {
    interface Window {
        React: typeof import('react');
        ReactDOM: typeof import('react-dom');
        mattermost_webapp: {
            getPluginSettings: () => {
                BackendURL?: string;
                APIKey?: string;
            };
        };
    }
}

export default class Plugin {
    private readonly BACKEND_URL = 'https://34.36.144.151';
    private originalFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = window.fetch.bind(window);
    private store!: Store<GlobalState>;
    private chatWindowContainer: HTMLDivElement | null = null;

    public async initialize(registry: PluginRegistry, store: Store<GlobalState>) {
        console.log('Plugin initialization started');
        this.store = store;

        this.chatWindowContainer = document.createElement('div');
        this.chatWindowContainer.id = 'copilot-chat-container';
        this.chatWindowContainer.style.position = 'fixed';
        this.chatWindowContainer.style.right = '24px';
        this.chatWindowContainer.style.bottom = '24px';
        this.chatWindowContainer.style.zIndex = '9999';
        this.chatWindowContainer.style.width = '450px';
        this.chatWindowContainer.style.height = 'auto';
        document.body.appendChild(this.chatWindowContainer);
        console.log('Chat container created:', this.chatWindowContainer);

        registry.registerChannelHeaderButtonAction(
            window.React.createElement('button', {
                className: "channel-header__icon",
                'aria-label': "Copilot Extension",
                onClick: () => {
                    console.log('Button clicked directly');
                }
            }, '🤖'),
            () => {
                console.log('Button action handler fired');
                this.toggleChatWindow();
            },
            'Copilot Extension',
            'Open Copilot Assistant'
        );

        console.log('Plugin initialization completed');
    }

    private async makeBackendRequest(endpoint: string, method: string, data?: any) {
        const finalEndpoint = method === 'POST' ? `${endpoint}/invoke` : endpoint;
        const url = `${this.BACKEND_URL}${finalEndpoint}`;
        
        console.log('Making request to:', url);
        console.log('Method:', method);
        console.log('Data:', data);
    
        try {
            // TODO: Aniket : Create custom agent to ignore SSL certificate validation
            const requestOptions: RequestInit = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: data ? JSON.stringify({
                    input: {
                        input: data.input,
                        chat_history: data.chat_history || []
                    }
                }) : undefined,
                // TODO: Aniket: Add mode and credentials options for dev environment
                mode: 'cors',
                credentials: 'include',
                // @ts-ignore
                rejectUnauthorized: false,  // TODO: Aniket: Ignore SSL certificate validation
                agent: new (require('https').Agent)({ rejectUnauthorized: false })
            };

            const response = await fetch(url, requestOptions);
    
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const responseData = await response.json();
            console.log('Response data:', responseData);
            return responseData;
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }

    private async processResponse(response: any) {
        const result = {
            text: '',
            uiComponent: null
        };
    
        if (response.output) {
            if (response.output.result) {
                result.text = response.output.result;
            }
            
            if (response.output.tool_result) {
                switch (response.output.tool_result.type) {
                    case 'weather':
                        result.uiComponent = response.output.tool_result;
                        break;
                }
            }
        }
    
        return result;
    }
    
    private async sendChatMessage(message: string) {
        return this.makeBackendRequest('/chat', 'POST', {
            input: [{
                type: "human",
                content: message
            }],
            chat_history: []
        });
    }
    
    private toggleChatWindow = () => {
        console.log('toggleChatWindow called');
        if (!this.chatWindowContainer) {
            console.error('Chat container is null!');
            return;
        }

        if (this.chatWindowContainer.children.length === 0) {
            console.log('Rendering chat window');
            try {
                window.ReactDOM.render(
                    window.React.createElement(ChatWindow, {
                        onClose: () => {
                            console.log('Close handler called');
                            this.hideChatWindow();
                        }
                    }),
                    this.chatWindowContainer
                );
                console.log('Chat window rendered successfully');
            } catch (error) {
                console.error('Error rendering chat window:', error);
            }
        } else {
            console.log('Hiding chat window');
            this.hideChatWindow();
        }
    };

    private hideChatWindow = () => {
        console.log('hideChatWindow called');
        if (this.chatWindowContainer) {
            try {
                window.ReactDOM.unmountComponentAtNode(this.chatWindowContainer);
                console.log('Chat window unmounted successfully');
            } catch (error) {
                console.error('Error unmounting chat window:', error);
            }
        }
    };

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
}