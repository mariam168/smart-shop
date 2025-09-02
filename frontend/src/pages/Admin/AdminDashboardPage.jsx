import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import dashboardService from '../../services/dashboardService';
import StatCard from '../../components/Admin/DashboardPage/StatCard';
import { Loader2, Info, DollarSign, ShoppingCart, Users, Package, TrendingUp, BarChart, ClipboardList } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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

const SalesChart = ({ data, language, currencyCode, dashboardTranslations }) => (
    <div className="h-80 w-full">
        {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                        stroke="hsl(var(--border))" 
                        axisLine={false} 
                        tickLine={false}
                        interval="preserveStartEnd"
                        angle={-30}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis 
                        tickFormatter={(value) => formatCurrency(value, language, currencyCode)} 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                        stroke="hsl(var(--border))" 
                        axisLine={false} 
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'hsla(240, 5.9%, 10%, 0.1)' }}
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            borderColor: 'hsl(var(--border))', 
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            fontSize: '0.875rem'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                        itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        formatter={(value) => [formatCurrency(value, language, currencyCode), dashboardTranslations.salesChart?.revenue || 'Revenue']}
                    />
                    <Bar 
                        dataKey="revenue" 
                        fill="hsl(var(--primary))" 
                        radius={[5, 5, 0, 0]} 
                        barSize={20} 
                        className="hover:opacity-80 transition-opacity"
                    />
                </RechartsBarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-zinc-400">
                {dashboardTranslations.salesChart?.noData || 'No data available'}
            </div>
        )}
    </div>
);

const TopProductsChart = ({ data, language, dashboardTranslations }) => (
    <div className="h-80 w-full">
        {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false}/>
                    <XAxis 
                        type="number" 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                        stroke="hsl(var(--border))" 
                        axisLine={false} 
                        tickLine={false}
                    />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                        stroke="hsl(var(--border))"
                    />
                    <Tooltip
                        cursor={{ fill: 'hsla(240, 5.9%, 10%, 0.1)' }}
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            borderColor: 'hsl(var(--border))', 
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            fontSize: '0.875rem'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                        itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                        formatter={(value) => [value.toLocaleString(language), dashboardTranslations.topProductsChart?.sold || 'Sold']}
                    />
                    <Bar 
                        dataKey="quantitySold" 
                        fill="hsl(var(--primary))" 
                        radius={[0, 5, 5, 0]} 
                        barSize={25} 
                        className="hover:opacity-80 transition-opacity"
                    />
                </RechartsBarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-zinc-400">
                {dashboardTranslations.topProductsChart?.noData || 'No data available'}
            </div>
        )}
    </div>
);

const RecentOrdersTable = ({ orders, language, currencyCode, dashboardTranslations, t }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-zinc-800">
            <thead className="bg-gray-50 dark:bg-zinc-800">
                <tr>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-zinc-300 uppercase tracking-wider">{dashboardTranslations.orderTable?.customer || 'Customer'}</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-zinc-300 uppercase tracking-wider">{dashboardTranslations.orderTable?.date || 'Date'}</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 dark:text-zinc-300 uppercase tracking-wider">{dashboardTranslations.orderTable?.total || 'Total'}</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold text-gray-600 dark:text-zinc-300 uppercase tracking-wider">{dashboardTranslations.orderTable?.actions || 'Actions'}</th>
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
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const dashboardTranslations = t('dashboard');
    const generalTranslations = t('general');
    
    const getTranslatedName = useCallback((nameObj) => {
        if (!nameObj || typeof nameObj !== 'object') {
            return dashboardTranslations.unnamedProduct || 'Unnamed Product';
        }
        return (language === 'ar' && nameObj.ar) ? nameObj.ar : nameObj.en || (dashboardTranslations.unnamedProduct || 'Unnamed Product');
    }, [language, dashboardTranslations]);

    const fetchAllDashboardData = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const [statsRes, salesRes, topProductsRes, recentOrdersRes] = await Promise.all([
                dashboardService.getSummaryStats(token),
                dashboardService.getSalesOverTime(token),
                dashboardService.getTopSellingProducts(token),
                dashboardService.getRecentOrders(token),
            ]);

            setStats(statsRes.data);
            setSalesData(salesRes.data);
            
            const translatedTopProducts = topProductsRes.data.map(product => ({
                ...product,
                name: getTranslatedName(product.name),
            }));
            setTopProducts(translatedTopProducts);

            setRecentOrders(recentOrdersRes.data);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError(t('dashboard.errorFetchingStats'));
        } finally {
            setLoading(false);
        }
    }, [token, t, getTranslatedName]);

    useEffect(() => {
        fetchAllDashboardData();
    }, [fetchAllDashboardData]);

    const topProductsChartData = topProducts.map(product => ({
        name: product.name,
        quantitySold: product.quantitySold,
    })).reverse();

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
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{dashboardTranslations.title || 'Dashboard'}</h1>
                <p className="mt-2 text-gray-600 dark:text-zinc-400">{dashboardTranslations.subtitle || 'Overview'}</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title={dashboardTranslations.totalRevenue} value={formatCurrency(stats?.totalRevenue, language, generalTranslations.currencyCode)} icon={<DollarSign />} color="green" />
                <StatCard title={dashboardTranslations.totalOrders} value={stats?.totalOrders?.toLocaleString(language) || '0'} icon={<ShoppingCart />} color="sky" />
                <StatCard title={dashboardTranslations.totalProducts} value={stats?.totalProducts?.toLocaleString(language) || '0'} icon={<Package />} color="amber" />
                <StatCard title={dashboardTranslations.totalUsers} value={stats?.totalUsers?.toLocaleString(language) || '0'} icon={<Users />} color="primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DashboardPanel title={dashboardTranslations.salesOverTime} icon={<TrendingUp size={24} className="text-indigo-600 dark:text-indigo-400"/>} className="lg:col-span-2">
                    <SalesChart data={salesData} language={language} currencyCode={generalTranslations.currencyCode} dashboardTranslations={dashboardTranslations} />
                </DashboardPanel>
                
                <DashboardPanel title={dashboardTranslations.topSellingProducts} icon={<BarChart size={24} className="text-indigo-600 dark:text-indigo-400"/>}>
                    <TopProductsChart data={topProductsChartData} language={language} dashboardTranslations={dashboardTranslations} />
                </DashboardPanel>
            </div>

            <DashboardPanel title={dashboardTranslations.recentOrders} icon={<ClipboardList size={24} className="text-indigo-600 dark:text-indigo-400"/>}>
                <RecentOrdersTable orders={recentOrders} language={language} currencyCode={generalTranslations.currencyCode} dashboardTranslations={dashboardTranslations} t={t} />
            </DashboardPanel>
        </div>
    );
};

export default AdminDashboardPage;