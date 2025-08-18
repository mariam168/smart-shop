import React from 'react';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-primary-light/10 text-primary-light',
        green: 'bg-green-500/10 text-green-500',
        amber: 'bg-amber-500/10 text-amber-500',
        sky: 'bg-sky-500/10 text-sky-500',
    };

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</span>
                    <span className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</span>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                    {React.cloneElement(icon, { size: 24 })}
                </div>
            </div>
        </div>
    );
};

export default StatCard;