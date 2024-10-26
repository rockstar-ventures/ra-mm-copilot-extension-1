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

    private readonly BACKEND_URL = 'http://localhost:8000';

    private originalFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = window.fetch.bind(window);
    private store!: Store<GlobalState>;
    private chatWindowContainer: HTMLDivElement | null = null;

    public async initialize(registry: PluginRegistry, store: Store<GlobalState>) {
        console.log('Plugin initialization started');
        this.store = store;

        // Create container with explicit styles
        this.chatWindowContainer = document.createElement('div');
        this.chatWindowContainer.id = 'copilot-chat-container';
        this.chatWindowContainer.style.position = 'relative';
        this.chatWindowContainer.style.zIndex = '9999';
        document.body.appendChild(this.chatWindowContainer);
        console.log('Chat container created:', this.chatWindowContainer);

        // Register button with explicit logging
        registry.registerChannelHeaderButtonAction(
            window.React.createElement('button', {
                className: "channel-header__icon",
                'aria-label': "Copilot Extension",
                onClick: () => {
                    console.log('Button clicked directly'); // This shouldn't fire
                }
            }, '🤖'),
            () => {
                console.log('Button action handler fired'); // This should fire
                this.toggleChatWindow();
            },
            'Copilot Extension',
            'Open Copilot Assistant'
        );

        console.log('Plugin initialization completed');
    }

    private async makeBackendRequest(endpoint: string, method: string, data?: any) {
        // Ensure endpoint has /invoke for POST requests
        const finalEndpoint = method === 'POST' ? `${endpoint}/invoke` : endpoint;
        const url = `${this.BACKEND_URL}${finalEndpoint}`;
        
        console.log('Making request to:', url);
        console.log('Method:', method);
        console.log('Data:', data);
    
        try {
            const response = await fetch(url, {
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
                }) : undefined
            });
    
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
        // Extract UI components and text from response
        const result = {
            text: '',
            uiComponent: null
        };
    
        if (response.output) {
            if (response.output.result) {
                result.text = response.output.result;
            }
            
            if (response.output.tool_result) {
                // Process tool results and create appropriate UI components
                switch (response.output.tool_result.type) {
                    case 'weather':
                        result.uiComponent = response.output.tool_result;
                        break;
                    // Add more cases for other tools
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
            chat_history: []  // Add chat history if you want to maintain context
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