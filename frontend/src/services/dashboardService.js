import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/dashboard`;

const getAuthHeaders = (token) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
});

const getSummaryStats = (token) => {
    return axios.get(`${API_URL}/summary-stats`, { headers: getAuthHeaders(token) });
};

const getSalesOverTime = (token) => {
    return axios.get(`${API_URL}/sales-over-time`, { headers: getAuthHeaders(token) });
};

const getTopSellingProducts = (token) => {
    return axios.get(`${API_URL}/product-sales`, { headers: getAuthHeaders(token) });
};

const getRecentOrders = (token) => {
    return axios.get(`${API_URL}/recent-orders`, { headers: getAuthHeaders(token) });
};

const getCategoryDistribution = (token) => {
    return axios.get(`${API_URL}/category-distribution`, { headers: getAuthHeaders(token) });
};

const dashboardService = {
    getSummaryStats,
    getSalesOverTime,
    getTopSellingProducts,
    getRecentOrders,
    getCategoryDistribution
};

export default dashboardService;