# Guia de Demonstração - Painel Administrativo

## Como Testar o Painel Administrativo

### 1. Acesso Inicial
1. Abra `http://localhost:3000`
2. Você verá a página de login com credenciais de demonstração
3. Use uma das opções:
   - **Login Admin**: Clique no botão "Login Admin" para acesso direto
   - **Login Manual**: Digite `admin` / `admin123` e clique "Entrar"

### 2. Interface Principal
Após o login como admin, você verá:
- Interface do Gemini AI
- Botão "Admin" no canto superior direito (só aparece para admins)
- Clique no botão "Admin" para acessar o painel administrativo

### 3. Dashboard Administrativo (`/admin`)
No dashboard você encontrará:
- **Métricas do Sistema**: Total de usuários, chaves API, requisições
- **Status das Chaves**: Saúde das chaves API
- **Atividade Recente**: Log de ações recentes
- **Ações Rápidas**: Botões para tarefas comuns
- **Alertas do Sistema**: Notificações importantes

**Teste**: Clique nas diferentes métricas e botões para navegar pelas seções.

### 4. Gerenciamento de Chaves API

#### Versão Básica (`/admin/api-keys`)
- Lista simples de chaves API
- Status visual (ativo/inativo)
- Ações básicas (ativar/desativar/excluir)
- Formulário de adição de nova chave

**Teste**: 
- Clique "Versão Avançada →" para ver mais funcionalidades
- Adicione uma nova chave usando o botão "+"
- Toggle status de uma chave existente

#### Versão Avançada (`/admin/api-keys-advanced`)
- Métricas detalhadas no topo
- Filtros por status, ambiente, região
- Busca por nome
- Seleção múltipla com ações em lote
- Botão de exportação

**Teste**:
- Use os filtros para encontrar chaves específicas
- Selecione múltiplas chaves e use "Ações em Lote"
- Clique em "Ver Detalhes" para informações completas

### 5. Gerenciamento de Usuários

#### Versão Básica (`/admin/users`)
- Lista de usuários com informações essenciais
- Filtros por status
- Ações de ativação/desativação

**Teste**:
- Adicione um novo usuário
- Filtre por "Ativos" ou "Inativos"
- Edite informações de um usuário

#### Versão Avançada (`/admin/users-advanced`)
- Informações estendidas (billing, uso, permissões)
- Analytics de uso por usuário
- Tags e categorização
- Ações em lote mais robustas

**Teste**:
- Explore os detalhes completos clicando em "Ver Detalhes"
- Use as tags para categorizar usuários
- Teste as ações em lote

### 6. Histórico de Requisições (`/admin/requests`)
- Log completo de todas as requisições
- Filtros por usuário, status, data
- Detalhes de cada requisição

**Teste**:
- Filtre por diferentes status (sucesso/erro)
- Veja os detalhes de uma requisição específica
- Use os filtros de data

### 7. Configurações do Sistema (`/admin/settings`)
Interface em abas com:
- **Rate Limiting**: Configurar limites
- **Gemini Config**: Configurações da API
- **Segurança**: CORS e autenticação
- **Logging**: Configurações de log
- **Monitoramento**: Alertas
- **Regras de Negócio**: Lógica customizada

**Teste**:
- Navegue pelas diferentes abas
- Modifique algumas configurações
- Clique "Salvar Configurações"

### 8. Monitoramento em Tempo Real (`/admin/monitoring`)
- Métricas ao vivo do sistema
- Gráficos de performance
- Alertas ativos
- Analytics dos endpoints

**Teste**:
- Observe as métricas sendo atualizadas
- Veja os alertas simulados
- Explore os dados de performance

## Funcionalidades Especiais para Testar

### Navegação Responsiva
1. Redimensione a janela do browser
2. No mobile, o menu lateral vira hambúrguer
3. Teste a navegação em diferentes tamanhos de tela

### Estados de Carregamento
1. Todas as páginas simulam carregamento inicial
2. Ações como adicionar/editar mostram loading
3. Observe os spinners de carregamento

### Feedback de Ações
1. Todas as ações mostram mensagens de sucesso/erro
2. Alerts aparecem no topo das páginas
3. Podem ser fechados clicando no "X"

### Filtros e Busca
1. Digite na caixa de busca para filtrar resultados
2. Use os dropdowns de filtro
3. Combine múltiplos filtros

### Ações em Lote (Versões Avançadas)
1. Selecione múltiplos itens usando checkboxes
2. Use o menu "Ações em Lote"
3. Confirme ações destrutivas

### Exportação de Dados
1. Clique nos botões "📊 Exportar"
2. Simulação de download de arquivo
3. Mensagem de confirmação

## Cenários de Teste Recomendados

### Cenário 1: Administrador Novo
1. Login como admin
2. Explore o dashboard para entender o sistema
3. Verifique status das chaves API
4. Olhe usuários ativos
5. Configure alertas no monitoramento

### Cenário 2: Manutenção de Chaves
1. Vá para gerenciamento de chaves
2. Adicione uma nova chave para desenvolvimento
3. Desative uma chave problemática
4. Configure rotação automática
5. Monitore uso das chaves

### Cenário 3: Gestão de Usuários
1. Adicione novos usuários
2. Configure diferentes planos/limites
3. Monitore uso por usuário
4. Aplique tags organizacionais
5. Execute ações em lote

### Cenário 4: Investigação de Problemas
1. Vá para histórico de requisições
2. Filtre por erros
3. Analise padrões de falha
4. Verifique usuários afetados
5. Ajuste configurações se necessário

### Cenário 5: Monitoramento de Sistema
1. Monitore métricas em tempo real
2. Configure alertas personalizados
3. Analise performance dos endpoints
4. Export relatórios de uso

## Dicas de Navegação

### Atalhos Visuais
- 🔴 Status vermelho = problemas
- 🟡 Status amarelo = atenção
- 🟢 Status verde = normal
- 📊 Ícone = exportação/relatórios
- ⚙️ Ícone = configurações

### Navegação Rápida
- Use breadcrumbs "← Voltar ao Dashboard"
- Links "Versão Avançada" ↔ "Versão Básica"
- Menu lateral sempre disponível
- Botão logout sempre visível

### Feedback Visual
- Hover effects em todos os botões
- Loading states em operações
- Confirmações para ações destrutivas
- Highlighting de items selecionados

## Dados de Demonstração

Todos os dados são simulados mas realistas:
- **Usuários**: 156 usuários com diferentes perfis
- **Chaves API**: 8 chaves com status variados
- **Requisições**: Histórico com ~50k requisições
- **Métricas**: Atualizadas dinamicamente

## Limitações do Protótipo

### O que NÃO funciona (ainda):
- Persistência real de dados
- Conexão com backend real
- Autenticação real por role
- WebSocket para updates em tempo real
- Gráficos dinâmicos reais

### O que SIM funciona:
- Toda a interface e navegação
- Estados visuais e feedback
- Simulação de todas as operações
- Layout responsivo completo
- Filtros e buscas locais

## Próximos Passos de Desenvolvimento

1. **Backend Integration**: Conectar com APIs reais
2. **Real Authentication**: Implementar JWT e role-based access
3. **Data Persistence**: Salvar mudanças no banco
4. **Real-time Updates**: WebSocket para monitoring
5. **Charts & Analytics**: Gráficos reais com Chart.js/D3
6. **File Export**: Download real de relatórios

---

**Aproveite explorando o painel administrativo!** 🚀
