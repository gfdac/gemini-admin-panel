import React, { useState, useEffect, useCallback } from 'react';
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
  priority: number;
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

interface KeyMetrics {
  totalKeys: number;
  activeKeys: number;
  totalRequests: number;
  totalTokens: number;
  avgResponseTime: number;
  avgUptime: number;
  totalErrors: number;
}

const ApiKeysManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<ApiKey[]>([]);
  const [metrics, setMetrics] = useState<KeyMetrics>({
    totalKeys: 0,
    activeKeys: 0,
    totalRequests: 0,
    totalTokens: 0,
    avgResponseTime: 0,
    avgUptime: 0,
    totalErrors: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [filterHealth, setFilterHealth] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [newKey, setNewKey] = useState({
    name: '',
    key: '',
    model: 'gemini-1.5-flash' as const,
    limit: 1000,
    environment: 'development' as const,
    region: 'us-central1',
    priority: 1,
    tags: [] as string[],
    autoRotate: true,
    maxRetries: 3,
    timeout: 30,
    rateLimit: 60
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadApiKeys();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKeys, filterStatus, filterEnvironment, filterHealth, sortBy, sortOrder, searchTerm]);

  useEffect(() => {
    calculateMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKeys]);

  const loadApiKeys = () => {
    setTimeout(() => {
      const keys = [
        {
          id: '1',
          name: 'Produção Principal',
          key: 'AIzaSyDGivgsIx4L_E1swuNIWnmDPfSNnlWNDLs',
          status: 'active' as const,
          model: 'gemini-1.5-flash' as const,
          priority: 1,
          region: 'us-central1',
          environment: 'production' as const,
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
            status: 'healthy' as const
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
          status: 'active' as const,
          model: 'gemini-1.5-pro' as const,
          priority: 2,
          region: 'us-west1',
          environment: 'development' as const,
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
            status: 'healthy' as const
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
          status: 'warning' as const,
          model: 'gemini-pro' as const,
          priority: 3,
          region: 'europe-west1',
          environment: 'production' as const,
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
            status: 'degraded' as const
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
        },
        {
          id: '4',
          name: 'Staging',
          key: 'AIzaSyD*********************',
          status: 'limited' as const,
          model: 'gemini-1.5-flash' as const,
          priority: 4,
          region: 'asia-southeast1',
          environment: 'staging' as const,
          usage: {
            requests: 234,
            tokens: 12800,
            limit: 3000,
            resetDate: '2025-08-01',
            errors: 1,
            avgResponseTime: 1.5
          },
          health: {
            lastCheck: '2025-07-05T10:20:00Z',
            uptime: 99.2,
            errorRate: 0.4,
            status: 'healthy' as const
          },
          config: {
            autoRotate: true,
            maxRetries: 3,
            timeout: 30,
            rateLimit: 40
          },
          createdAt: '2025-04-01',
          lastUsed: '2025-07-05T10:20:00Z',
          tags: ['staging', 'pre-production']
        }
      ];
      setApiKeys(keys);
      setLoading(false);
    }, 1000);
  };

  const calculateMetrics = useCallback(() => {
    const total = apiKeys.length;
    const active = apiKeys.filter(key => key.status === 'active').length;
    const totalReqs = apiKeys.reduce((sum, key) => sum + key.usage.requests, 0);
    const totalToks = apiKeys.reduce((sum, key) => sum + key.usage.tokens, 0);
    const avgResponse = apiKeys.length > 0 ? 
      apiKeys.reduce((sum, key) => sum + key.usage.avgResponseTime, 0) / apiKeys.length : 0;
    const avgUp = apiKeys.length > 0 ? 
      apiKeys.reduce((sum, key) => sum + key.health.uptime, 0) / apiKeys.length : 0;
    const totalErrs = apiKeys.reduce((sum, key) => sum + key.usage.errors, 0);

    setMetrics({
      totalKeys: total,
      activeKeys: active,
      totalRequests: totalReqs,
      totalTokens: totalToks,
      avgResponseTime: avgResponse,
      avgUptime: avgUp,
      totalErrors: totalErrs
    });
  }, [apiKeys]);

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...apiKeys];

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(key => 
        key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        key.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        key.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(key => key.status === filterStatus);
    }

    // Filtrar por ambiente
    if (filterEnvironment !== 'all') {
      filtered = filtered.filter(key => key.environment === filterEnvironment);
    }

    // Filtrar por saúde
    if (filterHealth !== 'all') {
      filtered = filtered.filter(key => key.health.status === filterHealth);
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ApiKey];
      let bValue: any = b[sortBy as keyof ApiKey];

      if (sortBy === 'usage.requests') {
        aValue = a.usage.requests;
        bValue = b.usage.requests;
      } else if (sortBy === 'health.uptime') {
        aValue = a.health.uptime;
        bValue = b.health.uptime;
      } else if (sortBy === 'usage.avgResponseTime') {
        aValue = a.usage.avgResponseTime;
        bValue = b.usage.avgResponseTime;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredKeys(filtered);
  }, [apiKeys, searchTerm, filterStatus, filterEnvironment, filterHealth, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
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
        autoRotate: newKey.autoRotate,
        maxRetries: newKey.maxRetries,
        timeout: newKey.timeout,
        rateLimit: newKey.rateLimit
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
      tags: [],
      autoRotate: true,
      maxRetries: 3,
      timeout: 30,
      rateLimit: 60
    });
    setShowAddForm(false);
    setSuccess('Chave API adicionada com sucesso!');
  };

  const handleEditKey = (key: ApiKey) => {
    setEditingKey(key);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingKey) return;

    setApiKeys(apiKeys.map(key => 
      key.id === editingKey.id ? editingKey : key
    ));
    setShowEditModal(false);
    setEditingKey(null);
    setSuccess('Chave API atualizada com sucesso!');
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

  const testKey = async (key: ApiKey) => {
    setSuccess(`Testando chave ${key.name}...`);
    // Simular teste da chave
    setTimeout(() => {
      setSuccess(`✅ Chave ${key.name} está funcionando corretamente!`);
    }, 2000);
  };

  const bulkAction = (action: string) => {
    const selectedKeysData = apiKeys.filter(key => selectedKeys.includes(key.id));
    
    switch (action) {
      case 'activate':
        setApiKeys(apiKeys.map(key => 
          selectedKeys.includes(key.id) ? { ...key, status: 'active' } : key
        ));
        setSuccess(`${selectedKeysData.length} chaves ativadas`);
        break;
      case 'deactivate':
        setApiKeys(apiKeys.map(key => 
          selectedKeys.includes(key.id) ? { ...key, status: 'inactive' } : key
        ));
        setSuccess(`${selectedKeysData.length} chaves desativadas`);
        break;
      case 'delete':
        if (window.confirm(`Tem certeza que deseja excluir ${selectedKeysData.length} chaves?`)) {
          setApiKeys(apiKeys.filter(key => !selectedKeys.includes(key.id)));
          setSuccess(`${selectedKeysData.length} chaves excluídas`);
        }
        break;
    }
    setSelectedKeys([]);
  };

  const exportKeys = () => {
    const csvContent = [
      ['Nome', 'Status', 'Modelo', 'Ambiente', 'Região', 'Requisições', 'Tokens', 'Uptime', 'Última Utilização'].join(','),
      ...filteredKeys.map(key => [
        key.name,
        key.status,
        key.model,
        key.environment,
        key.region,
        key.usage.requests,
        key.usage.tokens,
        `${key.health.uptime}%`,
        key.lastUsed
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-keys-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    setSuccess('Dados exportados com sucesso!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
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
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/admin/api-keys')}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center"
              >
                ← Versão Básica
              </button>
              <button
                onClick={exportKeys}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                📊 Exportar
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

        {/* Métricas Resumidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Total de Chaves</div>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalKeys}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Chaves Ativas</div>
            <div className="text-2xl font-bold text-green-600">{metrics.activeKeys}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Total Requisições</div>
            <div className="text-2xl font-bold text-blue-600">{metrics.totalRequests.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Total Tokens</div>
            <div className="text-2xl font-bold text-purple-600">{metrics.totalTokens.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Tempo Médio</div>
            <div className="text-2xl font-bold text-orange-600">{metrics.avgResponseTime.toFixed(1)}s</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Uptime Médio</div>
            <div className="text-2xl font-bold text-teal-600">{metrics.avgUptime.toFixed(1)}%</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Total Erros</div>
            <div className="text-2xl font-bold text-red-600">{metrics.totalErrors}</div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome, tag, região..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="warning">Aviso</option>
                <option value="limited">Limitado</option>
                <option value="expired">Expirado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ambiente</label>
              <select
                value={filterEnvironment}
                onChange={(e) => setFilterEnvironment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="production">Produção</option>
                <option value="staging">Staging</option>
                <option value="development">Desenvolvimento</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Saúde</label>
              <select
                value={filterHealth}
                onChange={(e) => setFilterHealth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas</option>
                <option value="healthy">Saudável</option>
                <option value="degraded">Degradado</option>
                <option value="unhealthy">Não Saudável</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Nome</option>
                <option value="status">Status</option>
                <option value="environment">Ambiente</option>
                <option value="usage.requests">Requisições</option>
                <option value="health.uptime">Uptime</option>
                <option value="usage.avgResponseTime">Tempo Resposta</option>
                <option value="createdAt">Data Criação</option>
              </select>
            </div>
          </div>

          {selectedKeys.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedKeys.length} chave(s) selecionada(s)
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => bulkAction('activate')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Ativar
                  </button>
                  <button
                    onClick={() => bulkAction('deactivate')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Desativar
                  </button>
                  <button
                    onClick={() => bulkAction('delete')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabela de Chaves */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedKeys.length === filteredKeys.length && filteredKeys.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedKeys(filteredKeys.map(key => key.id));
                        } else {
                          setSelectedKeys([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Nome {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chave
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('environment')}
                  >
                    Ambiente {sortBy === 'environment' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Saúde
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(key.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKeys([...selectedKeys, key.id]);
                          } else {
                            setSelectedKeys(selectedKeys.filter(id => id !== key.id));
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{key.name}</div>
                        <div className="text-sm text-gray-500">Prioridade: {key.priority}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {key.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{formatKey(key.key)}</div>
                      <div className="text-sm text-gray-500">{key.region}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{key.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        key.environment === 'production' ? 'bg-red-100 text-red-800' :
                        key.environment === 'staging' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {key.environment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{key.usage.requests.toLocaleString()} req</div>
                      <div className="text-gray-500">{key.usage.tokens.toLocaleString()} tokens</div>
                      <div className="text-gray-500">{((key.usage.requests / key.usage.limit) * 100).toFixed(1)}% usado</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthColor(key.health.status)}`}>
                          {key.health.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {key.health.uptime.toFixed(1)}% uptime
                      </div>
                      <div className="text-sm text-gray-500">
                        {key.usage.avgResponseTime.toFixed(1)}s resp
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => testKey(key)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Testar chave"
                        >
                          🧪
                        </button>
                        <button
                          onClick={() => handleEditKey(key)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => toggleKeyStatus(key.id)}
                          className={`${key.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={key.status === 'active' ? 'Desativar' : 'Ativar'}
                        >
                          {key.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => deleteKey(key.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredKeys.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma chave encontrada com os filtros aplicados.</p>
            </div>
          )}
        </div>

        {/* Modal de Adicionar Chave */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Nova Chave API</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={newKey.name}
                    onChange={(e) => setNewKey({...newKey, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Produção Principal"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chave API</label>
                  <input
                    type="text"
                    value={newKey.key}
                    onChange={(e) => setNewKey({...newKey, key: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="AIzaSy..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                    <select
                      value={newKey.model}
                      onChange={(e) => setNewKey({...newKey, model: e.target.value as any})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-pro">Gemini Pro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ambiente</label>
                    <select
                      value={newKey.environment}
                      onChange={(e) => setNewKey({...newKey, environment: e.target.value as any})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="development">Desenvolvimento</option>
                      <option value="staging">Staging</option>
                      <option value="production">Produção</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Região</label>
                    <select
                      value={newKey.region}
                      onChange={(e) => setNewKey({...newKey, region: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="us-central1">US Central</option>
                      <option value="us-west1">US West</option>
                      <option value="europe-west1">Europe West</option>
                      <option value="asia-southeast1">Asia Southeast</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newKey.priority}
                      onChange={(e) => setNewKey({...newKey, priority: parseInt(e.target.value)})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Limite Diário</label>
                  <input
                    type="number"
                    value={newKey.limit}
                    onChange={(e) => setNewKey({...newKey, limit: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Editar Chave */}
        {showEditModal && editingKey && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Editar Chave API</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={editingKey.name}
                    onChange={(e) => setEditingKey({...editingKey, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingKey.priority}
                    onChange={(e) => setEditingKey({...editingKey, priority: parseInt(e.target.value)})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Limite Diário</label>
                  <input
                    type="number"
                    value={editingKey.usage.limit}
                    onChange={(e) => setEditingKey({
                      ...editingKey, 
                      usage: {...editingKey.usage, limit: parseInt(e.target.value)}
                    })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Rotação Automática</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingKey.config.autoRotate}
                        onChange={(e) => setEditingKey({
                          ...editingKey,
                          config: {...editingKey.config, autoRotate: e.target.checked}
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeysManagement;
