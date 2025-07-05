import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  KeyIcon,
  UsersIcon,
  ClockIcon,
  CogIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

// PROMPT PARA COPILOT: Layout administrativo com sidebar, navegação e header responsivo

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, description: 'Visão geral do sistema' },
  { name: 'Chaves API', href: '/admin/api-keys', icon: KeyIcon, description: 'Gerenciar chaves de API' },
  { name: 'Usuários', href: '/admin/users', icon: UsersIcon, description: 'Gerenciar usuários' },
  { name: 'Histórico', href: '/admin/requests', icon: ClockIcon, description: 'Histórico de requisições' },
  { name: 'Configurações', href: '/admin/settings', icon: CogIcon, description: 'Configurações do sistema' },
  { name: 'Monitoramento', href: '/admin/monitoring', icon: ChartBarIcon, description: 'Monitoramento em tempo real' },
];

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActivePath = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
              <div className="flex h-16 shrink-0 items-center">
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <button
                            onClick={() => {
                              navigate(item.href);
                              setSidebarOpen(false);
                            }}
                            className={`group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-left ${
                              isActivePath(item.href)
                                ? 'bg-gray-50 text-indigo-600'
                                : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                            }`}
                          >
                            <item.icon
                              className={`h-6 w-6 shrink-0 ${
                                isActivePath(item.href) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                              }`}
                            />
                            {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => navigate(item.href)}
                        className={`group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-left ${
                          isActivePath(item.href)
                            ? 'bg-gray-50 text-indigo-600'
                            : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                        }`}
                        title={item.description}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActivePath(item.href) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600'
                          }`}
                        />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1">
              {/* Breadcrumb ou título da página atual */}
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigation.find(item => isActivePath(item.href))?.name || 'Administração'}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notification button */}
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
              >
                <BellIcon className="h-6 w-6" />
              </button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-lg"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-4 text-sm font-semibold leading-6 text-gray-900">
                      {user?.username || 'Admin'}
                    </span>
                    <ArrowRightOnRectangleIcon className="ml-2 h-5 w-5 text-gray-400" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
