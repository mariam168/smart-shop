import axios from 'axios';

const apiService = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

apiService.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default apiService;