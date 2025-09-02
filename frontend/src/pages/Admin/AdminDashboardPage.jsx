import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import dashboardService from '../../services/dashboardService';
import StatCard from '../../components/Admin/DashboardPage/StatCard';
import { Loader2, Info, DollarSign, ShoppingCart, Users, Package, TrendingUp, PieChart as PieChartIcon, ClipboardList } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'react-router-dom';

const formatCurrency = (amount = 0, language, currencyCode) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        style: 'currency',
        currency: currencyCode || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const DashboardPanel = ({ title, icon, children, className = "" }) => (
    <div className={`bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-zinc-800 ${className}`}>
        <h3 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-3 mb-5">
            {icon}{title}
        </h3>
        {children}
    </div>
);

const SalesChart = ({ data, language, currencyCode, t }) => (
    <div className="h-80 w-full">
        {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        stroke="#e5e7eb" 
                        axisLine={false} 
                        tickLine={false}
                        interval="preserveStartEnd"
                        angle={-30}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis 
                        tickFormatter={(value) => formatCurrency(value, language, currencyCode)} 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        stroke="#e5e7eb" 
                        axisLine={false} 
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
                        contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            borderColor: '#e5e7eb', 
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                        }}
                    />
                    <Bar 
                        dataKey="revenue" 
                        fill="#4f46e5"
                        radius={[5, 5, 0, 0]} 
                        barSize={20} 
                        activeBar={{ fill: '#4338ca' }}
                    />
                </RechartsBarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
                {t('dashboard.salesChart.noData')}
            </div>
        )}
    </div>
);

const CategoryDistributionChart = ({ data, t }) => {
    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#6d28d9', '#d946ef'];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-semibold text-xs">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="h-80 w-full">
            {data && data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="productCount"
                            nameKey="categoryName"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} ${t('adminDashboardPage.productCountLabel') || 'Products'}`, name]} />
                        <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    {t('dashboard.categoryChart.noData')}
                </div>
            )}
        </div>
    );
};

const RecentOrdersTable = ({ orders, language, currencyCode, t }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-zinc-800">
            <thead className="bg-gray-50 dark:bg-zinc-800">
                <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-zinc-300 uppercase tracking-wider">{t('dashboard.orderTable.customer')}</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-zinc-300 uppercase tracking-wider">{t('dashboard.orderTable.date')}</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 dark:text-zinc-300 uppercase tracking-wider">{t('dashboard.orderTable.total')}</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 dark:text-zinc-300 uppercase tracking-wider">{t('dashboard.orderTable.actions')}</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
                {orders && orders.length > 0 ? (
                    orders.map(order => (
                        <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                            <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">
                                {order.user ? order.user.name : t('dashboard.orderTable.deletedUser')}
                            </td>
                            <td className="py-3 px-4 text-gray-500 dark:text-zinc-400">
                                {new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="py-3 px-4 font-semibold text-right text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(order.totalPrice, language, currencyCode)}
                            </td>
                            <td className="py-3 px-4 text-right">
                                <Link to={`/admin/orders/${order._id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-sm">
                                    {t('dashboard.orderTable.view')}
                                </Link>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="py-4 text-center text-gray-500 dark:text-zinc-400">
                            {t('dashboard.orderTable.noOrders')}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

const LoadingSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-200 dark:bg-zinc-800 h-32 rounded-lg"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-200 dark:bg-zinc-800 h-96 rounded-lg"></div>
            <div className="bg-gray-200 dark:bg-zinc-800 h-96 rounded-lg"></div>
        </div>
        <div className="bg-gray-200 dark:bg-zinc-800 h-64 rounded-lg"></div>
    </div>
);

const AdminDashboardPage = () => {
    const { t, language } = useLanguage();
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllDashboardData = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [statsRes, salesRes, categoryRes, recentOrdersRes] = await Promise.all([
                dashboardService.getSummaryStats(token),
                dashboardService.getSalesOverTime(token),
                dashboardService.getCategoryDistribution(token),
                dashboardService.getRecentOrders(token),
            ]);

            setStats(statsRes.data);
            setSalesData(salesRes.data);
            
            const translatedCategoryData = categoryRes.data.map(cat => ({
                ...cat,
                categoryName: (language === 'ar' && cat.categoryName?.ar) ? cat.categoryName.ar : cat.categoryName?.en || cat._id
            }));
            setCategoryData(translatedCategoryData);

            setRecentOrders(recentOrdersRes.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError(t('dashboard.errorFetchingStats'));
        } finally {
            setLoading(false);
        }
    }, [token, t, language]);

    useEffect(() => {
        fetchAllDashboardData();
    }, [fetchAllDashboardData]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-4" style={{ minHeight: '60vh' }}>
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-red-200 dark:border-red-800">
                    <Info size={40} className="mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{t('common.error')}</h3>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <button onClick={fetchAllDashboardData} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
                        {t('common.tryAgain')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
             <header className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('dashboard.title')}</h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">{t('dashboard.subtitle')}</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={t('dashboard.totalRevenue')} value={formatCurrency(stats?.totalRevenue, language, t('general.currencyCode'))} icon={<DollarSign />} color="green" />
                <StatCard title={t('dashboard.totalOrders')} value={stats?.totalOrders?.toLocaleString(language) || '0'} icon={<ShoppingCart />} color="sky" />
                <StatCard title={t('dashboard.totalProducts')} value={stats?.totalProducts?.toLocaleString(language) || '0'} icon={<Package />} color="amber" />
                <StatCard title={t('dashboard.totalUsers')} value={stats?.totalUsers?.toLocaleString(language) || '0'} icon={<Users />} color="primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DashboardPanel title={t('dashboard.salesOverTime')} icon={<TrendingUp size={24} className="text-indigo-600 dark:text-indigo-400"/>} className="lg:col-span-2">
                    <SalesChart data={salesData} language={language} currencyCode={t('general.currencyCode')} t={t} />
                </DashboardPanel>
                
                <DashboardPanel title={t('dashboard.categoryDistribution')} icon={<PieChartIcon size={24} className="text-indigo-600 dark:text-indigo-400"/>}>
                    <CategoryDistributionChart data={categoryData} t={t} />
                </DashboardPanel>
            </div>

            <DashboardPanel title={t('dashboard.recentOrders')} icon={<ClipboardList size={24} className="text-indigo-600 dark:text-indigo-400"/>}>
                <RecentOrdersTable orders={recentOrders} language={language} currencyCode={t('general.currencyCode')} t={t} />
            </DashboardPanel>
        </div>
    );
};

export default AdminDashboardPage;