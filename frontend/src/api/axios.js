// utils/axios.js

import axios from 'axios';

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api',

  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },

  withCredentials: true,
});

/*
|--------------------------------------------------------------------------
| REQUEST INTERCEPTOR
|--------------------------------------------------------------------------
*/
API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'accessToken'
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

/*
|--------------------------------------------------------------------------
| RESPONSE INTERCEPTOR
|--------------------------------------------------------------------------
*/

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (
  callback
) => {
  refreshSubscribers.push(
    callback
  );
};

const onRefreshed = (
  token
) => {
  refreshSubscribers.forEach(
    (callback) =>
      callback(token)
  );

  refreshSubscribers = [];
};

API.interceptors.response.use(
  (response) =>
    response,

  async (error) => {
    const originalRequest =
      error.config;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(
        error
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Do not refresh these endpoints
    |--------------------------------------------------------------------------
    */

    const isLoginRequest =
      originalRequest.url?.includes(
        '/users/login'
      );

    const isRefreshRequest =
      originalRequest.url?.includes(
        '/users/refresh-token'
      );

    if (
      isLoginRequest ||
      isRefreshRequest
    ) {
      return Promise.reject(
        error
      );
    }

    if (isRefreshing) {
      return new Promise(
        (resolve, reject) => {
          subscribeTokenRefresh(
            (token) => {
              originalRequest.headers.Authorization =
                `Bearer ${token}`;

              resolve(
                API(
                  originalRequest
                )
              );
            }
          );
        }
      );
    }

    originalRequest._retry =
      true;

    isRefreshing = true;

    try {
      /*
      |--------------------------------------------------------------------------
      | Browser automatically sends HTTP-only cookie
      |--------------------------------------------------------------------------
      */

      const response =
        await axios.post(
          `${
            import.meta.env
              .VITE_API_URL ||
            'http://localhost:5000/api'
          }/users/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

      const newToken =
        response.data.data
          .accessToken;

      localStorage.setItem(
        'accessToken',
        newToken
      );

      isRefreshing = false;

      onRefreshed(newToken);

      originalRequest.headers.Authorization =
        `Bearer ${newToken}`;

      return API(
        originalRequest
      );
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = [];

      handleAuthFailure();

      return Promise.reject(
        refreshError
      );
    }
  }
);

/*
|--------------------------------------------------------------------------
| AUTH FAILURE
|--------------------------------------------------------------------------
*/

export const handleAuthFailure =
  () => {
    localStorage.removeItem(
      'accessToken'
    );

    localStorage.removeItem(
      'user'
    );

    window.location.href =
      '/login';
  };

export default API;