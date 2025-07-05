import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';

interface SystemConfig {
  // Rate Limiting
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    burstLimit: number;
  };
  
  // Gemini Configuration
  gemini: {
    defaultModel: 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-pro';
    maxTokens: number;
    temperature: number;
    topP: number;
    topK: number;
    timeout: number;
    retryAttempts: number;
    autoRotateKeys: boolean;
    loadBalancing: boolean;
  };
  
  // Security
  security: {
    jwtExpiration: number; // em horas
    passwordMinLength: number;
    requireSpecialChars: boolean;
    sessionTimeout: number; // em minutos
    maxLoginAttempts: number;
    lockoutDuration: number; // em minutos
    twoFactorAuth: boolean;
  };
  
  // Logging
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    retentionDays: number;
    logRequests: boolean;
    logResponses: boolean;
    logErrors: boolean;
    anonymizeData: boolean;
  };
  
  // Monitoring
  monitoring: {
    healthCheckInterval: number; // em segundos
    alertThresholds: {
      errorRate: number; // porcentagem
      responseTime: number; // em segundos
      memoryUsage: number; // porcentagem
      cpuUsage: number; // porcentagem
    };
    emailAlerts: boolean;
    slackWebhook: string;
  };
  
  // Business Rules
  business: {
    freeUserDailyLimit: number;
    premiumUserDailyLimit: number;
    enterpriseUserDailyLimit: number;
    maxConcurrentRequests: number;
    maintenanceMode: boolean;
    allowNewRegistrations: boolean;
  };
}

const SystemSettings: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
      burstLimit: 10
    },
    gemini: {
      defaultModel: 'gemini-1.5-flash',
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      timeout: 30,
      retryAttempts: 3,
      autoRotateKeys: true,
      loadBalancing: true
    },
    security: {
      jwtExpiration: 24,
      passwordMinLength: 8,
      requireSpecialChars: true,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      twoFactorAuth: false
    },
    logging: {
      level: 'info',
      retentionDays: 30,
      logRequests: true,
      logResponses: false,
      logErrors: true,
      anonymizeData: true
    },
    monitoring: {
      healthCheckInterval: 30,
      alertThresholds: {
        errorRate: 5,
        responseTime: 5,
        memoryUsage: 80,
        cpuUsage: 70
      },
      emailAlerts: true,
      slackWebhook: ''
    },
    business: {
      freeUserDailyLimit: 100,
      premiumUserDailyLimit: 1000,
      enterpriseUserDailyLimit: 10000,
      maxConcurrentRequests: 50,
      maintenanceMode: false,
      allowNewRegistrations: true
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('rateLimiting');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Simular carregamento das configurações
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Configurações salvas com sucesso!');
    } catch (err) {
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'rateLimiting', name: 'Rate Limiting', icon: '⚡' },
    { id: 'gemini', name: 'Gemini AI', icon: '🤖' },
    { id: 'security', name: 'Segurança', icon: '🔒' },
    { id: 'logging', name: 'Logs', icon: '📝' },
    { id: 'monitoring', name: 'Monitoramento', icon: '📊' },
    { id: 'business', name: 'Regras de Negócio', icon: '💼' }
  ];

  const renderRateLimitingSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Rate Limiting</h3>
          <p className="text-sm text-gray-500">Configure os limites de requisições por usuário</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.rateLimiting.enabled}
            onChange={(e) => handleConfigChange('rateLimiting', 'enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requisições por Minuto
          </label>
          <input
            type="number"
            value={config.rateLimiting.requestsPerMinute}
            onChange={(e) => handleConfigChange('rateLimiting', 'requestsPerMinute', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requisições por Hora
          </label>
          <input
            type="number"
            value={config.rateLimiting.requestsPerHour}
            onChange={(e) => handleConfigChange('rateLimiting', 'requestsPerHour', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requisições por Dia
          </label>
          <input
            type="number"
            value={config.rateLimiting.requestsPerDay}
            onChange={(e) => handleConfigChange('rateLimiting', 'requestsPerDay', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Limite de Burst
          </label>
          <input
            type="number"
            value={config.rateLimiting.burstLimit}
            onChange={(e) => handleConfigChange('rateLimiting', 'burstLimit', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderGeminiSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações do Gemini AI</h3>
        <p className="text-sm text-gray-500">Configure os parâmetros de integração com a API do Gemini</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modelo Padrão
          </label>
          <select
            value={config.gemini.defaultModel}
            onChange={(e) => handleConfigChange('gemini', 'defaultModel', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="gemini-pro">Gemini Pro</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de Tokens
          </label>
          <input
            type="number"
            value={config.gemini.maxTokens}
            onChange={(e) => handleConfigChange('gemini', 'maxTokens', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperature ({config.gemini.temperature})
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.gemini.temperature}
            onChange={(e) => handleConfigChange('gemini', 'temperature', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Top P ({config.gemini.topP})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.gemini.topP}
            onChange={(e) => handleConfigChange('gemini', 'topP', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Top K
          </label>
          <input
            type="number"
            value={config.gemini.topK}
            onChange={(e) => handleConfigChange('gemini', 'topK', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeout (segundos)
          </label>
          <input
            type="number"
            value={config.gemini.timeout}
            onChange={(e) => handleConfigChange('gemini', 'timeout', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div>
            <h4 className="font-medium text-gray-900">Rotação Automática de Chaves</h4>
            <p className="text-sm text-gray-500">Alternar chaves automaticamente em caso de erro</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.gemini.autoRotateKeys}
              onChange={(e) => handleConfigChange('gemini', 'autoRotateKeys', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div>
            <h4 className="font-medium text-gray-900">Load Balancing</h4>
            <p className="text-sm text-gray-500">Distribuir requisições entre múltiplas chaves</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.gemini.loadBalancing}
              onChange={(e) => handleConfigChange('gemini', 'loadBalancing', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Configurações de Segurança</h3>
        <p className="text-sm text-gray-500">Configure políticas de segurança e autenticação</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiração JWT (horas)
          </label>
          <input
            type="number"
            value={config.security.jwtExpiration}
            onChange={(e) => handleConfigChange('security', 'jwtExpiration', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tamanho Mínimo da Senha
          </label>
          <input
            type="number"
            value={config.security.passwordMinLength}
            onChange={(e) => handleConfigChange('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeout de Sessão (minutos)
          </label>
          <input
            type="number"
            value={config.security.sessionTimeout}
            onChange={(e) => handleConfigChange('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de Tentativas de Login
          </label>
          <input
            type="number"
            value={config.security.maxLoginAttempts}
            onChange={(e) => handleConfigChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div>
            <h4 className="font-medium text-gray-900">Exigir Caracteres Especiais</h4>
            <p className="text-sm text-gray-500">Obrigar uso de caracteres especiais nas senhas</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.security.requireSpecialChars}
              onChange={(e) => handleConfigChange('security', 'requireSpecialChars', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
          <div>
            <h4 className="font-medium text-gray-900">Autenticação de Dois Fatores</h4>
            <p className="text-sm text-gray-500">Habilitar 2FA para todos os usuários</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.security.twoFactorAuth}
              onChange={(e) => handleConfigChange('security', 'twoFactorAuth', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderCurrentTabContent = () => {
    switch (activeTab) {
      case 'rateLimiting':
        return renderRateLimitingSettings();
      case 'gemini':
        return renderGeminiSettings();
      case 'security':
        return renderSecuritySettings();
      case 'logging':
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Configurações de Logging em desenvolvimento...</p>
          </div>
        );
      case 'monitoring':
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Configurações de Monitoramento em desenvolvimento...</p>
          </div>
        );
      case 'business':
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Regras de Negócio em desenvolvimento...</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando configurações...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
              <p className="text-gray-600">Configure parâmetros avançados da aplicação</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Configurações'
              )}
            </button>
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

        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderCurrentTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
