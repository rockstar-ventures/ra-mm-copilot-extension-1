import React, { useState, useRef, useEffect } from 'react';
import type { WeatherData, ChatMessage, DynamicComponentType, ComponentData, AppointmentData } from '../types/ui-components';
import { backendService } from 'services/BackendService';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';


interface DynamicComponentProps {
    type: DynamicComponentType;
    data: {
        weather?: WeatherData;
        // Add other data types as needed
    };
}

const WeatherComponent: React.FC<{data: WeatherData}> = ({data}) => {
    return (
      <div className="flex flex-col w-full bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
        <div className="flex justify-between items-center">
          <span className="text-xl font-semibold">{data.location}</span>
          <span className="text-sm opacity-90">{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex-1 flex items-center justify-center py-8">
          <span className="text-7xl font-bold">{data.temperature}°</span>
        </div>
        <div className="text-center">
          <span className="text-lg font-medium">{data.condition}</span>
        </div>
      </div>
    );
  };

const DynamicComponentRenderer: React.FC<{type: DynamicComponentType; data: ComponentData}> = ({type, data}) => {
    console.log('DynamicComponentRenderer called with type:', type);
    console.log('DynamicComponentRenderer data:', data);

    const renderSalesForecast = () => {
        const chartData = data.salesForecast?.forecastData || [];
        console.log('Sales forecast data:', chartData);
        
        return (
            <div className="w-full h-[300px] bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Sales Forecast</h3>
                {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Line 
                                    type="monotone" 
                                    dataKey="amount" 
                                    stroke="#4F46E5" 
                                    dot={{ strokeWidth: 2 }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div>No data available</div>
                )}
            </div>
        );
    };

    const renderExpenses = () => {
        const chartData = data.expenses?.expensesData || [];
        console.log('Expenses data:', chartData);
        
        return (
            <div className="w-full h-[300px] bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Expenses Overview</h3>
                {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: '250px' }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <Tooltip />
                                <Bar 
                                    dataKey="amount" 
                                    fill="#4F46E5" 
                                    radius={[4, 4, 0, 0]} 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div>No data available</div>
                )}
            </div>
        );
    };

    switch(type) {
        case 'weather':
            return <WeatherComponent data={data.weather!} />;
            
        case 'sales-forecast':
            return renderSalesForecast();
            
        case 'expenses':
            return renderExpenses();
            
        case 'appointments':
            return (
                <div className="w-full bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Today's Appointments</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="p-2 text-left text-sm font-medium text-gray-500">Time</th>
                                    <th className="p-2 text-left text-sm font-medium text-gray-500">Title</th>
                                    <th className="p-2 text-left text-sm font-medium text-gray-500">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.appointments?.appointments.map((apt, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="p-2 text-sm text-gray-900">{apt.time}</td>
                                        <td className="p-2 text-sm text-gray-900">{apt.title}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                apt.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                                                apt.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
            
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
            console.log('Backend service response:', result); // Add this debug log
            
            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: result.text,
                isBot: true,
                timestamp: new Date(),
                component: result.component
            };
            
            console.log('Bot message to be added:', botMessage); // Add this debug log
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
        <div className="fixed right-6 bottom-6 w-[450px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">RockStart Copilot</h3>
                    <button 
                        onClick={onClose} 
                        className="text-white hover:bg-blue-700 rounded-full p-1 transition-colors duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
                {messages.map(message => (
                    <div key={message.id} 
                         className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} items-end space-x-2`}
                    >
                        <div className={`max-w-[80%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                            {/* Message Bubble */}
                            <div className={`px-4 py-2 rounded-2xl ${
                                message.isBot 
                                    ? 'bg-white shadow-sm text-gray-800 rounded-bl-none' 
                                    : 'bg-blue-600 text-white rounded-br-none'
                            }`}>
                                <p className="text-sm">{message.text}</p>
                            </div>

                            {/* Component Container - Enhanced styling */}
                            {message.component && (
                                <div className="mt-3 transform transition-all duration-200 hover:scale-102">
                                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                                        <DynamicComponentRenderer 
                                            type={message.component.type} 
                                            data={message.component.data} 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-center space-x-2">
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
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!inputValue.trim()}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 ${
                            !inputValue.trim() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <span>Send</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;