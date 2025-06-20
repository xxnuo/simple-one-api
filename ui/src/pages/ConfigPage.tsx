import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConfig, updateConfig, logout } from '../lib/api';
import { Button } from '../components/ui/button';

export default function ConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [editedConfig, setEditedConfig] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConfig();
      setConfig(data);
      setEditedConfig(JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('获取配置失败:', err);
      setError('获取配置失败，请检查网络连接或登录状态');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      let parsedConfig;
      try {
        parsedConfig = JSON.parse(editedConfig);
      } catch (err) {
        setSaveStatus('error');
        setError('配置格式无效，请检查JSON格式');
        return;
      }

      // 保存旧的API Key以便比较
      const oldApiKey = config?.api_key;

      await updateConfig(parsedConfig);
      setSaveStatus('success');
      setConfig(parsedConfig);
      
      // 如果API Key被修改，需要重新登录
      if (oldApiKey && parsedConfig.api_key && oldApiKey !== parsedConfig.api_key) {
        setTimeout(() => {
          logout();
          navigate('/login', { state: { message: 'API Key已更新，请使用新的API Key登录' } });
        }, 2000);
      } else {
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }
    } catch (err) {
      console.error('保存配置失败:', err);
      setSaveStatus('error');
      setError('保存配置失败，请检查网络连接或配置格式');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl">加载配置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">配置管理</h1>
        <Button variant="outline" onClick={handleLogout}>
          退出登录
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 text-sm text-white bg-red-500 rounded">
          {error}
        </div>
      )}

      {saveStatus === 'success' && (
        <div className="mb-4 p-3 text-sm text-white bg-green-500 rounded">
          配置保存成功！
        </div>
      )}

      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          在下方编辑您的配置，修改完成后点击保存按钮。
        </p>
        <textarea
          className="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={editedConfig}
          onChange={(e) => setEditedConfig(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={fetchConfig} disabled={saveStatus === 'saving'}>
          重新加载
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saveStatus === 'saving'}
          className={saveStatus === 'saving' ? 'opacity-70 cursor-not-allowed' : ''}
        >
          {saveStatus === 'saving' ? '保存中...' : '保存配置'}
        </Button>
      </div>
    </div>
  );
} 