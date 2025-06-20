import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('api_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 未授权处理，可以跳转到登录页面
      localStorage.removeItem('api_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 获取配置
export const getConfig = async () => {
  try {
    const response = await api.get('/admin/config');
    return response.data;
  } catch (error) {
    console.error('获取配置失败:', error);
    throw error;
  }
};

// 更新配置
export const updateConfig = async (config: any) => {
  try {
    const response = await api.post('/admin/config', config);
    return response.data;
  } catch (error) {
    console.error('更新配置失败:', error);
    throw error;
  }
};

// 登录函数
export const login = async (apiKey: string) => {
  // 存储API Key到本地存储
  localStorage.setItem('api_token', apiKey);
  
  // 验证API Key是否有效
  try {
    await getConfig();
    return true;
  } catch (error) {
    localStorage.removeItem('api_token');
    return false;
  }
};

// 注销函数
export const logout = () => {
  localStorage.removeItem('api_token');
};

// 检查是否已登录
export const isLoggedIn = () => {
  return !!localStorage.getItem('api_token');
};

export default api; 