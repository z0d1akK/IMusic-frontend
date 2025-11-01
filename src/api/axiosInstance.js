import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const exp = payload.exp;
                const now = Math.floor(Date.now() / 1000);

                if (exp && now < exp) {
                    config.headers.Authorization = `Bearer ${token}`;
                } else {
                    ['token', 'roles', 'userId', 'username'].forEach((key) =>
                        localStorage.removeItem(key)
                    );
                }
            } catch (e) {
                ['token', 'roles', 'userId', 'username'].forEach((key) =>
                    localStorage.removeItem(key)
                );
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

const isAuthPath = (url) =>
    url.includes('/auth/login') || url.includes('/auth/register');

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const { config, response } = error;

        if (config?.suppressGlobalErrorHandler) {
            return Promise.reject(error);
        }

        if (response) {
            if (
                (response.status === 401 || response.status === 403) &&
                !isAuthPath(config.url)
            ) {
                window.location.href = '/unauthorized';
            } else if (response.status === 404) {
                window.location.href = '/notfound';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
