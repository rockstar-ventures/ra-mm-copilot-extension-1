// src/components/WeatherCard.tsx
import React from 'react';

// If you're using a module system, add this at the top
declare const window: {
    React: typeof React;
} & Window;

interface WeatherData {
    temperature: number;
    city: string;
    state: string;
}

interface WeatherCardProps {
    data: WeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 mt-2">
            <div className="text-lg font-semibold mb-2">
                Weather in {data.city}, {data.state}
            </div>
            <div className="text-3xl font-bold">
                {data.temperature}°F
            </div>
        </div>
    );
};

export default WeatherCard;