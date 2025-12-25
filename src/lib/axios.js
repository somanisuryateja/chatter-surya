import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "/api", // Use relative path to leverage Vite proxy
    withCredentials: true,
});
