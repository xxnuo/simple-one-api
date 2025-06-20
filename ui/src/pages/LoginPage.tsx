import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '../lib/schemas';
import { login } from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // 检查location.state中是否有消息
    if (location.state && typeof location.state === 'object' && 'message' in location.state) {
      setMessage(location.state.message as string);
    }
  }, [location]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      apiKey: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const success = await login(data.apiKey);
      if (success) {
        navigate('/config');
      } else {
        setError('API Key无效，请检查后重试');
      }
    } catch (err) {
      setError('登录失败，请检查API Key或网络连接');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold">配置管理登录</h1>
          <p className="mt-2 text-gray-600">请输入您的API Key以访问配置</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="p-3 text-sm text-white bg-red-500 rounded">
              {error}
            </div>
          )}
          
          {message && (
            <div className="p-3 text-sm text-white bg-blue-500 rounded">
              {message}
            </div>
          )}
          
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              autoComplete="off"
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              {...register('apiKey')}
            />
            {errors.apiKey && (
              <p className="mt-1 text-sm text-red-600">{errors.apiKey.message}</p>
            )}
          </div>
          
          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 