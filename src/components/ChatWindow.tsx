// src/components/ChatWindow.tsx
export interface ChatMessage {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

interface ChatWindowProps {
    onClose: () => void;
}

const ChatWindow = (props: ChatWindowProps) => {
    return window.React.createElement('div', {
        className: 'fixed right-4 bottom-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200',
        style: { zIndex: 9999 }
    }, [
        // Header
        window.React.createElement('div', {
            key: 'header',
            className: 'p-4 border-b border-gray-200 flex justify-between items-center'
        }, [
            window.React.createElement('h3', { 
                key: 'title',
                className: 'font-semibold'
            }, 'Mattermost Copilot'),
            window.React.createElement('button', {
                key: 'close',
                className: 'text-gray-500 hover:text-gray-700',
                onClick: props.onClose
            }, '×')
        ]),
        
        // Messages
        window.React.createElement('div', {
            key: 'messages',
            className: 'flex-1 overflow-y-auto p-4'
        }, [
            window.React.createElement('div', {
                key: 'welcome-msg',
                className: 'bg-gray-100 rounded-lg p-3'
            }, 'Hello! How can I help you today?')
        ]),
        
        // Input
        window.React.createElement('div', {
            key: 'input',
            className: 'p-4 border-t border-gray-200'
        }, [
            window.React.createElement('input', {
                type: 'text',
                placeholder: 'Type your message...',
                className: 'w-full px-3 py-2 border border-gray-300 rounded-lg'
            })
        ])
    ]);
};

export default ChatWindow;