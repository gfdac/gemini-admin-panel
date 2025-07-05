import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'admin' | 'user' | 'premium' | 'moderator';
  status: 'active' | 'inactive' | 'banned' | 'pending';
  createdAt: string;
  lastLogin: string;
  lastActivity: string;
  totalRequests: number;
  tokensUsed: number;
  plan: 'free' | 'premium' | 'enterprise';
  apiLimit: number;
  apiUsed: number;
  preferences: {
    language: string;
    timezone: string;
    notifications: boolean;
    twoFactorEnabled: boolean;
  };
  billing: {
    subscriptionId?: string;
    nextBillingDate?: string;
    totalSpent: number;
    paymentMethod?: string;
  };
  usage: {
    dailyRequests: number[];
    weeklyRequests: number[];
    monthlyRequests: number[];
    favoriteModels: string[];
    avgResponseTime: number;
  };
  permissions: string[];
  notes: string;
  tags: string[];
}

interface UserActivity {
  id: string;
  userId: number;
  action: string;
  description: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  metadata?: any;
}

const UsersManagementAdvanced: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Modais e formulários
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  
  // Filtros e ordenação
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [sortBy, setSortBy] = useState('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'user' as const,
    plan: 'free' as const,
    apiLimit: 1000,
    permissions: [] as string[],
    tags: [] as string[]
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchTerm, filterRole, filterStatus, filterPlan, sortBy, sortOrder, dateRange]);

  const loadUsers = () => {
    setTimeout(() => {
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          status: 'active',
          createdAt: '2025-01-01',
          lastLogin: '2025-07-05T15:30:00Z',
          lastActivity: '2025-07-05T15:30:00Z',
          totalRequests: 1250,
          tokensUsed: 89420,
          plan: 'enterprise',
          apiLimit: 50000,
          apiUsed: 1250,
          preferences: {
            language: 'pt-BR',
            timezone: 'America/Sao_Paulo',
            notifications: true,
            twoFactorEnabled: true
          },
          billing: {
            subscriptionId: 'sub_enterprise_001',
            nextBillingDate: '2025-08-01',
            totalSpent: 1299.99,
            paymentMethod: 'Credit Card **** 1234'
          },
          usage: {
            dailyRequests: [45, 67, 89, 34, 56, 78, 90],
            weeklyRequests: [450, 567, 678, 789, 890, 345, 456],
            monthlyRequests: [1250, 1450, 1678, 1890, 2100, 1890, 1756],
            favoriteModels: ['gemini-1.5-flash', 'gemini-1.5-pro'],
            avgResponseTime: 1.8
          },
          permissions: ['admin:full', 'users:manage', 'keys:manage', 'system:config'],
          notes: 'Administrador principal do sistema',
          tags: ['admin', 'enterprise', 'priority']
        },
        {
          id: 2,
          username: 'john_doe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'premium',
          status: 'active',
          createdAt: '2025-02-15',
          lastLogin: '2025-07-05T10:15:00Z',
          lastActivity: '2025-07-05T10:15:00Z',
          totalRequests: 2840,
          tokensUsed: 156790,
          plan: 'premium',
          apiLimit: 10000,
          apiUsed: 2840,
          preferences: {
            language: 'en-US',
            timezone: 'America/New_York',
            notifications: true,
            twoFactorEnabled: false
          },
          billing: {
            subscriptionId: 'sub_premium_002',
            nextBillingDate: '2025-08-15',
            totalSpent: 299.99,
            paymentMethod: 'PayPal'
          },
          usage: {
            dailyRequests: [89, 123, 156, 178, 145, 134, 167],
            weeklyRequests: [890, 1230, 1560, 1780, 1450, 1340, 1670],
            monthlyRequests: [2840, 3200, 3560, 3890, 4100, 3850, 3650],
            favoriteModels: ['gemini-1.5-pro', 'gemini-pro'],
            avgResponseTime: 2.1
          },
          permissions: ['api:use', 'profile:edit'],
          notes: 'Cliente premium ativo, alta utilização',
          tags: ['premium', 'high-usage', 'developer']
        },
        {
          id: 3,
          username: 'jane_smith',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'user',
          status: 'active',
          createdAt: '2025-03-20',
          lastLogin: '2025-07-04T18:45:00Z',
          lastActivity: '2025-07-04T18:45:00Z',
          totalRequests: 456,
          tokensUsed: 23580,
          plan: 'free',
          apiLimit: 1000,
          apiUsed: 456,
          preferences: {
            language: 'pt-BR',
            timezone: 'America/Sao_Paulo',
            notifications: false,
            twoFactorEnabled: false
          },
          billing: {
            totalSpent: 0
          },
          usage: {
            dailyRequests: [23, 34, 45, 56, 34, 23, 12],
            weeklyRequests: [230, 340, 450, 560, 340, 230, 120],
            monthlyRequests: [456, 567, 678, 489, 390, 345, 278],
            favoriteModels: ['gemini-1.5-flash'],
            avgResponseTime: 2.8
          },
          permissions: ['api:use'],
          notes: 'Usuário básico, uso moderado',
          tags: ['free', 'casual-user']
        },
        {
          id: 4,
          username: 'mike_wilson',
          email: 'mike@example.com',
          firstName: 'Mike',
          lastName: 'Wilson',
          role: 'user',
          status: 'inactive',
          createdAt: '2025-04-10',
          lastLogin: '2025-06-20T09:30:00Z',
          lastActivity: '2025-06-20T09:30:00Z',
          totalRequests: 89,
          tokensUsed: 4560,
          plan: 'free',
          apiLimit: 1000,
          apiUsed: 89,
          preferences: {
            language: 'en-US',
            timezone: 'America/Los_Angeles',
            notifications: true,
            twoFactorEnabled: false
          },
          billing: {
            totalSpent: 0
          },
          usage: {
            dailyRequests: [5, 8, 12, 15, 10, 7, 3],
            weeklyRequests: [50, 80, 120, 150, 100, 70, 30],
            monthlyRequests: [89, 145, 234, 156, 78, 45, 23],
            favoriteModels: ['gemini-pro'],
            avgResponseTime: 3.2
          },
          permissions: ['api:use'],
          notes: 'Usuário inativo há mais de 30 dias',
          tags: ['inactive', 'low-usage']
        },
        {
          id: 5,
          username: 'sarah_connor',
          email: 'sarah@example.com',
          firstName: 'Sarah',
          lastName: 'Connor',
          role: 'moderator',
          status: 'active',
          createdAt: '2025-05-01',
          lastLogin: '2025-07-05T14:20:00Z',
          lastActivity: '2025-07-05T14:20:00Z',
          totalRequests: 678,
          tokensUsed: 34590,
          plan: 'premium',
          apiLimit: 10000,
          apiUsed: 678,
          preferences: {
            language: 'en-US',
            timezone: 'America/Chicago',
            notifications: true,
            twoFactorEnabled: true
          },
          billing: {
            subscriptionId: 'sub_premium_003',
            nextBillingDate: '2025-08-01',
            totalSpent: 99.99,
            paymentMethod: 'Credit Card **** 5678'
          },
          usage: {
            dailyRequests: [34, 45, 56, 67, 78, 89, 56],
            weeklyRequests: [340, 450, 560, 670, 780, 890, 560],
            monthlyRequests: [678, 789, 890, 1200, 1100, 950, 850],
            favoriteModels: ['gemini-1.5-flash', 'gemini-1.5-pro'],
            avgResponseTime: 2.3
          },
          permissions: ['api:use', 'users:view', 'content:moderate'],
          notes: 'Moderadora responsável por conteúdo',
          tags: ['moderator', 'content-review']
        }
      ];
      
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  };

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...users];

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Filtrar por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    // Filtrar por plano
    if (filterPlan !== 'all') {
      filtered = filtered.filter(user => user.plan === filterPlan);
    }

    // Filtrar por data
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(user => {
        const userDate = new Date(user.createdAt);
        const fromDate = dateRange.from ? new Date(dateRange.from) : new Date('1970-01-01');
        const toDate = dateRange.to ? new Date(dateRange.to) : new Date();
        return userDate >= fromDate && userDate <= toDate;
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof User];
      let bValue: any = b[sortBy as keyof User];

      if (sortBy === 'totalRequests' || sortBy === 'tokensUsed' || sortBy === 'apiUsed') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset para primeira página quando filtrar
  }, [users, searchTerm, filterRole, filterStatus, filterPlan, dateRange, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      return;
    }

    const user: User = {
      id: users.length + 1,
      username: newUser.username,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Nunca',
      lastActivity: 'Nunca',
      totalRequests: 0,
      tokensUsed: 0,
      plan: newUser.plan,
      apiLimit: newUser.apiLimit,
      apiUsed: 0,
      preferences: {
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        notifications: true,
        twoFactorEnabled: false
      },
      billing: {
        totalSpent: 0
      },
      usage: {
        dailyRequests: [0, 0, 0, 0, 0, 0, 0],
        weeklyRequests: [0, 0, 0, 0, 0, 0, 0],
        monthlyRequests: [0, 0, 0, 0, 0, 0, 0],
        favoriteModels: [],
        avgResponseTime: 0
      },
      permissions: newUser.permissions,
      notes: '',
      tags: newUser.tags
    };

    setUsers([...users, user]);
    setNewUser({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'user',
      plan: 'free',
      apiLimit: 1000,
      permissions: [],
      tags: []
    });
    setShowAddForm(false);
    setSuccess('Usuário criado com sucesso!');
  };

  const showUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
    
    // Simular carregamento de atividades do usuário
    const mockActivities: UserActivity[] = [
      {
        id: '1',
        userId: user.id,
        action: 'login',
        description: 'Usuário fez login no sistema',
        timestamp: '2025-07-05T15:30:00Z',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Chrome/91.0)'
      },
      {
        id: '2',
        userId: user.id,
        action: 'api_request',
        description: 'Requisição para Gemini API',
        timestamp: '2025-07-05T15:25:00Z',
        ip: '192.168.1.100',
        userAgent: 'API Client v1.0'
      }
    ];
    setUserActivities(mockActivities);
  };

  const toggleUserStatus = (id: number) => {
    setUsers(users.map(user => 
      user.id === id 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
    setSuccess('Status do usuário atualizado!');
  };

  const deleteUser = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(users.filter(user => user.id !== id));
      setSuccess('Usuário removido com sucesso!');
    }
  };

  const bulkAction = (action: string) => {
    const selectedUsersData = users.filter(user => selectedUsers.includes(user.id));
    
    switch (action) {
      case 'activate':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'active' } : user
        ));
        setSuccess(`${selectedUsersData.length} usuários ativados`);
        break;
      case 'deactivate':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, status: 'inactive' } : user
        ));
        setSuccess(`${selectedUsersData.length} usuários desativados`);
        break;
      case 'delete':
        if (window.confirm(`Tem certeza que deseja excluir ${selectedUsersData.length} usuários?`)) {
          setUsers(users.filter(user => !selectedUsers.includes(user.id)));
          setSuccess(`${selectedUsersData.length} usuários excluídos`);
        }
        break;
      case 'reset_limits':
        setUsers(users.map(user => 
          selectedUsers.includes(user.id) ? { ...user, apiUsed: 0 } : user
        ));
        setSuccess(`Limites resetados para ${selectedUsersData.length} usuários`);
        break;
    }
    setSelectedUsers([]);
  };

  const exportUsers = () => {
    const csvContent = [
      ['ID', 'Username', 'Email', 'Nome', 'Role', 'Status', 'Plano', 'Requisições', 'Tokens', 'Criado'].join(','),
      ...filteredUsers.map(user => [
        user.id,
        user.username,
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.role,
        user.status,
        user.plan,
        user.totalRequests,
        user.tokensUsed,
        user.createdAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSuccess('Dados exportados com sucesso!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'banned': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'moderator': return 'bg-indigo-100 text-indigo-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      case 'free': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Nunca') return dateString;
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuários...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento Avançado de Usuários</h1>
              <p className="text-gray-600">Visualize e gerencie contas de usuário com detalhes completos</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/admin/users')}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center"
              >
                ← Versão Básica
              </button>
              <button
                onClick={exportUsers}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                📊 Exportar
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                + Adicionar Usuário
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

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Total de Usuários</div>
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Usuários Ativos</div>
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Premium</div>
            <div className="text-2xl font-bold text-yellow-600">{users.filter(u => u.plan === 'premium').length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Enterprise</div>
            <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.plan === 'enterprise').length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Total Requisições</div>
            <div className="text-2xl font-bold text-indigo-600">{users.reduce((sum, u) => sum + u.totalRequests, 0).toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600">Total Tokens</div>
            <div className="text-2xl font-bold text-orange-600">{users.reduce((sum, u) => sum + u.tokensUsed, 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Filtros Avançados */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome, email, tag..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderador</option>
                <option value="premium">Premium</option>
                <option value="user">Usuário</option>
              </select>
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
                <option value="banned">Banido</option>
                <option value="pending">Pendente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plano</label>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                <option value="free">Gratuito</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data até</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedUsers.length} usuário(s) selecionado(s)
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
                    onClick={() => bulkAction('reset_limits')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Reset Limites
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

        {/* Tabela de Usuários */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(paginatedUsers.map(user => user.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('username')}
                  >
                    Usuário {sortBy === 'username' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role / Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalRequests')}
                  >
                    Uso da API {sortBy === 'totalRequests' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('lastLogin')}
                  >
                    Último Login {sortBy === 'lastLogin' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.firstName} {user.lastName}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {user.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                            {user.tags.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{user.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role === 'admin' ? 'Admin' : 
                           user.role === 'moderator' ? 'Moderador' :
                           user.role === 'premium' ? 'Premium' : 'Usuário'}
                        </span>
                        <br />
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status === 'active' ? 'Ativo' : 
                           user.status === 'inactive' ? 'Inativo' : 
                           user.status === 'banned' ? 'Banido' : 'Pendente'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanColor(user.plan)}`}>
                        {user.plan === 'enterprise' ? 'Enterprise' : 
                         user.plan === 'premium' ? 'Premium' : 'Gratuito'}
                      </span>
                      {user.billing.totalSpent > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          R$ {user.billing.totalSpent.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{user.apiUsed.toLocaleString()} / {user.apiLimit.toLocaleString()}</div>
                        <div className="text-gray-500">{user.tokensUsed.toLocaleString()} tokens</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{width: `${Math.min((user.apiUsed / user.apiLimit) * 100, 100)}%`}}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {((user.apiUsed / user.apiLimit) * 100).toFixed(1)}% usado
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{formatDate(user.lastLogin)}</div>
                      <div className="text-xs">
                        Ativo: {formatDate(user.lastActivity)}
                      </div>
                      <div className="text-xs">
                        2FA: {user.preferences.twoFactorEnabled ? '✅' : '❌'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => showUserDetails(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`${user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={user.status === 'active' ? 'Desativar' : 'Ativar'}
                        >
                          {user.status === 'active' ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
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

          {/* Paginação */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredUsers.length)} de {filteredUsers.length} resultados
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Detalhes do Usuário */}
        {showUserDetail && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalhes do Usuário: {selectedUser.username}
                </h3>
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações Pessoais */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Informações Pessoais</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div><strong>Nome:</strong> {selectedUser.firstName} {selectedUser.lastName}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>Username:</strong> {selectedUser.username}</div>
                    <div><strong>Idioma:</strong> {selectedUser.preferences.language}</div>
                    <div><strong>Timezone:</strong> {selectedUser.preferences.timezone}</div>
                    <div><strong>Notificações:</strong> {selectedUser.preferences.notifications ? 'Ativadas' : 'Desativadas'}</div>
                    <div><strong>2FA:</strong> {selectedUser.preferences.twoFactorEnabled ? 'Ativado' : 'Desativado'}</div>
                  </div>

                  <h4 className="text-md font-medium text-gray-900">Faturamento</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div><strong>Total Gasto:</strong> R$ {selectedUser.billing.totalSpent.toFixed(2)}</div>
                    {selectedUser.billing.subscriptionId && (
                      <>
                        <div><strong>Assinatura:</strong> {selectedUser.billing.subscriptionId}</div>
                        <div><strong>Próximo Pagamento:</strong> {selectedUser.billing.nextBillingDate}</div>
                        <div><strong>Método:</strong> {selectedUser.billing.paymentMethod}</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Estatísticas de Uso */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Estatísticas de Uso</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <div><strong>Total Requisições:</strong> {selectedUser.totalRequests.toLocaleString()}</div>
                    <div><strong>Tokens Utilizados:</strong> {selectedUser.tokensUsed.toLocaleString()}</div>
                    <div><strong>Limite Atual:</strong> {selectedUser.apiLimit.toLocaleString()}</div>
                    <div><strong>Usado Este Mês:</strong> {selectedUser.apiUsed.toLocaleString()}</div>
                    <div><strong>Tempo Médio:</strong> {selectedUser.usage.avgResponseTime.toFixed(2)}s</div>
                  </div>

                  <h4 className="text-md font-medium text-gray-900">Modelos Favoritos</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {selectedUser.usage.favoriteModels.map((model, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
                        {model}
                      </span>
                    ))}
                  </div>

                  <h4 className="text-md font-medium text-gray-900">Permissões</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    {selectedUser.permissions.map((permission, index) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2 mb-2">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Atividades Recentes */}
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Atividades Recentes</h4>
                <div className="bg-gray-50 p-4 rounded-md max-h-40 overflow-y-auto">
                  {userActivities.map((activity) => (
                    <div key={activity.id} className="border-b border-gray-200 pb-2 mb-2 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium">{activity.description}</div>
                          <div className="text-xs text-gray-500">IP: {activity.ip}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas */}
              {selectedUser.notes && (
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Notas</h4>
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-sm">{selectedUser.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowUserDetail(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Adicionar Usuário */}
        {showAddForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Novo Usuário</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sobrenome</label>
                    <input
                      type="text"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="user">Usuário</option>
                      <option value="premium">Premium</option>
                      <option value="moderator">Moderador</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plano</label>
                    <select
                      value={newUser.plan}
                      onChange={(e) => setNewUser({...newUser, plan: e.target.value as any})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="free">Gratuito</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Limite de API</label>
                  <input
                    type="number"
                    value={newUser.apiLimit}
                    onChange={(e) => setNewUser({...newUser, apiLimit: parseInt(e.target.value)})}
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
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Criar Usuário
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagementAdvanced;
