// src/types/ui-components.ts
export interface WeatherData {
    temperature: number;
    city: string;       // we have this
    state: string;      // we have this
    location?: string;  // computed property
    condition?: string; // optional weather condition
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