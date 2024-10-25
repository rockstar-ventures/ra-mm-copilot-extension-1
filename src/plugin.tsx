import { Store } from 'redux';
import { GlobalState } from 'mattermost-redux/types/store';
import { PluginRegistry } from 'mattermost-redux/types/plugins';

declare const React: typeof import('react');
declare const ReactDOM: typeof import('react-dom');

interface ChatMessage {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

interface ChatWindowProps {
    onClose: () => void;
}

const ChatWindow = ({ onClose }: ChatWindowProps) => {
    const [messages, setMessages] = React.useState<ChatMessage[]>([
        {
            id: '1',
            text: 'Hello! How can I assist you today?',
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async () => {
        if (!inputValue.trim()) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: inputValue,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // Simulate bot response (replace with actual API call)
        setTimeout(() => {
            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: `I received your message: "${inputValue}"`,
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        }, 1000);
    };

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
                className: 'text-white hover:text-gray-200 text-xl font-bold px-2',
                onClick: onClose
            }, '×')
        ]),
        
        // Messages Container
        React.createElement('div', {
            key: 'messages',
            className: 'flex-1 overflow-y-auto p-4',
            style: { backgroundColor: '#f5f5f5' }
        }, [
            ...messages.map(message => 
                React.createElement('div', {
                    key: message.id,
                    className: `flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-4`
                }, [
                    React.createElement('div', {
                        className: `max-w-[75%] p-3 rounded-lg ${
                            message.isBot 
                                ? 'bg-white text-black' 
                                : 'bg-blue-600 text-white'
                        }`,
                        style: {
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }
                    }, message.text)
                ])
            ),
            React.createElement('div', {
                key: 'messages-end',
                ref: messagesEndRef
            })
        ]),
        
        // Input Area
        React.createElement('div', {
            key: 'input',
            className: 'p-4 border-t border-gray-200 bg-white rounded-b-lg'
        }, [
            React.createElement('div', {
                className: 'flex space-x-2'
            }, [
                React.createElement('input', {
                    type: 'text',
                    value: inputValue,
                    onChange: (e: any) => setInputValue(e.target.value),
                    onKeyPress: (e: any) => {
                        if (e.key === 'Enter') {
                            handleSubmit();
                        }
                    },
                    placeholder: 'Type your message...',
                    className: 'flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                }),
                React.createElement('button', {
                    onClick: handleSubmit,
                    disabled: !inputValue.trim(),
                    className: `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                        !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''
                    }`
                }, 'Send')
            ])
        ])
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