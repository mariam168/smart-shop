import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/advertisements`;

const getAuthHeaders = (isAdmin = false) => {
    const headers = {};
    if (isAdmin) {
        headers['x-admin-request'] = 'true';
    }
    // const token = localStorage.getItem('token');
    // if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

const getAllAdvertisements = () => {
    return axios.get(API_URL, { headers: getAuthHeaders() });
};

const getAdvertisementRaw = (id) => {
    return axios.get(`${API_URL}/${id}/raw`, { headers: getAuthHeaders(true) });
};

const createAdvertisement = (formData) => {
    return axios.post(API_URL, formData, { 
        headers: { ...getAuthHeaders(true), 'Content-Type': 'multipart/form-data' } 
    });
};

const updateAdvertisement = (id, formData) => {
    return axios.put(`${API_URL}/${id}`, formData, { 
        headers: { ...getAuthHeaders(true), 'Content-Type': 'multipart/form-data' } 
    });
};

const deleteAdvertisement = (id) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders(true) });
};

const advertisementService = {
    getAllAdvertisements,
    getAdvertisementRaw,
    createAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
};

export default advertisementService;