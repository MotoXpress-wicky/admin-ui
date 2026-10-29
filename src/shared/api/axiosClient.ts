import axios from 'axios';

// Same origin as the admin site (Nginx at http://admin.localhost). The login cookie is sent with every call.
// A multipart form (new shipment, new receipt) sets its own Content-Type, so none is forced here.
export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://admin.localhost',
  withCredentials: true,
});
