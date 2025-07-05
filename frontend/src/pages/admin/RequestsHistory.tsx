import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';

// PROMPT PARA COPILOT: Histórico completo de requisições com filtros, análise e exportação

interface RequestLog {
  id: string;
  userId: number;
  username: string;
  prompt: string;
  response: string;
  model: string;
  tokens: number;
  processingTime: number;
  status: 'success' | 'error' | 'timeout';
  timestamp: string;
  apiKey: string;
  ip: string;
}

const RequestsHistory: React.FC = () => {
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RequestLog | null>(null);
  
  // Filtros
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterModel, setFilterModel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const navigate = useNavigate();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    // Simulando dados para demonstração
    setTimeout(() => {
      const mockRequests: RequestLog[] = [
        {
          id: '1',
          userId: 1,
          username: 'admin',
          prompt: 'Explique o que é Node.js em uma frase simples',
          response: 'Node.js é um ambiente de execução JavaScript que permite executar código JavaScript fora de um navegador web.',
          model: 'gemini-1.5-flash',
          tokens: 157,
          processingTime: 1356,
          status: 'success',
          timestamp: '2025-07-05T18:38:37.947Z',
          apiKey: 'AIzaSyDGivgsIx4L_E1swuNIWnmDPfSNnlWNDLs',
          ip: '::1'
        },
        {
          id: '2',
          userId: 2,
          username: 'user',
          prompt: 'Conte uma piada sobre programação',
          response: 'Por que o programador ficou tão magro? Porque só comia *bytes*!',
          model: 'gemini-1.5-flash',
          tokens: 89,
          processingTime: 1205,
          status: 'success',
          timestamp: '2025-07-05T17:25:15.123Z',
          apiKey: 'AIzaSyDGivgsIx4L_E1swuNIWnmDPfSNnlWNDLs',
          ip: '192.168.1.100'
        },
        {
          id: '3',
          userId: 3,
          username: 'premium_user',
          prompt: 'Gere um código Python para calcular fibonacci',
          response: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    else:\n        return fibonacci(n-1) + fibonacci(n-2)',
          model: 'gemini-1.5-pro',
          tokens: 234,
          processingTime: 2150,
          status: 'success',
          timestamp: '2025-07-05T16:15:45.789Z',
          apiKey: 'AIzaSyB*********************',
          ip: '192.168.1.101'
        },
        {
          id: '4',
          userId: 2,
          username: 'user',
          prompt: 'Texto muito longo que excede o limite...',
          response: '',
          model: 'gemini-1.5-flash',
          tokens: 0,
          processingTime: 500,
          status: 'error',
          timestamp: '2025-07-05T15:45:22.456Z',
          apiKey: 'AIzaSyDGivgsIx4L_E1swuNIWnmDPfSNnlWNDLs',
          ip: '192.168.1.100'
        },
        {
          id: '5',
          userId: 4,
          username: 'inactive_user',
          prompt: 'Como criar uma API REST?',
          response: '',
          model: 'gemini-pro',
          tokens: 0,
          processingTime: 30000,
          status: 'timeout',
          timestamp: '2025-07-05T14:30:10.234Z',
          apiKey: 'AIzaSyC*********************',
          ip: '192.168.1.102'
        }
      ];

      // Gerar mais dados para demonstração
      for (let i = 6; i <= 50; i++) {
        mockRequests.push({
          id: i.toString(),
          userId: Math.floor(Math.random() * 4) + 1,
          username: ['admin', 'user', 'premium_user', 'inactive_user'][Math.floor(Math.random() * 4)],
          prompt: `Prompt de exemplo número ${i}`,
          response: `Resposta gerada para o prompt ${i}`,
          model: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'][Math.floor(Math.random() * 3)],
          tokens: Math.floor(Math.random() * 500) + 50,
          processingTime: Math.floor(Math.random() * 3000) + 500,
          status: ['success', 'error', 'timeout'][Math.floor(Math.random() * 3)] as any,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          apiKey: 'AIzaSy*********************',
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`
        });
      }

      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  };

  const filteredRequests = requests.filter(request => {
    const matchesUser = !filterUser || request.username.toLowerCase().includes(filterUser.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesModel = filterModel === 'all' || request.model === filterModel;
    
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const requestDate = new Date(request.timestamp);
      if (dateFrom) matchesDate = requestDate >= new Date(dateFrom);
      if (dateTo && matchesDate) matchesDate = requestDate <= new Date(dateTo);
    }
    
    return matchesUser && matchesStatus && matchesModel && matchesDate;
  });

  // Paginação
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'timeout': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Usuário', 'Modelo', 'Status', 'Tokens', 'Tempo (ms)', 'Data'];
    const csvContent = [
      headers.join(','),
      ...filteredRequests.map(req => [
        req.id,
        req.username,
        req.model,
        req.status,
        req.tokens,
        req.processingTime,
        new Date(req.timestamp).toLocaleString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requisitions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando histórico...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Histórico de Requisições</h1>
              <p className="text-gray-600">Análise detalhada de todas as interações com a IA</p>
            </div>
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              📊 Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} className="mb-6" />
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-blue-600">{requests.length.toLocaleString()}</div>
            <div className="text-gray-600">Total de Requisições</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'success').length.toLocaleString()}
            </div>
            <div className="text-gray-600">Sucessos</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-purple-600">
              {requests.reduce((sum, r) => sum + r.tokens, 0).toLocaleString()}
            </div>
            <div className="text-gray-600">Tokens Utilizados</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-2xl font-bold text-orange-600">
              {(requests.reduce((sum, r) => sum + r.processingTime, 0) / requests.length / 1000).toFixed(2)}s
            </div>
            <div className="text-gray-600">Tempo Médio</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
              <input
                type="text"
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome do usuário..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="success">Sucesso</option>
                <option value="error">Erro</option>
                <option value="timeout">Timeout</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setFilterUser('');
                  setFilterStatus('all');
                  setFilterModel('all');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Requisições */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Requisições ({filteredRequests.length.toLocaleString()})
            </h3>
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID / Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prompt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modelo / Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Métricas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{request.id}</div>
                        <div className="text-sm text-gray-500">{request.username}</div>
                        <div className="text-xs text-gray-400">{request.ip}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {truncateText(request.prompt, 100)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.model}
                        </span>
                        <br />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status === 'success' ? 'Sucesso' : 
                           request.status === 'error' ? 'Erro' : 'Timeout'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{request.tokens} tokens</div>
                        <div className="text-gray-500">{(request.processingTime / 1000).toFixed(2)}s</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredRequests.length)}</span> de{' '}
                  <span className="font-medium">{filteredRequests.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ←
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalhes da Requisição #{selectedRequest.id}
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usuário</label>
                    <p className="text-sm text-gray-900">{selectedRequest.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status === 'success' ? 'Sucesso' : 
                       selectedRequest.status === 'error' ? 'Erro' : 'Timeout'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Modelo</label>
                    <p className="text-sm text-gray-900">{selectedRequest.model}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tokens</label>
                    <p className="text-sm text-gray-900">{selectedRequest.tokens}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tempo de Processamento</label>
                    <p className="text-sm text-gray-900">{(selectedRequest.processingTime / 1000).toFixed(2)}s</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP</label>
                    <p className="text-sm text-gray-900">{selectedRequest.ip}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.prompt}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resposta</label>
                  <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedRequest.response || 'Nenhuma resposta (erro)'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsHistory;
