import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Alert from '../../components/Alert';
import LoadingSpinner from '../../components/LoadingSpinner';

interface GeminiKey {
  id: string;
  name: string;
  active: boolean;
  source: string;
  createdAt: string;
  lastUsed: string | null;
  requestCount: number;
  keyPreview: string;
}

interface KeyStats {
  total: number;
  active: number;
  inactive: number;
  sources: {
    redis: number;
    fallback: number;
  };
  totalRequests: number;
  redisAvailable: boolean;
}

const GeminiKeysManagement: React.FC = () => {
  const [keys, setKeys] = useState<GeminiKey[]>([]);
  const [stats, setStats] = useState<KeyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/gemini-keys');
      
      if (response.data.success) {
        setKeys(response.data.data.keys);
        setStats(response.data.data.stats);
      } else {
        setAlert({ type: 'error', message: 'Falha ao carregar chaves Gemini' });
      }
    } catch (error: any) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.error || 'Erro ao carregar chaves Gemini' 
      });
    } finally {
      setLoading(false);
    }
  };

  const addKey = async () => {
    if (!newKey.trim()) {
      setAlert({ type: 'error', message: 'Chave API é obrigatória' });
      return;
    }

    try {
      setIsAdding(true);
      const response = await api.post('/admin/gemini-keys', {
        key: newKey.trim(),
        name: newKeyName.trim() || `Chave API ${keys.length + 1}`,
        active: true
      });

      if (response.data.success) {
        setAlert({ type: 'success', message: 'Chave Gemini API adicionada com sucesso' });
        setNewKey('');
        setNewKeyName('');
        setShowAddForm(false);
        loadKeys();
      } else {
        setAlert({ type: 'error', message: response.data.error || 'Falha ao adicionar chave' });
      }
    } catch (error: any) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.error || 'Erro ao adicionar chave Gemini API' 
      });
    } finally {
      setIsAdding(false);
    }
  };

  const removeKey = async (keyId: string) => {
    if (!confirm('Tem certeza que deseja remover esta chave Gemini API?')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/gemini-keys/${keyId}`);
      
      if (response.data.success) {
        setAlert({ type: 'success', message: 'Chave Gemini API removida com sucesso' });
        loadKeys();
      } else {
        setAlert({ type: 'error', message: response.data.error || 'Falha ao remover chave' });
      }
    } catch (error: any) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.error || 'Erro ao remover chave Gemini API' 
      });
    }
  };

  const toggleKey = async (keyId: string, active: boolean) => {
    try {
      const response = await api.patch(`/admin/gemini-keys/${keyId}/toggle`, { active });
      
      if (response.data.success) {
        setAlert({ 
          type: 'success', 
          message: `Chave ${active ? 'ativada' : 'desativada'} com sucesso` 
        });
        loadKeys();
      } else {
        setAlert({ type: 'error', message: response.data.error || 'Falha ao alterar status da chave' });
      }
    } catch (error: any) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.error || 'Erro ao alterar status da chave' 
      });
    }
  };

  const testKey = async (key: string) => {
    try {
      setIsTestingKey(key);
      const response = await api.post('/admin/gemini-keys/test', { key });
      
      if (response.data.success) {
        const { valid, message } = response.data.data;
        setAlert({ 
          type: valid ? 'success' : 'error', 
          message: `Teste da chave: ${message}` 
        });
      } else {
        setAlert({ type: 'error', message: 'Falha ao testar chave' });
      }
    } catch (error: any) {
      setAlert({ 
        type: 'error', 
        message: error.response?.data?.error || 'Erro ao testar chave' 
      });
    } finally {
      setIsTestingKey(null);
    }
  };

  const getSourceBadge = (source: string) => {
    const badges = {
      admin: 'bg-green-100 text-green-800',
      migrated_from_env: 'bg-blue-100 text-blue-800',
      fallback_only: 'bg-yellow-100 text-yellow-800'
    };
    
    const labels = {
      admin: 'Admin',
      migrated_from_env: 'Migrada',
      fallback_only: 'Fallback'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[source as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[source as keyof typeof labels] || source}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chaves Gemini API</h1>
          <p className="text-gray-600">Gerencie as chaves da API Gemini com rotação automática</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Adicionar Chave
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-md">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Chaves</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-md">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chaves Ativas</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-md">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center">
              <div className={`p-2 ${stats.redisAvailable ? 'bg-green-100' : 'bg-red-100'} rounded-md`}>
                <svg className={`w-6 h-6 ${stats.redisAvailable ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status Redis</p>
                <p className={`text-2xl font-semibold ${stats.redisAvailable ? 'text-green-900' : 'text-red-900'}`}>
                  {stats.redisAvailable ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Key Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium mb-4">Adicionar Nova Chave Gemini API</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Chave (opcional)
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Ex: Chave Gemini Produção"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chave API Gemini *
              </label>
              <input
                type="password"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={addKey}
                disabled={isAdding}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-md font-medium"
              >
                {isAdding ? 'Adicionando...' : 'Adicionar Chave'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Chaves Configuradas</h3>
        </div>
        
        {keys.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma chave configurada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Adicione chaves Gemini API para começar a usar o serviço.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chave
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fonte
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estatísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{key.name}</div>
                        <div className="text-sm text-gray-500 font-mono">{key.keyPreview}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        key.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {key.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSourceBadge(key.source)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>Requests: {key.requestCount}</div>
                        <div className="text-xs text-gray-500">
                          {key.lastUsed 
                            ? `Última: ${new Date(key.lastUsed).toLocaleString()}`
                            : 'Nunca usada'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => testKey(key.keyPreview.replace('...', ''))}
                        disabled={isTestingKey === key.keyPreview.replace('...', '')}
                        className="text-blue-600 hover:text-blue-900 disabled:text-blue-400"
                      >
                        {isTestingKey === key.keyPreview.replace('...', '') ? 'Testando...' : 'Testar'}
                      </button>
                      
                      {key.source === 'admin' || key.source === 'migrated_from_env' ? (
                        <>
                          <button
                            onClick={() => toggleKey(key.id, !key.active)}
                            className={key.active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                          >
                            {key.active ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => removeKey(key.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remover
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400 text-xs">Somente leitura</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiKeysManagement;
