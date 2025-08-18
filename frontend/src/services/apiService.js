import axios from 'axios';

const apiService = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Optional: Add a request interceptor to include the auth token
apiService.interceptors.request.use(config => {
    const token = localStorage.getItem('token'); // or wherever you store your token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default apiService;