import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/products`;

const getAuthHeaders = (isAdmin = false) => {
    const headers = {};
    if (isAdmin) {
        headers['x-admin-request'] = 'true';
    }
    return headers;
};

const getAdminProductList = () => {
    return axios.get(`${API_URL}/admin-list`, { headers: getAuthHeaders(true) });
};

const getProductByIdAdmin = (id) => {
    return axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders(true) });
};

const createProduct = (formData) => {
    return axios.post(API_URL, formData, { 
        headers: { ...getAuthHeaders(true), 'Content-Type': 'multipart/form-data' }
    });
};

const updateProduct = (id, formData) => {
    return axios.put(`${API_URL}/${id}`, formData, { 
        headers: { ...getAuthHeaders(true), 'Content-Type': 'multipart/form-data' }
    });
};

const deleteProduct = (id) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders(true) });
};

const productService = {
    getAdminProductList,
    getProductByIdAdmin,
    createProduct,
    updateProduct,
    deleteProduct,
};

export default productService;