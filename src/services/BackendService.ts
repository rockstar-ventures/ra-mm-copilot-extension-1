// src/services/BackendService.ts
import type { DynamicComponentType } from '../types/ui-components';

interface ProcessQueryResponse {
    text: string;
    component?: {
        type: DynamicComponentType;
        data: any;
    };
}

const BACKEND_URL = 'http://localhost:8000/chat';

export class BackendService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = BACKEND_URL;
    }

    async processQuery(
        query: string, 
        context?: { userId: string; channelId: string; }
    ): Promise<ProcessQueryResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/invoke`, {  // Add /invoke
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
            
            // Transform backend response to match our UI needs
            const result: ProcessQueryResponse = {
                text: data.output.result || "I received your message"
            };

            // Handle tool results
            if (data.output.tool_result) {
                // Handle weather tool result
                if ('temperature' in data.output.tool_result) {
                    result.component = {
                        type: 'weather',
                        data: {
                            weather: {
                                temperature: data.output.tool_result.temperature,
                                location: `${data.output.tool_result.city}, ${data.output.tool_result.state}`,
                                condition: 'Available'
                            }
                        }
                    };
                }
                // Add more tool result handlers here
            }

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