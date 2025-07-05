# Painel Administrativo - Gemini API

## Visão Geral

O painel administrativo oferece controle completo sobre a API do Gemini, incluindo gerenciamento de chaves API, usuários, monitoramento de sistema e configurações avançadas.

## Acesso

### Credenciais de Demonstração

**Admin:** 
- Usuário: `admin`
- Senha: `admin123`

**Usuário Regular:**
- Usuário: `user` 
- Senha: `user123`

## Funcionalidades

### 1. Dashboard Administrativo (`/admin`)
- Visão geral do sistema com métricas em tempo real
- Status das chaves API e usuários
- Atividade recente e alertas
- Ações rápidas para tarefas comuns

### 2. Gerenciamento de Chaves API

#### Versão Básica (`/admin/api-keys`)
- Visualização e edição de chaves API
- Status e configurações básicas
- Adicionar/remover chaves

#### Versão Avançada (`/admin/api-keys-advanced`)
- Filtros e busca avançada
- Métricas detalhadas de uso
- Ações em lote (ativar/desativar/excluir)
- Exportação de dados
- Monitoramento de saúde das chaves
- Configurações avançadas (prioridade, região, ambiente)

### 3. Gerenciamento de Usuários

#### Versão Básica (`/admin/users`)
- Lista de usuários com informações básicas
- Criar, editar e desativar usuários
- Filtros por status

#### Versão Avançada (`/admin/users-advanced`)
- Informações detalhadas (billing, preferências, permissões)
- Analytics de uso por usuário
- Ações em lote
- Exportação de dados de usuários
- Tags e categorização

### 4. Histórico de Requisições (`/admin/requests`)
- Log completo de todas as requisições à API
- Filtros por usuário, status, data
- Exportação de relatórios
- Análise de erros e performance

### 5. Configurações do Sistema (`/admin/settings`)
- **Rate Limiting:** Configurar limites de taxa
- **Configuração Gemini:** Chaves padrão e modelos
- **Segurança:** Configurações de autenticação e CORS
- **Logging:** Níveis de log e retenção
- **Monitoramento:** Alertas e notificações
- **Regras de Negócio:** Lógica personalizada

### 6. Monitoramento em Tempo Real (`/admin/monitoring`)
- Métricas de sistema ao vivo
- Performance dos endpoints
- Alertas ativos
- Gráficos de uso e disponibilidade

## Navegação

### Acesso Rápido
- Usuários admin veem um botão "Admin" no canto superior direito da interface principal
- Click no botão leva diretamente ao dashboard administrativo

### Menu Lateral
O painel administrativo possui um menu lateral com:
- Dashboard (visão geral)
- Chaves API (gerenciamento de chaves)
- Usuários (gerenciamento de usuários)
- Histórico (log de requisições)
- Configurações (configurações do sistema)
- Monitoramento (métricas em tempo real)

### Versões Básica vs Avançada
- Páginas de gerenciamento têm versões básica e avançada
- Links "Versão Avançada →" e "← Versão Básica" para alternar
- Versão avançada inclui filtros, métricas detalhadas e ações em lote

## Funcionalidades Técnicas

### Dados Mock
- Todas as funcionalidades usam dados mock/simulados
- Dados são gerados dinamicamente com informações realistas
- Simula carregamento assíncrono e operações de API

### Responsividade
- Interface totalmente responsiva
- Menu lateral colapsível em dispositivos móveis
- Tabelas adaptáveis com scroll horizontal quando necessário

### Componentes Reutilizáveis
- Alerts para feedback de ações
- LoadingSpinner para operações assíncronas
- Modais para formulários e detalhes
- Componentes de filtro e busca

### Funcionalidades Interativas
- Ordenação de tabelas por colunas
- Filtros dinâmicos (status, data, etc.)
- Busca em tempo real
- Ações em lote com seleção múltipla
- Exportação de dados (CSV/JSON simulado)

## Próximos Passos

### Para Produção
1. **Integração com Backend:** Substituir dados mock por chamadas reais de API
2. **Autenticação:** Implementar verificação de permissões admin
3. **Persistência:** Conectar operações CRUD ao banco de dados
4. **WebSocket:** Implementar atualizações em tempo real
5. **Charts:** Adicionar gráficos e visualizações
6. **Notificações:** Sistema de alertas e notificações push

### Melhorias de UX
1. **Temas:** Suporte a modo escuro
2. **Personalização:** Dashboard personalizável
3. **Shortcuts:** Atalhos de teclado
4. **Tutorial:** Guia interativo para novos admins
5. **Favoritos:** Marcar páginas/ações frequentes

## Estrutura de Arquivos

```
frontend/src/
├── components/
│   └── admin/
│       ├── AdminLayout.tsx     # Layout principal do admin
│       └── AdminRoute.tsx      # Proteção de rotas admin
├── pages/
│   └── admin/
│       ├── AdminDashboard.tsx          # Dashboard principal
│       ├── ApiKeysManagement.tsx       # Gerenciamento básico de chaves
│       ├── ApiKeysManagementAdvanced.tsx # Gerenciamento avançado de chaves
│       ├── UsersManagement.tsx         # Gerenciamento básico de usuários
│       ├── UsersManagementAdvanced.tsx # Gerenciamento avançado de usuários
│       ├── RequestsHistory.tsx         # Histórico de requisições
│       ├── SystemSettings.tsx          # Configurações do sistema
│       └── RealTimeMonitoring.tsx      # Monitoramento em tempo real
└── contexts/
    └── AuthContext.tsx         # Contexto de autenticação com suporte a roles
```

## Tecnologias Utilizadas

- **React 18** com TypeScript
- **React Router** para navegação
- **Tailwind CSS** para estilização
- **Heroicons** para ícones
- **Context API** para gerenciamento de estado

## Como Testar

1. Acesse `http://localhost:3000`
2. Use as credenciais de admin para fazer login
3. Clique no botão "Admin" no canto superior direito
4. Explore todas as funcionalidades do painel administrativo
5. Teste a navegação entre versões básica e avançada
6. Experimente filtros, buscas e ações em lote

---

**Nota:** Este é um protótipo com dados mock. Para produção, será necessário integrar com APIs reais e implementar autenticação/autorização adequada.
