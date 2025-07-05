import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Alert from '../../components/Alert';

// PROMPT PARA COPILOT: Criar dashboard principal do admin com métricas, estatísticas e navegação

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRequests: number;
  totalTokensUsed: number;
  averageResponseTime: number;
  successRate: number;
  apiKeysCount: number;
  activeApiKeys: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRequests: 0,
    totalTokensUsed: 0,
    averageResponseTime: 0,
    successRate: 0,
    apiKeysCount: 0,
    activeApiKeys: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulando dados para demonstração
    setTimeout(() => {
      setStats({
        totalUsers: 156,
        activeUsers: 23,
        totalRequests: 2847,
        totalTokensUsed: 158420,
        averageResponseTime: 1.8,
        successRate: 97.5,
        apiKeysCount: 8,
        activeApiKeys: 6
      });
      setLoading(false);
    }, 1000);
  }, []);

  const statsCards = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers.toLocaleString(),
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Usuários Ativos',
      value: stats.activeUsers.toLocaleString(),
      icon: '🟢',
      color: 'bg-green-500',
      change: '+5%'
    },
    {
      title: 'Total de Requisições',
      value: stats.totalRequests.toLocaleString(),
      icon: '📊',
      color: 'bg-purple-500',
      change: '+23%'
    },
    {
      title: 'Tokens Utilizados',
      value: stats.totalTokensUsed.toLocaleString(),
      icon: '🎯',
      color: 'bg-orange-500',
      change: '+18%'
    },
    {
      title: 'Tempo de Resposta',
      value: `${stats.averageResponseTime}s`,
      icon: '⚡',
      color: 'bg-yellow-500',
      change: '-0.2s'
    },
    {
      title: 'Taxa de Sucesso',
      value: `${stats.successRate}%`,
      icon: '✅',
      color: 'bg-green-600',
      change: '+0.5%'
    },
    {
      title: 'Chaves API',
      value: `${stats.activeApiKeys}/${stats.apiKeysCount}`,
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

        {/* Gráfico de Atividade Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade Recente</h3>
            <div className="space-y-4">
              {[
                { user: 'admin', action: 'Login realizado', time: '2 min atrás', type: 'success' },
                { user: 'user01', action: 'Requisição Gemini processada', time: '5 min atrás', type: 'info' },
                { user: 'user02', action: 'Erro de autenticação', time: '12 min atrás', type: 'error' },
                { user: 'system', action: 'Nova chave API adicionada', time: '1h atrás', type: 'warning' },
                { user: 'user03', action: 'Conta criada', time: '2h atrás', type: 'success' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'error' ? 'bg-red-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">Por {activity.user}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status do Sistema</h3>
            <div className="space-y-4">
              {[
                { service: 'API Backend', status: 'online', uptime: '99.9%' },
                { service: 'Gemini AI', status: 'online', uptime: '98.7%' },
                { service: 'Base de Dados', status: 'online', uptime: '99.8%' },
                { service: 'Sistema de Logs', status: 'online', uptime: '100%' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">{service.service}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-green-600">Online</span>
                    <p className="text-xs text-gray-500">{service.uptime} uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
