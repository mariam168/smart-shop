import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/categories`;

const getAuthHeaders = () => ({
    'x-admin-request': 'true',
});

const getAllCategories = () => {
    return axios.get(API_URL, { headers: getAuthHeaders() });
};

const getCategoryById = (id) => {
    return axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
};

const createCategory = (formData) => {
    return axios.post(API_URL, formData, { 
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } 
    });
};

const updateCategory = (id, formData) => {
    return axios.put(`${API_URL}/${id}`, formData, { 
        headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } 
    });
};

const deleteCategory = (id) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
};

const categoryService = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};

export default categoryService;