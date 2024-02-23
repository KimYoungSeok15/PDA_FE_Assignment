import axios from "axios";
const BASE_URL = "/api/";
const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default instance;
