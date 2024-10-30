// src/services/BackendService.ts
import type { DynamicComponentType } from '../types/ui-components';

interface ProcessQueryResponse {
    text: string;
    component?: {
        type: DynamicComponentType;
        data: any;
    };
}


export class BackendService {
    private baseUrl: string;

    constructor() {
        //this.baseUrl = 'https://146.148.83.83';
        this.baseUrl = 'http://localhost:8000';
    }

    async processQuery(
        query: string, 
        context?: { userId: string; channelId: string; }
    ): Promise<ProcessQueryResponse> {
        try {
            console.log('Sending query to backend:', query);
            const response = await fetch(`https://34.36.144.151/chat/invoke`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    input: {
                        input: [{
                            type: 'human',
                            content: query
                        }],
                        chat_history: []
                    }
                })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Raw backend response:', data);
    
            // Transform backend response to match our UI needs
            const result: ProcessQueryResponse = {
                text: data.output.result || "I received your message"
            };
    
            // Handle tool results
            if (data.output.tool_result) {
                console.log('Tool result type:', data.output.tool_result.type);
                console.log('Tool result data:', data.output.tool_result);
    
                if (data.output.tool_result.type === 'expenses') {
                    result.component = {
                        type: 'expenses',
                        data: {
                            expenses: {
                                expensesData: data.output.tool_result.expensesData
                            }
                        }
                    };
                }
                else if (data.output.tool_result.type === 'sales-forecast') {
                    result.component = {
                        type: 'sales-forecast',
                        data: {
                            salesForecast: {
                                forecastData: data.output.tool_result.forecastData
                            }
                        }
                    };
                }
                else if (data.output.tool_result.type === 'appointments') {
                    result.component = {
                        type: 'appointments',
                        data: {
                            appointments: {
                                appointments: data.output.tool_result.appointments
                            }
                        }
                    };
                }
            }
    
            console.log('Final processed result:', result);
            return result;
        } catch (error) {
            console.error('Error processing query:', error);
            return {
                text: 'Sorry, I encountered an error processing your request.'
            };
        }
    }
}

export const backendService = new BackendService();