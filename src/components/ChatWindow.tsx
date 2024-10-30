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
const CHAT_PREFIX = 'rockstart-copilot';

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
        <div className={`${CHAT_PREFIX}-window fixed right-6 bottom-6 w-[480px] h-[660px] bg-white !rounded-2xl !shadow-2xl flex flex-col overflow-hidden !border !border-gray-200`}
             style={{
                 backgroundColor: 'white !important',
                 zIndex: 9999,
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25) !important',
             }}>
            {/* Header */}
            <div className={`${CHAT_PREFIX}-header px-6 py-4 !bg-gradient-to-r !from-indigo-600 !to-blue-600 border-b border-gray-200`}
                 style={{
                     background: 'linear-gradient(to right, #4f46e5, #3b82f6) !important',
                 }}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className={`${CHAT_PREFIX}-icon w-8 h-8 !bg-white/10 rounded-lg flex items-center justify-center`}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className={`${CHAT_PREFIX}-title text-xl font-semibold !text-white`}>RockStar Copilot</h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className={`${CHAT_PREFIX}-close-btn !text-white/80 hover:!text-white hover:!bg-white/10 !rounded-lg p-2 transition-all duration-200`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className={`${CHAT_PREFIX}-messages flex-1 overflow-y-auto p-6 !bg-gray-50 space-y-6`}
                 style={{ backgroundColor: '#f9fafb !important' }}>
                {messages.map(message => (
                    <div key={message.id} 
                         className={`${CHAT_PREFIX}-message flex ${message.isBot ? 'justify-start' : 'justify-end'} items-end space-x-3`}>
                        {message.isBot && (
                            <div className={`${CHAT_PREFIX}-bot-avatar w-8 h-8 !rounded-lg !bg-indigo-100 flex items-center justify-center flex-shrink-0`}
                                 style={{ backgroundColor: '#e0e7ff !important' }}>
                                <svg className="w-5 h-5 !text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        
                        <div className={`${CHAT_PREFIX}-message-content max-w-[80%] ${message.isBot ? 'order-2' : 'order-1'}`}>
                            <div className={`${CHAT_PREFIX}-bubble px-4 py-3 !rounded-2xl ${
                                message.isBot 
                                    ? '!bg-white !shadow-sm !text-gray-800 !rounded-bl-none' 
                                    : '!bg-indigo-600 !text-white !rounded-br-none'
                            }`}
                                 style={{
                                     backgroundColor: message.isBot ? 'white !important' : '#4f46e5 !important',
                                     color: message.isBot ? '#1f2937 !important' : 'white !important',
                                 }}>
                                <p className="text-sm leading-relaxed">{message.text}</p>
                            </div>

                            {message.component && (
                                <div className={`${CHAT_PREFIX}-component mt-4 transform transition-all duration-200 hover:-translate-y-1`}>
                                    <div className="!bg-white !rounded-xl !shadow-md overflow-hidden !border !border-gray-100">
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
            <div className={`${CHAT_PREFIX}-input p-4 !bg-white !border-t !border-gray-100`}
                 style={{ backgroundColor: 'white !important' }}>
                <div className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Type your message..."
                        className={`${CHAT_PREFIX}-input-field flex-1 px-4 py-3 !bg-gray-50 !border !border-gray-200 !rounded-xl focus:!outline-none focus:!ring-2 focus:!ring-indigo-500 focus:!border-transparent transition-all duration-200`}
                        style={{
                            backgroundColor: '#f9fafb !important',
                            borderColor: '#e5e7eb !important',
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={!inputValue.trim()}
                        className={`${CHAT_PREFIX}-send-btn px-5 py-3 !bg-indigo-600 !text-white !rounded-xl hover:!bg-indigo-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        style={{
                            backgroundColor: '#4f46e5 !important',
                            color: 'white !important',
                        }}
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