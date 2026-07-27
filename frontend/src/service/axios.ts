import axios from 'axios';
import { API_URL } from './config';
import { clearStorage } from '@/utils/storage';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: true
});

api.interceptors.request.use(config => {
    config.headers.Accept = "application/json"
    return config;
}, (error) => Promise.reject(error));


api.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401) {
        clearStorage();
        window.location.href = "/login";
    }
    return Promise.reject(error);
})


export default api;

