import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/api/users`;

const getAuthHeaders = (token) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
});

const getAllUsers = (token) => {
    return axios.get(API_URL, { headers: getAuthHeaders(token) });
};

const deleteUser = (id, token) => {
    return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders(token) });
};

const updateUserRole = (id, role, token) => {
    return axios.put(`${API_URL}/${id}`, { role }, { headers: getAuthHeaders(token) });
};

const userService = {
    getAllUsers,
    deleteUser,
    updateUserRole,
};

export default userService;