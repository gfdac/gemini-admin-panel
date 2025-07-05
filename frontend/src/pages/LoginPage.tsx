import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi, LoginRequest } from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

// PROMPT PARA COPILOT: LoginPage com formulário de login, envia credenciais para /api/login
// Em caso de sucesso, chama login do AuthContext e redireciona para /gemini

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(formData);
      
      if (response.status === 'success') {
        login(response.data.token, response.data.user);
        navigate('/gemini');
      } else {
        setError('Falha no login. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Erro de conexão. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (username: string, password: string) => {
    setFormData({ username, password });
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ username, password });
      
      if (response.status === 'success') {
        login(response.data.token, response.data.user);
        navigate('/gemini');
      } else {
        setError('Falha no login. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'Erro de conexão. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Gemini AI Interface
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Faça login para acessar a plataforma
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {error && (
              <Alert 
                type="error" 
                message={error} 
                onClose={() => setError(null)}
              />
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuário
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite seu usuário"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <div className="text-sm text-gray-500">
            <p className="mb-2">Credenciais de demonstração:</p>
            <div className="bg-gray-50 rounded-md p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p><strong>Admin:</strong> admin / admin123</p>
                </div>
                <button
                  onClick={() => handleQuickLogin('admin', 'admin123')}
                  disabled={loading}
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700 disabled:opacity-50"
                >
                  Login Admin
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p><strong>Usuário:</strong> user / user123</p>
                </div>
                <button
                  onClick={() => handleQuickLogin('user', 'user123')}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                >
                  Login Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
