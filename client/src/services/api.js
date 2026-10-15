/**
 * API Service Layer for ShopKart
 * Prepared for backend integration
 */

import axios from "axios";

// In production on Vercel, requests to /api route to Express on the same origin.
// In local development, falls back to http://localhost:5178/api or uses VITE_API_URL if defined.
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5178/api');

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});