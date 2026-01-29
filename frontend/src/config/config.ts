
const BACKEND_PROD_URL = "https://chatapp-wdpc.onrender.com";
const BACKEND_LOCAL_URL = "http://localhost:5001";

const isProd = window.location.hostname.includes("chatapp-snowy-psi.vercel.app");


export const PROD = isProd ? BACKEND_PROD_URL : BACKEND_LOCAL_URL;