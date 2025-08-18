import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/discounts`;

const getAuthHeaders = () => {
    return {};
};

const getAllDiscounts = () => {
    return axios.get(API_URL, { headers: getAuthHeaders() });
};

const createDiscount = (discountData) => {
    return axios.post(API_URL, discountData, { headers: getAuthHeaders() });
};

const updateDiscount = (id, discountData) => {
    return axios.put(`${API_URL}/${id}`, discountData, { headers: getAuthHeaders() });
};

const deleteDiscount = (id) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
};

const discountService = {
    getAllDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
};

export default discountService;