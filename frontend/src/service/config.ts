const isLocal = window.location.hostname.includes("localhost")

export const API_URL = isLocal ? import.meta.env.VITE_BACKEND_URL_LOCAL_URL : import.meta.env.VITE_BACKEND_URL_PROD_URL
