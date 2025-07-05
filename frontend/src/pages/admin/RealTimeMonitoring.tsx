import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';

interface RealTimeMetrics {
  timestamp: string;
  activeConnections: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  source: string;
}

interface ApiEndpointMetrics {
  endpoint: string;
  method: string;
  requests: number;
  avgResponseTime: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

const RealTimeMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState<RealTimeMetrics[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<RealTimeMetrics>({
    timestamp: new Date().toISOString(),
    activeConnections: 0,
    requestsPerSecond: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkIn: 0,
    networkOut: 0
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [endpointMetrics, setEndpointMetrics] = useState<ApiEndpointMetrics[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Inicializar dados mock
    generateMockData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        updateMetrics();
      }, 5000); // Atualizar a cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const generateMockData = () => {
    // Gerar dados de alerta mock
    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'error',
        title: 'Alta Taxa de Erro',
        message: 'Taxa de erro da API Gemini excedeu 5% nos últimos 10 minutos',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        resolved: false,
        source: 'gemini-api'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Alto Uso de CPU',
        message: 'Uso de CPU está em 78% - próximo do limite de 80%',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        resolved: false,
        source: 'system'
      },
      {
        id: '3',
        type: 'info',
        title: 'Chave API Rotacionada',
        message: 'Chave API de produção foi automaticamente rotacionada devido a limite',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        resolved: true,
        source: 'api-manager'
      }
    ];

    // Gerar métricas de endpoint mock
    const mockEndpoints: ApiEndpointMetrics[] = [
      {
        endpoint: '/api/gemini/chat',
        method: 'POST',
        requests: 1247,
        avgResponseTime: 2.1,
        errorRate: 2.3,
        p95ResponseTime: 4.2,
        p99ResponseTime: 8.7
      },
      {
        endpoint: '/api/auth/login',
        method: 'POST',
        requests: 89,
        avgResponseTime: 0.8,
        errorRate: 0.5,
        p95ResponseTime: 1.5,
        p99ResponseTime: 2.1
      },
      {
        endpoint: '/api/auth/validate',
        method: 'GET',
        requests: 3421,
        avgResponseTime: 0.3,
        errorRate: 0.1,
        p95ResponseTime: 0.7,
        p99ResponseTime: 1.2
      },
      {
        endpoint: '/api/admin/keys',
        method: 'GET',
        requests: 45,
        avgResponseTime: 1.2,
        errorRate: 0,
        p95ResponseTime: 2.8,
        p99ResponseTime: 4.1
      }
    ];

    // Gerar histórico de métricas mock
    const now = Date.now();
    const mockMetrics: RealTimeMetrics[] = [];
    
    for (let i = 60; i >= 0; i--) {
      const timestamp = new Date(now - i * 60000).toISOString();
      mockMetrics.push({
        timestamp,
        activeConnections: Math.floor(Math.random() * 50) + 10,
        requestsPerSecond: Math.floor(Math.random() * 20) + 5,
        averageResponseTime: Math.random() * 3 + 1,
        errorRate: Math.random() * 5,
        cpuUsage: Math.random() * 30 + 40,
        memoryUsage: Math.random() * 20 + 60,
        diskUsage: Math.random() * 10 + 45,
        networkIn: Math.random() * 100 + 50,
        networkOut: Math.random() * 80 + 30
      });
    }

    setAlerts(mockAlerts);
    setEndpointMetrics(mockEndpoints);
    setMetrics(mockMetrics);
    setCurrentMetrics(mockMetrics[mockMetrics.length - 1]);
  };

  const updateMetrics = () => {
    const newMetric: RealTimeMetrics = {
      timestamp: new Date().toISOString(),
      activeConnections: Math.floor(Math.random() * 50) + 10,
      requestsPerSecond: Math.floor(Math.random() * 20) + 5,
      averageResponseTime: Math.random() * 3 + 1,
      errorRate: Math.random() * 5,
      cpuUsage: Math.random() * 30 + 40,
      memoryUsage: Math.random() * 20 + 60,
      diskUsage: Math.random() * 10 + 45,
      networkIn: Math.random() * 100 + 50,
      networkOut: Math.random() * 80 + 30
    };

    setCurrentMetrics(newMetric);
    setMetrics(prev => [...prev.slice(-59), newMetric]); // Manter apenas os últimos 60 pontos

    // Simular novos alertas ocasionalmente
    if (Math.random() < 0.1) { // 10% de chance
      const newAlert: SystemAlert = {
        id: Date.now().toString(),
        type: Math.random() < 0.3 ? 'error' : Math.random() < 0.6 ? 'warning' : 'info',
        title: 'Novo Alerta',
        message: 'Alerta gerado automaticamente pelo sistema de monitoramento',
        timestamp: new Date().toISOString(),
        resolved: false,
        source: 'monitoring'
      };
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)]); // Manter apenas os 10 alertas mais recentes
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    setSuccess('Alerta marcado como resolvido');
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    setSuccess('Alerta removido');
  };

  const exportMetrics = () => {
    const csvContent = [
      ['Timestamp', 'Active Connections', 'Requests/s', 'Avg Response Time', 'Error Rate', 'CPU Usage', 'Memory Usage'].join(','),
      ...metrics.map(metric => [
        metric.timestamp,
        metric.activeConnections,
        metric.requestsPerSecond,
        metric.averageResponseTime.toFixed(2),
        metric.errorRate.toFixed(2),
        metric.cpuUsage.toFixed(1),
        metric.memoryUsage.toFixed(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSuccess('Métricas exportadas com sucesso!');
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  };

  const formatNumber = (num: number, decimals = 1) => {
    return num.toFixed(decimals);
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Monitoramento em Tempo Real</h1>
              <p className="text-gray-600">Métricas do sistema e alertas em tempo real</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Auto-refresh:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <button
                onClick={exportMetrics}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                📊 Exportar
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

        {/* Métricas em Tempo Real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Conexões Ativas</div>
                <div className="text-2xl font-bold text-blue-600">{currentMetrics.activeConnections}</div>
              </div>
              <div className="text-blue-500 text-2xl">🔗</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Req/s</div>
                <div className="text-2xl font-bold text-green-600">{currentMetrics.requestsPerSecond}</div>
              </div>
              <div className="text-green-500 text-2xl">⚡</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Tempo Resposta</div>
                <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.averageResponseTime, { warning: 2, critical: 5 })}`}>
                  {formatNumber(currentMetrics.averageResponseTime)}s
                </div>
              </div>
              <div className="text-purple-500 text-2xl">⏱️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Taxa de Erro</div>
                <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.errorRate, { warning: 2, critical: 5 })}`}>
                  {formatNumber(currentMetrics.errorRate)}%
                </div>
              </div>
              <div className="text-red-500 text-2xl">❌</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">CPU</div>
                <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.cpuUsage, { warning: 70, critical: 90 })}`}>
                  {formatNumber(currentMetrics.cpuUsage)}%
                </div>
              </div>
              <div className="text-orange-500 text-2xl">🖥️</div>
            </div>
          </div>
        </div>

        {/* Recursos do Sistema */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recursos do Sistema</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">CPU</span>
                  <span className={`text-sm font-medium ${getStatusColor(currentMetrics.cpuUsage, { warning: 70, critical: 90 })}`}>
                    {formatNumber(currentMetrics.cpuUsage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      currentMetrics.cpuUsage >= 90 ? 'bg-red-500' :
                      currentMetrics.cpuUsage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(currentMetrics.cpuUsage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Memória</span>
                  <span className={`text-sm font-medium ${getStatusColor(currentMetrics.memoryUsage, { warning: 80, critical: 95 })}`}>
                    {formatNumber(currentMetrics.memoryUsage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      currentMetrics.memoryUsage >= 95 ? 'bg-red-500' :
                      currentMetrics.memoryUsage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(currentMetrics.memoryUsage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Disco</span>
                  <span className={`text-sm font-medium ${getStatusColor(currentMetrics.diskUsage, { warning: 80, critical: 95 })}`}>
                    {formatNumber(currentMetrics.diskUsage)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      currentMetrics.diskUsage >= 95 ? 'bg-red-500' :
                      currentMetrics.diskUsage >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(currentMetrics.diskUsage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Network In</div>
                  <div className="text-lg font-medium text-blue-600">{formatNumber(currentMetrics.networkIn)} MB/s</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Network Out</div>
                  <div className="text-lg font-medium text-green-600">{formatNumber(currentMetrics.networkOut)} MB/s</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance dos Endpoints</h3>
            <div className="space-y-4">
              {endpointMetrics.map((endpoint, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{endpoint.endpoint}</div>
                      <div className="text-xs text-gray-500">{endpoint.method}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{endpoint.requests}</div>
                      <div className="text-xs text-gray-500">requests</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Avg:</span>
                      <span className="ml-1 font-medium">{formatNumber(endpoint.avgResponseTime)}s</span>
                    </div>
                    <div>
                      <span className="text-gray-500">P95:</span>
                      <span className="ml-1 font-medium">{formatNumber(endpoint.p95ResponseTime)}s</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Err:</span>
                      <span className={`ml-1 font-medium ${getStatusColor(endpoint.errorRate, { warning: 2, critical: 5 })}`}>
                        {formatNumber(endpoint.errorRate)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gráfico de Requisições</h3>
            <div className="h-40 flex items-end space-x-1">
              {metrics.slice(-20).map((metric, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(metric.requestsPerSecond / 25) * 100}%`,
                      minHeight: '2px'
                    }}
                  ></div>
                  {index % 5 === 0 && (
                    <div className="text-xs text-gray-500 mt-1 transform rotate-45">
                      {formatTime(metric.timestamp)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertas do Sistema */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Alertas do Sistema</h3>
            <span className="text-sm text-gray-500">
              {alerts.filter(alert => !alert.resolved).length} ativos de {alerts.length} total
            </span>
          </div>

          <div className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`border rounded-lg p-4 ${getAlertColor(alert.type)} ${alert.resolved ? 'opacity-60' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="font-medium text-sm">
                        {alert.type === 'error' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}
                      </span>
                      <span className="ml-2 font-medium">{alert.title}</span>
                      {alert.resolved && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Resolvido
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-2">{alert.message}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>Fonte: {alert.source}</span>
                      <span className="mx-2">•</span>
                      <span>{formatTime(alert.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-green-600 hover:text-green-800"
                        title="Marcar como resolvido"
                      >
                        ✅
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remover alerta"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">✨</div>
                <p className="text-gray-500">Nenhum alerta no momento</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;
