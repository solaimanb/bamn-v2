import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError } from '../types/api';
import { getStoredToken } from './authApi';

interface ErrorResponse {
    detail: Array<{
        msg: string;
        loc: Array<string | number>;
        type: string;
    }> | string;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getStoredToken();
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
            response: error.response && {
                status: error.response.status,
                data: error.response.data as any
            }
        };

        if (error.response) {
            // For validation errors (422), preserve the detailed error messages
            if (error.response.status === 422) {
                const detail = error.response.data?.detail;
                apiError.message = Array.isArray(detail)
                    ? detail.map(e => e.msg).join('. ')
                    : detail as string || 'Validation error occurred';
            } else {
                apiError.message = error.response.data?.detail as string || 'An unexpected error occurred';
            }

            switch (error.response.status) {
                case 401:
                    apiError.code = 'UNAUTHORIZED';
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
                case 500:
                    apiError.code = 'SERVER_ERROR';
                    apiError.message = 'Server error occurred. Please try again later.';
                    break;
            }
        } else if (error.request) {
            apiError.message = 'No response received from server. Please check your connection.';
            apiError.code = 'NETWORK_ERROR';
        }

        return Promise.reject(apiError);
    }
);

export default api;