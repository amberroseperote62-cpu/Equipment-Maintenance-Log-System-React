import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json" },
});
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("token");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export const errMsg = (e) =>
  e.response?.data?.errors
    ? Object.values(e.response.data.errors).flat().join(" ")
    : e.response?.data?.message || "Something went wrong.";
export default api;
