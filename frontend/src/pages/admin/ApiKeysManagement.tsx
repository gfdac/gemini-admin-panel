import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';

// PROMPT PARA COPILOT: Gerenciamento completo de chaves API do Gemini
// Múltiplas chaves, rotação, monitoramento de uso, configuração de modelos

interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'expired' | 'limited' | 'warning';
  model: 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-pro';
  priority: number; // Para load balancing
  region: string;
  environment: 'production' | 'staging' | 'development';
  usage: {
    requests: number;
    tokens: number;
    limit: number;
    resetDate: string;
    errors: number;
    avgResponseTime: number;
  };
  health: {
    lastCheck: string;
    uptime: number;
    errorRate: number;
    status: 'healthy' | 'degraded' | 'unhealthy';
  };
  config: {
    autoRotate: boolean;
    maxRetries: number;
    timeout: number;
    rateLimit: number;
  };
  createdAt: string;
  lastUsed: string;
  tags: string[];
}

const ApiKeysManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState({
    name: '',
    key: '',
    model: 'gemini-1.5-flash' as const,
    limit: 1000,
    environment: 'development' as const,
    region: 'us-central1',
    priority: 1,
    tags: [] as string[]
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = () => {
    // Simulando dados para demonstração
    setTimeout(() => {
      setApiKeys([
        {
          id: '1',
          name: 'Produção Principal',
          key: 'AIzaSyDGivgsIx4L_E1swuNIWnmDPfSNnlWNDLs',
          status: 'active',
          model: 'gemini-1.5-flash',
          priority: 1,
          region: 'us-central1',
          environment: 'production',
          usage: {
            requests: 847,
            tokens: 45230,
            limit: 10000,
            resetDate: '2025-08-01',
            errors: 12,
            avgResponseTime: 1.8
          },
          health: {
            lastCheck: '2025-07-05T15:30:00Z',
            uptime: 99.9,
            errorRate: 1.4,
            status: 'healthy'
          },
          config: {
            autoRotate: true,
            maxRetries: 3,
            timeout: 30,
            rateLimit: 60
          },
          createdAt: '2025-01-15',
          lastUsed: '2025-07-05T15:30:00Z',
          tags: ['production', 'high-priority', 'load-balanced']
        },
        {
          id: '2',
          name: 'Desenvolvimento',
          key: 'AIzaSyB*********************',
          status: 'active',
          model: 'gemini-1.5-pro',
          priority: 2,
          region: 'us-west1',
          environment: 'development',
          usage: {
            requests: 156,
            tokens: 8940,
            limit: 5000,
            resetDate: '2025-08-01',
            errors: 3,
            avgResponseTime: 2.1
          },
          health: {
            lastCheck: '2025-07-04T09:15:00Z',
            uptime: 98.5,
            errorRate: 1.9,
            status: 'healthy'
          },
          config: {
            autoRotate: false,
            maxRetries: 2,
            timeout: 25,
            rateLimit: 30
          },
          createdAt: '2025-02-01',
          lastUsed: '2025-07-04T09:15:00Z',
          tags: ['development', 'testing']
        },
        {
          id: '3',
          name: 'Backup',
          key: 'AIzaSyC*********************',
          status: 'warning',
          model: 'gemini-pro',
          priority: 3,
          region: 'europe-west1',
          environment: 'production',
          usage: {
            requests: 23,
            tokens: 1250,
            limit: 2000,
            resetDate: '2025-08-01',
            errors: 8,
            avgResponseTime: 4.2
          },
          health: {
            lastCheck: '2025-06-20T14:22:00Z',
            uptime: 87.3,
            errorRate: 34.8,
            status: 'degraded'
          },
          config: {
            autoRotate: true,
            maxRetries: 5,
            timeout: 45,
            rateLimit: 20
          },
          createdAt: '2025-03-10',
          lastUsed: '2025-06-20T14:22:00Z',
          tags: ['backup', 'fallback']
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const handleAddKey = () => {
    if (!newKey.name || !newKey.key) {
      setError('Nome e chave são obrigatórios');
      return;
    }

    const newApiKey: ApiKey = {
      id: (apiKeys.length + 1).toString(),
      name: newKey.name,
      key: newKey.key,
      status: 'active',
      model: newKey.model,
      priority: newKey.priority,
      region: newKey.region,
      environment: newKey.environment,
      usage: {
        requests: 0,
        tokens: 0,
        limit: newKey.limit,
        resetDate: '2025-08-01',
        errors: 0,
        avgResponseTime: 0
      },
      health: {
        lastCheck: new Date().toISOString(),
        uptime: 100,
        errorRate: 0,
        status: 'healthy'
      },
      config: {
        autoRotate: true,
        maxRetries: 3,
        timeout: 30,
        rateLimit: 60
      },
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Nunca',
      tags: newKey.tags
    };

    setApiKeys([...apiKeys, newApiKey]);
    setNewKey({ 
      name: '', 
      key: '', 
      model: 'gemini-1.5-flash', 
      limit: 1000,
      environment: 'development',
      region: 'us-central1',
      priority: 1,
      tags: []
    });
    setShowAddForm(false);
    setSuccess('Chave API adicionada com sucesso!');
  };

  const toggleKeyStatus = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id 
        ? { ...key, status: key.status === 'active' ? 'inactive' : 'active' }
        : key
    ));
    setSuccess('Status da chave atualizado!');
  };

  const deleteKey = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta chave?')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
      setSuccess('Chave API removida com sucesso!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatKey = (key: string) => {
    if (key.length <= 30) return key;
    return key.substring(0, 15) + '***' + key.substring(key.length - 10);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando chaves API...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <button
                onClick={() => navigate('/admin')}
                className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
              >
                ← Voltar ao Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Chaves API</h1>
              <p className="text-gray-600">Configure e monitore suas chaves do Gemini AI</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/api-keys-advanced')}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
              >
                Versão Avançada →
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                + Adicionar Chave
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} className="mb-6" />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess(null)} className="mb-6" />
        )}

        {/* Formulário de Adicionar Chave */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Nova Chave API</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Chave</label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({...newKey, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Produção, Desenvolvimento..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <select
                  value={newKey.model}
                  onChange={(e) => setNewKey({...newKey, model: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-pro">Gemini Pro</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Chave API</label>
                <input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => setNewKey({...newKey, key: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="AIzaSy..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Limite Mensal</label>
                <input
                  type="number"
                  value={newKey.limit}
                  onChange={(e) => setNewKey({...newKey, limit: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1000"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddKey}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Chaves */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Chaves API Configuradas</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome / Chave
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Uso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                        <div className="text-sm text-gray-500 font-mono">{formatKey(apiKey.key)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {apiKey.model}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(apiKey.status)}`}>
                        {apiKey.status === 'active' ? 'Ativa' : 
                         apiKey.status === 'inactive' ? 'Inativa' : 
                         apiKey.status === 'expired' ? 'Expirada' : 'Limitada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{apiKey.usage.requests.toLocaleString()} requisições</div>
                        <div className="text-gray-500">{apiKey.usage.tokens.toLocaleString()} tokens</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${(apiKey.usage.requests / apiKey.usage.limit) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apiKey.lastUsed === 'Nunca' ? 'Nunca' : new Date(apiKey.lastUsed).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => toggleKeyStatus(apiKey.id)}
                        className={`${apiKey.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {apiKey.status === 'active' ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => deleteKey(apiKey.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Configurações Gerais */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações de Uso</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotação Automática de Chaves
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="disabled">Desabilitada</option>
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo Padrão
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Mais rápido)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Mais preciso)</option>
                <option value="gemini-pro">Gemini Pro (Clássico)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeysManagement;
