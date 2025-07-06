import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../../components/Alert';
import { adminApi } from '../../services/api';

// PROMPT PARA COPILOT: Criar dashboard principal do admin com métricas, estatísticas e navegação

interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  apiKeys: {
    total: number;
    active: number;
    inactive: number;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  lastUpdated: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    users: {
      total: 0,
      active: 0,
      inactive: 0
    },
    apiKeys: {
      total: 0,
      active: 0,
      inactive: 0
    },
    requests: {
      total: 0,
      successful: 0,
      failed: 0,
      successRate: 0
    },
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminApi.getDashboard();
      
      if (response.status === 'success') {
        setStats(response.data);
      } else {
        setError(response.message || 'Erro ao carregar dados do dashboard');
      }
    } catch (err: any) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError(err.response?.data?.message || 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: stats.users.total.toLocaleString(),
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Usuários Ativos',
      value: stats.users.active.toLocaleString(),
      icon: '🟢',
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Total de Requisições',
      value: stats.requests.total.toLocaleString(),
      icon: '📊',
      color: 'bg-purple-500',
      change: '+23%'
    },
    {
      title: 'Taxa de Sucesso',
      value: `${stats.requests.successRate}%`,
      icon: '✅',
      color: 'bg-green-600',
      change: '+0.5%'
    },
    {
      title: 'Tempo de Resposta',
      value: '250ms',
      icon: '⚡',
      color: 'bg-yellow-500',
      change: '-0.2s'
    },
    {
      title: 'Chaves API',
      value: `${stats.apiKeys.active}/${stats.apiKeys.total}`,
      icon: '🔑',
      color: 'bg-indigo-500',
      change: '+2'
    },
    {
      title: 'Uptime do Sistema',
      value: '99.9%',
      icon: '⏰',
      color: 'bg-teal-500',
      change: 'Estável'
    }
  ];

  const quickActions = [
    {
      title: 'Gerenciar Chaves API',
      description: 'Configure e monitore chaves do Gemini',
      icon: '🔑',
      color: 'bg-blue-500',
      onClick: () => navigate('/admin/api-keys')
    },
    {
      title: 'Gerenciar Usuários',
      description: 'Visualizar e editar usuários',
      icon: '👥',
      color: 'bg-green-500',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Histórico de Requisições',
      description: 'Logs e análises detalhadas',
      icon: '📊',
      color: 'bg-purple-500',
      onClick: () => navigate('/admin/requests')
    },
    {
      title: 'Configurações do Sistema',
      description: 'Parâmetros gerais da aplicação',
      icon: '⚙️',
      color: 'bg-gray-500',
      onClick: () => navigate('/admin/settings')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Bem-vindo, {user?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Atualizando...' : 'Atualizar'}
              </button>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Sistema Online
              </span>
              <button
                onClick={() => navigate('/gemini')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Voltar ao Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} className="mb-6" />
        )}

        {/* Estatísticas */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Estatísticas do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsCards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`${card.color} rounded-full p-3 text-white text-xl`}>
                    {card.icon}
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600 font-medium">{card.change}</span>
                  <span className="text-sm text-gray-500 ml-1">vs. mês anterior</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className={`${action.color} rounded-full p-3 text-white text-xl w-fit mb-4`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Informações do Sistema */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo de Atividade</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-3 bg-green-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Requisições Bem-sucedidas</p>
                    <p className="text-xs text-gray-500">{stats.requests.successful} requisições</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Hoje</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-3 bg-red-500"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Requisições com Falha</p>
                    <p className="text-xs text-gray-500">{stats.requests.failed} requisições</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">Hoje</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status do Sistema</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-900">API Gateway</span>
                </div>
                <span className="text-xs text-gray-500 bg-green-100 text-green-800 px-2 py-1 rounded">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-900">Base de Dados</span>
                </div>
                <span className="text-xs text-gray-500 bg-green-100 text-green-800 px-2 py-1 rounded">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3 bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-900">Gemini AI</span>
                </div>
                <span className="text-xs text-gray-500 bg-green-100 text-green-800 px-2 py-1 rounded">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
