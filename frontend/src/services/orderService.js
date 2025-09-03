import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/orders`;

const getAuthHeaders = (token) => {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
    };
};

const getAllOrders = (token) => {
    console.log('[orderService] Attempting to call getAllOrders.');
    console.log(`[orderService] Target URL: ${API_URL}`);
    console.log(`[orderService] Token Provided: ${token ? 'Yes' : 'No'}`);
    return axios.get(API_URL, { headers: getAuthHeaders(token) });
};

const getOrderById = (id, token) => {
    const url = `${API_URL}/${id}`;
    console.log(`[orderService] Calling getOrderById with URL: ${url}`);
    return axios.get(url, { headers: getAuthHeaders(token) });
};

const markAsPaid = (id, paymentResult, token) => {
    const url = `${API_URL}/${id}/pay`;
    console.log(`[orderService] Calling markAsPaid with URL: ${url}`); 
    return axios.put(url, paymentResult, { headers: getAuthHeaders(token) });
};

const markAsDelivered = (id, token) => {
    const url = `${API_URL}/${id}/deliver`;
    console.log(`[orderService] Calling markAsDelivered with URL: ${url}`);
    return axios.put(url, {}, { headers: getAuthHeaders(token) });
};

const deleteOrder = (id, token) => {
    const url = `${API_URL}/${id}`;
    console.log(`[orderService] Calling deleteOrder with URL: ${url}`);
    return axios.delete(url, { headers: getAuthHeaders(token) });
};

const updateOrder = async (id, orderData, token) => {
    const url = `${API_URL}/${id}`;
    console.log(`[orderService] Calling updateOrder with URL: ${url}`);
    return axios.put(url, orderData, { headers: getAuthHeaders(token) });
};

const orderService = {
    getAllOrders,
    getOrderById,
    markAsPaid,
    markAsDelivered,
    deleteOrder,
    updateOrder, 
};

export default orderService;