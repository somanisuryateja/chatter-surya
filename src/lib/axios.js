import axios from "axios";

// Use environment variable for production, fallback to relative path for dev
const API_URL = import.meta.env.VITE_API_URL || "";

export const axiosInstance = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
});
