import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import dashboardService from '../../services/dashboardService';
import StatCard from '../../components/Admin/DashboardPage/StatCard';
import { Loader2, Info, DollarSign, ShoppingCart, Users, Package, TrendingUp, BarChart, UserCheck } from 'lucide-react';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
    const { t, language } = useLanguage();
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllDashboardData = useCallback(async () => {
        if (!token) return;
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
            setTopProducts(topProductsRes.data);
            setRecentOrders(recentOrdersRes.data);
        } catch (err) {
            setError(t('dashboard.errorFetchingStats'));
        } finally {
            setLoading(false);
        }
    }, [token, t]);

    useEffect(() => {
        fetchAllDashboardData();
    }, [fetchAllDashboardData]);
    
    const formatCurrency = (amount) => {
         return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency',
            currency: t('general.currencyCode'),
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    }
    
    if (loading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (<div key={i} className="bg-white dark:bg-zinc-900 h-32 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"></div>))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-900 h-80 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"></div>
                    <div className="bg-white dark:bg-zinc-900 h-80 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-60 w-full items-center justify-center p-4">
                <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
                    <Info size={40} className="mx-auto mb-4 text-red-500" />
                    <h3 className="text-xl font-bold mb-2">Error</h3>
                    <p className="text-red-600">{error}</p>
                    <button onClick={fetchAllDashboardData} className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    
    const getTranslatedName = (nameObj) => {
        if (!nameObj) return 'Unnamed Product';
        return (language === 'ar' && nameObj.ar ? nameObj.ar : nameObj.en) || nameObj.en || nameObj.ar || 'Unnamed Product';
    };

    const topProductsChartData = topProducts.map(product => ({
        name: getTranslatedName(product.name).split(' ').slice(0, 2).join(' '),
        quantitySold: product.quantitySold,
    })).reverse();

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title={t('dashboard.totalRevenue')}
                    value={formatCurrency(stats?.totalRevenue)}
                    icon={<DollarSign />}
                    color="green"
                />
                <StatCard 
                    title={t('dashboard.totalOrders')}
                    value={stats?.totalOrders.toLocaleString(language) || '0'}
                    icon={<ShoppingCart />}
                    color="sky"
                />
                <StatCard 
                    title={t('dashboard.totalProducts')}
                    value={stats?.totalProducts.toLocaleString(language) || '0'}
                    icon={<Package />}
                    color="amber"
                />
                <StatCard 
                    title={t('dashboard.totalUsers')}
                    value={stats?.totalUsers.toLocaleString(language) || '0'}
                    icon={<Users />}
                    color="primary"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-primary"/>
                        {t('dashboard.salesOverTime')}
                    </h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={salesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip
                                    cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
                     <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                        <BarChart size={20} className="text-primary"/>
                        {t('dashboard.topSellingProducts')}
                     </h3>
                     <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart
                                layout="vertical"
                                data={topProductsChartData}
                                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false}/>
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={80} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fontSize: 12 }}
                                    stroke="hsl(var(--muted-foreground))"
                                />
                                <Tooltip
                                    cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                    formatter={(value) => [value, 'Sold']}
                                />
                                <Bar dataKey="quantitySold" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                            </RechartsBarChart>
                        </ResponsiveContainer>
                     </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-800">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                    <UserCheck size={20} className="text-primary"/>
                    {t('dashboard.recentOrders')}
                </h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {recentOrders.map(order => (
                                <tr key={order._id}>
                                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">{order.user?.name || 'User Deleted'}</td>
                                    <td className="py-3 px-4 text-gray-500 dark:text-zinc-400">{order.user?.email || 'N/A'}</td>
                                    <td className="py-3 px-4 text-gray-500 dark:text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 font-semibold text-right text-green-600">{formatCurrency(order.totalPrice)}</td>
                                    <td className="py-3 px-4 text-right">
                                        <Link to={`/admin/orders/${order._id}`} className="text-primary dark:text-primary-light hover:underline font-semibold">View</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;