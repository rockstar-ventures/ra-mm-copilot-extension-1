// src/types/ui-components.ts
export interface WeatherData {
    temperature: number;
    location: string;  
    condition: string; 
}

export type DynamicComponentType = 'weather' | 'other-type';

export interface ChatMessage {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
    component?: {
        type: DynamicComponentType;
        data: {
            weather?: WeatherData;
            // Add other component data types here
        };
    };
}