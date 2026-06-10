import axios from 'axios';
import { Log } from '../../logging_middleware/logger.js';

const apiClient = axios.create({
  baseURL: 'http://4.224.186.213/evaluation-service',
  timeout: 5000,
});

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {

    await Log(
      "backend",
      "info",
      "domain",
      `${config.method?.toUpperCase()} ${config.url} request initiated`
    );

    const token = process.env.API_TOKEN || 'default_mock_token';

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  async (error) => {

    await Log(
      "backend",
      "error",
      "domain",
      error.message
    );

    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  async (response) => {

    await Log(
      "backend",
      "info",
      "domain",
      `${response.config.url} responded with status ${response.status}`
    );

    return response;
  },
  async (error) => {

    await Log(
      "backend",
      "error",
      "domain",
      error.message
    );

    return Promise.reject(error);
  }
);

export default apiClient;