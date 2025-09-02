import React from 'react';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-indigo-500/10 text-indigo-600',
        green: 'bg-emerald-500/10 text-emerald-600',
        amber: 'bg-amber-500/10 text-amber-600',
        sky: 'bg-sky-500/10 text-sky-600',
    };

    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</span>
                    <span className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</span>
                </div>
                <div className={`p-3 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
                    {React.cloneElement(icon, { size: 28, className: "shrink-0" })}
                </div>
            </div>
        </div>
    );
};

export default StatCard;