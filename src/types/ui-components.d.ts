// src/types/ui-components.ts
export interface WeatherData {
    temperature: number;
    location: string;
    condition?: string;
}

export interface AppointmentData {
    time: string;
    title: string;
    status: string;
}

export interface SalesForecastData {
    period: string;
    amount: number;
}

export interface ExpenseData {
    category: string;
    amount: number;
}

export interface ComponentData {
    weather?: WeatherData;
    salesForecast?: {
        forecastData: SalesForecastData[];
    };
    expenses?: {
        expensesData: ExpenseData[];
    };
    appointments?: {
        appointments: AppointmentData[];
    };
}

export type DynamicComponentType = 'weather' | 'sales-forecast' | 'expenses' | 'appointments';

export interface ChatMessage {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
    component?: {
        type: DynamicComponentType;
        data: ComponentData;
    };
}

export interface ProcessQueryResponse {
    text: string;
    component?: {
        type: DynamicComponentType;
        data: ComponentData;
    };
}