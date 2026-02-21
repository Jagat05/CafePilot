import axios from "axios";
import { getApiBaseUrl } from "./api-config";

const API = axios.create({
  baseURL: "http://localhost:8080/api", // default; overridden per-request in browser for mobile
  withCredentials: true,
});

// Use current hostname in browser so mobile (e.g. http://192.168.1.80:3000) hits same host:8080
API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = `${getApiBaseUrl()}/api`;
  }
  return config;
});

export default API;
