import React from 'react';

declare const window: {
    React: typeof React;
} & Window;

interface WeatherData {
    temperature: number;
    city: string;       
    state: string;      
    location?: string;  
    condition?: string; 
}

interface WeatherCardProps {
    data: WeatherData;
}


const WeatherCard: React.FC<WeatherCardProps> = ({data}) => {
    const location = `${data.city}, ${data.state}`;
    
    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden my-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">{location}</h2>
                        <p className="text-blue-100 text-sm">{new Date().toLocaleTimeString()}</p>
                    </div>
                    <div className="text-5xl font-bold">
                        {data.temperature}°
                    </div>
                </div>
            </div>
            <div className="px-6 py-4 bg-gray-50">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600">{data.condition || 'Current Weather'}</span>
                    <span className="text-sm text-gray-500">Updated just now</span>
                </div>
            </div>
        </div>
    );
};

export type { WeatherData, WeatherCardProps };
export { WeatherCard };
export default WeatherCard;