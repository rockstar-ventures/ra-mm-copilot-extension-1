import { Store } from 'redux';
import { GlobalState } from 'mattermost-redux/types/store';
import { PluginRegistry } from 'mattermost-redux/types/plugins';

declare const React: typeof import('react');
declare const ReactDOM: typeof import('react-dom');

interface ChatWindowProps {
    onClose: () => void;
}

const ChatWindow = ({ onClose }: ChatWindowProps) => {
    console.log('ChatWindow component rendering'); // Debug log
    return React.createElement('div', {
        className: 'fixed right-4 bottom-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200',
        style: { 
            zIndex: 9999,
            position: 'fixed',
            right: '20px',
            bottom: '20px'
        }
    }, [
        // Header
        React.createElement('div', {
            key: 'header',
            className: 'p-4 border-b border-gray-200 flex justify-between items-center bg-blue-600 text-white rounded-t-lg'
        }, [
            React.createElement('h3', { 
                key: 'title',
                className: 'font-semibold'
            }, 'Mattermost Copilot'),
            React.createElement('button', {
                key: 'close',
                className: 'text-white hover:text-gray-200 text-xl font-bold',
                onClick: () => {
                    console.log('Close button clicked'); // Debug log
                    onClose();
                }
            }, '×')
        ]),
        
        // Test content to make sure it's visible
        React.createElement('div', {
            key: 'content',
            className: 'p-4 bg-white',
            style: { color: 'black' }
        }, 'Test Content - If you can see this, the window is rendering!')
    ]);
};

export default class Plugin {
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
            React.createElement('button', {
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

    private toggleChatWindow = () => {
        console.log('toggleChatWindow called');
        if (!this.chatWindowContainer) {
            console.error('Chat container is null!');
            return;
        }

        if (this.chatWindowContainer.children.length === 0) {
            console.log('Rendering chat window');
            try {
                ReactDOM.render(
                    React.createElement(ChatWindow, {
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
                ReactDOM.unmountComponentAtNode(this.chatWindowContainer);
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