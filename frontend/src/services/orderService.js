import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/orders`;

const getAuthHeaders = (token) => {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
};

const getAdminOrderList = (token) => {
    const url = `${API_URL}/admin-list`;
    console.log(`[orderService] Calling getAdminOrderList at: ${url}`);
    return axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
};

const getOrderById = (id, token) => {
    return axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders(token) });
};

const markAsPaid = (id, paymentResult, token) => {
    return axios.put(`${API_URL}/${id}/pay`, paymentResult, { headers: getAuthHeaders(token) });
};

const markAsDelivered = (id, token) => {
    return axios.put(`${API_URL}/${id}/deliver`, {}, { headers: getAuthHeaders(token) });
};

const updateOrder = (id, orderData, token) => {
    return axios.put(`${API_URL}/${id}`, orderData, { headers: getAuthHeaders(token) });
};

const deleteOrder = (id, token) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders(token) });
};

const orderService = {
    getAdminOrderList,
    getOrderById,
    markAsPaid,
    markAsDelivered,
    updateOrder,
    deleteOrder,
};

export default orderService;