import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { geminiApi, GeminiRequest } from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

// PROMPT PARA COPILOT: GeminiPage com formulário para prompt, envia para /api/gemini
// Exibe LoadingSpinner durante requisição e resposta do Gemini formatada

const GeminiPage: React.FC = () => {
  const [formData, setFormData] = useState<GeminiRequest>({
    prompt: '',
    temperature: 0.7,
    maxOutputTokens: 2048
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'temperature' ? parseFloat(value) || 0 : 
               name === 'maxOutputTokens' ? parseInt(value) || 0 : value
    }));
    
    // Clear messages when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResponse(null);

    try {
      const result = await geminiApi.generateContent(formData);
      
      if (result.status === 'success') {
        setResponse(result.data.geminiResponse);
        setSuccess('Resposta gerada com sucesso!');
      } else {
        setError('Falha ao gerar resposta. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Gemini error:', err);
      const errorMessage = err.response?.data?.message || 'Erro de conexão. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const clearResponse = () => {
    setResponse(null);
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Gemini AI Interface</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bem-vindo, <strong>{user?.username}</strong>
              </span>
              
              {/* Admin Access Button - Only for admin users */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Admin</span>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Alert Messages */}
          {error && (
            <Alert type="error" message={error} onClose={() => setError(null)} />
          )}
          {success && (
            <Alert type="success" message={success} onClose={() => setSuccess(null)} />
          )}

          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Digite seu prompt para o Gemini AI
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  name="prompt"
                  rows={6}
                  required
                  value={formData.prompt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite sua pergunta ou solicitação para o Gemini AI..."
                />
              </div>

              {/* Advanced Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature ({formData.temperature})
                  </label>
                  <input
                    id="temperature"
                    name="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Mais conservativo</span>
                    <span>Mais criativo</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="maxOutputTokens" className="block text-sm font-medium text-gray-700 mb-1">
                    Máximo de tokens
                  </label>
                  <input
                    id="maxOutputTokens"
                    name="maxOutputTokens"
                    type="number"
                    min="1"
                    max="4096"
                    value={formData.maxOutputTokens}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading || !formData.prompt.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Gerando resposta...
                    </div>
                  ) : (
                    'Enviar para Gemini'
                  )}
                </button>

                {response && (
                  <button
                    type="button"
                    onClick={clearResponse}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Response Display */}
          {response && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resposta do Gemini AI
              </h3>
              <div className="prose max-w-none">
                <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap font-mono text-sm">
                  {response}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !response && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Aguardando resposta do Gemini AI...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GeminiPage;
