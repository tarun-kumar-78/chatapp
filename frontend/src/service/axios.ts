import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:5001",
    timeout: 10000,
    withCredentials:true    
});

api.interceptors.request.use(config => {
    config.headers.Accept = "application/json"
    return config;
}, (error) => Promise.reject(error));


api.interceptors.response.use(response => response, error => {
    if (error.response?.status === 401) {
        window.location.href = "/login";
    }
    return Promise.reject(error);
})


export default api;

