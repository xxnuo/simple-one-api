import { Link } from 'react-router-dom';
import { isLoggedIn } from '../lib/api';
import { Button } from '../components/ui/button';

export default function HomePage() {
  const loggedIn = isLoggedIn();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Simple One API</h1>
        <p className="text-xl mb-8">
          统一管理多个大模型API的简单服务
        </p>
        
        <div className="grid gap-4 md:grid-cols-2 mb-12">
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-3">使用指南</h2>
            <p className="mb-4">
              Simple One API 允许您统一管理多个大模型API，简化调用流程。
            </p>
            <ul className="list-disc list-inside text-left">
              <li>支持多种大模型API</li>
              <li>统一的API接口</li>
              <li>负载均衡</li>
              <li>配置管理</li>
            </ul>
          </div>
          
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-3">配置管理</h2>
            <p className="mb-4">
              通过Web界面轻松管理API配置，添加或修改服务。
            </p>
            {loggedIn ? (
              <Link to="/config">
                <Button className="w-full">
                  进入配置管理
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button className="w-full">
                  登录进入配置
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600">
            访问 <a href="https://github.com/xxnuo" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">GitHub 仓库</a> 了解更多信息
          </p>
        </div>
      </div>
    </div>
  );
} 