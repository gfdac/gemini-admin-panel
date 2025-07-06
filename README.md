# 🤖 Gemini Admin Panel v0.7.0

> Sistema completo de gerenciamento de chaves Gemini API com painel administrativo moderno e rotação automática inteligente.

[![Deploy Status](https://img.shields.io/badge/deploy-success-brightgreen)](https://gemini-admin-panel.vercel.app)
[![Version](https://img.shields.io/badge/version-0.7.0-blue)](https://github.com/gfdac/gemini-admin-panel/releases/tag/v0.7.0)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 **Demo Live**

- **🌐 Frontend**: [https://gemini-admin-panel.vercel.app](https://gemini-admin-panel.vercel.app)
- **🔧 Admin Panel**: [https://gemini-admin-panel.vercel.app/admin](https://gemini-admin-panel.vercel.app/admin)
- **💬 Chat Demo**: [https://gemini-admin-panel.vercel.app/chat](https://gemini-admin-panel.vercel.app/chat)
- **📊 API Health**: [https://gemini-admin-panel.vercel.app/api/health](https://gemini-admin-panel.vercel.app/api/health)

## ✨ **Principais Funcionalidades**

### 🔑 **Gerenciamento Inteligente de Chaves**
- **Painel Visual** para adicionar/remover/ativar chaves
- **Rotação Automática** com modo "Por Request" (recomendado)
- **Sistema Híbrido** Redis + Fallback para alta disponibilidade
- **Teste em Tempo Real** de conectividade das chaves
- **Estatísticas Detalhadas** de uso por chave

### 🎛️ **Dashboard Administrativo**
- **Interface Moderna** com React + TypeScript + Tailwind
- **Métricas em Tempo Real** (chaves ativas, requisições, etc.)
- **Autenticação JWT** com roles e permissões
- **Responsive Design** para desktop e mobile

### ⚡ **Arquitetura Serverless**
- **Deploy Instantâneo** no Vercel
- **API Otimizada** para ambiente serverless
- **SPA com Roteamento** correto para todas as rotas
- **Cache Inteligente** com Redis (opcional)

---

## 🔧 **Configuração Rápida**

### 1️⃣ **Clone e Instale**
```bash
# Clone o repositório
git clone https://github.com/gfdac/gemini-admin-panel.git
cd gemini-admin-panel

# Instale dependências do backend
cd backend && npm install

# Instale dependências do frontend  
cd ../frontend && npm install
```

### 2️⃣ **Configure Variáveis de Ambiente**
```bash
# Crie o arquivo .env na raiz do projeto
JWT_SECRET=sua_chave_jwt_super_secreta_aqui
GEMINI_API_KEY=AIzaSy...sua_chave_gemini_aqui

# Opcional - Para múltiplas chaves via Redis
REDIS_URL=rediss://sua_url_redis
REDIS_TOKEN=seu_token_redis
```

### 3️⃣ **Execute Localmente**
```bash
# Backend (desenvolvimento)
cd backend && npm run dev

# Frontend (desenvolvimento)
cd frontend && npm start
```

### 4️⃣ **Deploy no Vercel**
```bash
# Instale a CLI do Vercel
npm i -g vercel

# Deploy direto do repositório
vercel --prod

# Ou conecte via GitHub para deploy automático
```

---

## 🔐 **Credenciais Padrão**

| Usuário | Username | Password | Permissões |
|---------|----------|----------|------------|
| **Admin** | `admin` | `admin123` | admin, gemini, tokens |
| **User** | `user` | `user123` | gemini |

---

## 📊 **Modos de Rotação de Chaves**

### 🎯 **Por Request** (Recomendado)
- Uma chave diferente a cada requisição
- Distribui a carga uniformemente
- Minimiza rate limiting

### 📅 **Outros Modos**
- **Desabilitada**: Sempre a mesma chave
- **Diária**: Rotação a cada 24h
- **Semanal**: Rotação semanal
- **Mensal**: Rotação mensal

---

## 🛠️ **Stack Tecnológico**

### **Backend**
- **Node.js + Express** (otimizado serverless)
- **@google/generative-ai** (SDK oficial Google)
- **jsonwebtoken** (autenticação JWT)
- **@upstash/redis** (cache opcional)
- **bcryptjs** (hashing compatível serverless)
- **winston** (logging estruturado)

### **Frontend**
- **React 18 + TypeScript**
- **Tailwind CSS** (styling moderno)
- **React Router** (navegação SPA)
- **Heroicons** (ícones consistentes)
- **Axios** (client HTTP)

### **Deploy**
- **Vercel** (serverless hosting)
- **GitHub Actions** (CI/CD automático)
- **Redis Cloud** (cache opcional)

---

## 📡 **Endpoints da API**

### **Públicos**
```http
POST /api/login          # Autenticação de usuários
GET  /api/health         # Health check da API
POST /api/chat           # Chat com Gemini (requer auth)
```

### **Admin** (requer role admin)
```http
GET    /api/admin/gemini-keys         # Listar todas as chaves
GET    /api/admin/gemini-keys/:id     # Buscar chave específica
POST   /api/admin/gemini-keys         # Adicionar nova chave
DELETE /api/admin/gemini-keys/:id     # Remover chave
PATCH  /api/admin/gemini-keys/:id/toggle  # Ativar/Desativar
POST   /api/admin/gemini-keys/test    # Testar conectividade
GET    /api/admin/gemini-keys/stats   # Estatísticas de uso
```

---

## 🎯 **Casos de Uso**

### 🏢 **Para Empresas**
- **Múltiplas chaves** para distribuir carga
- **Monitoramento centralizado** de uso
- **Fallback automático** para alta disponibilidade
- **Dashboard executivo** com métricas

### 👨‍💻 **Para Desenvolvedores**
- **API unificada** para múltiplos projetos
- **Rotação transparente** de chaves
- **Logs estruturados** para debugging
- **Deploy rápido** com Vercel

### 🚀 **Para Startups**
- **Solução completa** pronta para produção
- **Escalabilidade automática** serverless
- **Custos otimizados** (pay-per-use)
- **Setup em minutos**

---

## 📈 **Roadmap v0.8**

### 🔮 **Próximas Funcionalidades**
- [ ] 📊 Gráficos detalhados de uso por chave
- [ ] 🔄 Rotação baseada em rate limits detectados
- [ ] 📧 Alertas por email/webhook para falhas
- [ ] 🎛️ Configurações avançadas de modelo IA
- [ ] 📱 PWA com notificações push
- [ ] 🔐 Sistema de roles mais granular

### 🌐 **Integrações Planejadas**
- [ ] 📈 Vercel Analytics integration
- [ ] 🐛 Sentry error tracking
- [ ] 📊 Grafana dashboard
- [ ] 🔔 Discord/Slack webhooks

---

## 🤝 **Contribuição**

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

---

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🆘 **Suporte**

- **📧 Issues**: [GitHub Issues](https://github.com/gfdac/gemini-admin-panel/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/gfdac/gemini-admin-panel/discussions)
- **📚 Documentação**: [Release Notes](RELEASE_NOTES_v0.7.md)

---

## 🏆 **Status do Projeto**

✅ **PRODUÇÃO ESTÁVEL**
- Sistema totalmente funcional em produção
- Testes de integração passando
- Performance otimizada
- Documentação completa
- Deploy automatizado

---

<div align="center">

**Desenvolvido com ❤️ para otimizar o uso da Gemini API**

[⭐ Star este projeto](https://github.com/gfdac/gemini-admin-panel) | [🚀 Testar Demo](https://gemini-admin-panel.vercel.app) | [📖 Release Notes](RELEASE_NOTES_v0.7.md)

</div>
