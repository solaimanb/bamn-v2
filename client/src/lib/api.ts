import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '../types/api';

interface ErrorResponse {
    message?: string;
    code?: string;
    details?: Record<string, unknown>;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error: AxiosError<ErrorResponse>) => {
        const apiError: ApiError = {
            message: 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR',
        };

        if (error.response) {
            apiError.message = error.response.data?.message || error.message;
            apiError.code = error.response.data?.code;
            apiError.details = error.response.data?.details;

            switch (error.response.status) {
                case 401:
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    apiError.code = 'FORBIDDEN';
                    break;
                case 404:
                    apiError.code = 'NOT_FOUND';
                    break;
                case 422:
                    apiError.code = 'VALIDATION_ERROR';
                    break;
            }
        } else if (error.request) {
            apiError.message = 'No response received from server';
            apiError.code = 'NETWORK_ERROR';
        }

        return Promise.reject(apiError);
    }
);

export default api;