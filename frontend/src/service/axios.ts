import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    timeout: 10000,
    withCredentials: true
});

api.interceptors.request.use(config => {
    config.headers.Accept = "application/json"
    return config;
}, (error) => Promise.reject(error));


api.interceptors.response.use(response => response, error => {
    const isAuthCheck = error.config.url.includes("/api/user/check-auth");
    if (error.response?.status === 401 && !isAuthCheck) {
        console.log("Encouter 401")
        window.location.href = "/login";
    }
    return Promise.reject(error);
})


export default api;

