import React, { useState, useRef, useEffect } from 'react';
import type { WeatherData, ChatMessage, DynamicComponentType } from '../types/ui-components';
import { backendService } from 'services/BackendService';

interface DynamicComponentProps {
    type: DynamicComponentType;
    data: {
        weather?: WeatherData;
        // Add other data types as needed
    };
}

const WeatherComponent: React.FC<{data: WeatherData}> = ({data}) => {
    return (
        <div className="flex flex-col w-[325px] h-[300px] bg-black text-white rounded-lg p-4">
            <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{data.location}</span>
                <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <span className="text-6xl font-bold">{data.temperature}°</span>
            </div>
            <div className="text-center">
                <span className="text-lg">{data.condition}</span>
            </div>
        </div>
    );
};

const DynamicComponentRenderer: React.FC<DynamicComponentProps> = ({type, data}) => {
    switch(type) {
        case 'weather':
            return <WeatherComponent data={data.weather!} />;
        default:
            return <div>Unsupported component type</div>;
    }
};

interface ChatWindowProps {
    onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({onClose}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            text: 'Hello! How can I assist you today?',
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async () => {
        if (!inputValue.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            text: inputValue,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        try {
            const result = await backendService.processQuery(inputValue);
            
            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: result.text,
                isBot: true,
                timestamp: new Date(),
                component: result.component
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: "Sorry, I encountered an error processing your request.",
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }

        setInputValue('');
    };

    return (
        <div className="fixed right-4 bottom-4 w-[400px] h-[600px] bg-white rounded-lg shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-lg">
                <h3 className="font-semibold">Rockstar AI Assistant</h3>
                <button 
                    onClick={onClose} 
                    className="text-white hover:text-gray-200 text-xl font-bold"
                >×</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map(message => (
                    <div key={message.id} 
                         className={`mb-4 ${message.isBot ? 'mr-auto' : 'ml-auto'} max-w-[80%]`}
                    >
                        <div className={`p-3 rounded-lg ${
                            message.isBot ? 'bg-white shadow-sm' : 'bg-blue-600 text-white'
                        }`}>
                            {message.text}
                        </div>
                        {message.component && (
                            <div className="mt-2">
                                <DynamicComponentRenderer 
                                    type={message.component.type} 
                                    data={message.component.data} 
                                />
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white rounded-b-lg">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSubmit();
                            }
                        }}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!inputValue.trim()}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                            !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;