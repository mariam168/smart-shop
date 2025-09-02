import axios from 'axios';

const API_BASE_URL = 'https://smart-shop-backend-ivory.vercel.app';
const API_URL = `${API_BASE_URL}/api/orders`;

const getAuthHeaders = (token) => {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };
};

const getAllOrders = (token) => {
    return axios.get(API_URL, { headers: getAuthHeaders(token) });
};

const getOrderById = (id, token) => {
    return axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders(token) });
};

const deleteOrder = (id, token) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders(token) });
};

const markAsPaid = (id, paymentResult, token) => {
    return axios.put(`${API_URL}/${id}/pay`, paymentResult, { headers: getAuthHeaders(token) });
};

const markAsDelivered = (id, token) => {
    return axios.put(`${API_URL}/${id}/deliver`, {}, { headers: getAuthHeaders(token) });
};

const orderService = {
    getAllOrders,
    getOrderById,
    deleteOrder,
    markAsPaid,
    markAsDelivered
};

export default orderService;