/**
 * API Service Layer for ShopKart
 * Prepared for backend integration
 */

import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5178/',
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }

})