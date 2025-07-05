# Projeto Gemini AI - Interface Completa

Este projeto implementa uma API segura em Node.js para interação com a API Gemini e um frontend moderno em React.js com TypeScript e Tailwind CSS.

## 🚀 Características

### Backend (Node.js + Express)
- ✅ Autenticação JWT segura
- ✅ Validação de dados com Joi
- ✅ Logging avançado com Winston
- ✅ Integração completa com Gemini AI
- ✅ Rate limiting e segurança com Helmet
- ✅ Middleware de tratamento de erros
- ✅ Documentação de API integrada

### Frontend (React + TypeScript + Tailwind)
- ✅ Interface moderna e responsiva
- ✅ Gerenciamento de estado com Context API
- ✅ Roteamento protegido
- ✅ Componentes reutilizáveis
- ✅ Feedback visual avançado
- ✅ Integração completa com a API

## 📁 Estrutura do Projeto

```
projeto-gemini-api/
├── backend/                 # API Node.js
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── controllers/    # Controllers
│   │   ├── middlewares/    # Middlewares
│   │   ├── routes/         # Rotas
│   │   ├── services/       # Serviços
│   │   ├── utils/          # Utilitários
│   │   └── app.js         # Aplicação principal
│   ├── .env.example       # Exemplo de variáveis
│   ├── package.json
│   └── .gitignore
└── frontend/               # React App
    ├── src/
    │   ├── components/     # Componentes React
    │   ├── contexts/       # Context API
    │   ├── pages/         # Páginas
    │   ├── services/      # Serviços de API
    │   ├── App.tsx        # App principal
    │   └── index.tsx      # Entry point
    ├── package.json
    └── tailwind.config.js
```

## 🛠️ Configuração e Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn
- Chave API do Google Gemini

### Backend

1. **Navegue para a pasta do backend:**
   ```bash
   cd backend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` e adicione suas configurações:
   ```env
   NODE_ENV=development
   PORT=3001
   JWT_SECRET=seu-jwt-secret-super-seguro
   GEMINI_API_KEY=sua-chave-api-gemini
   FRONTEND_URL=http://localhost:3000
   LOG_LEVEL=info
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

### Frontend

1. **Navegue para a pasta do frontend:**
   ```bash
   cd frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente (opcional):**
   Crie um arquivo `.env.local`:
   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

## 🔐 Credenciais de Demonstração

Para testar a aplicação, use as seguintes credenciais:

**Administrador:**
- Usuário: `admin`
- Senha: `admin123`

**Usuário comum:**
- Usuário: `user`
- Senha: `user123`

## 📚 API Endpoints

### Públicos
- `POST /api/login` - Autenticação de usuário
- `GET /api/health` - Status da API

### Protegidos (requer JWT)
- `GET /api/protected` - Teste de rota protegida
- `POST /api/gemini` - Gerar conteúdo com Gemini AI
- `GET /api/gemini/stats` - Estatísticas de uso
- `GET /api/docs` - Documentação da API

## 🎯 Como Usar com o Copilot

### Para desenvolvimento iterativo:

1. **Abra o VS Code** na pasta do projeto
2. **Comece pelo backend** - O arquivo `app.js` já contém o prompt principal
3. **Use o Copilot** para sugestões baseadas nos comentários
4. **Iteração contínua** - Adicione comentários específicos para funcionalidades

### Exemplo de prompt para o Copilot:
```javascript
// PROMPT PARA COPILOT: Criar middleware de cache Redis para as respostas do Gemini
// com TTL de 1 hora e chave baseada no hash do prompt
```

## 🔧 Scripts Disponíveis

### Backend
- `npm start` - Inicia em produção
- `npm run dev` - Inicia em desenvolvimento com nodemon
- `npm test` - Executa testes
- `npm run lint` - Verificação de código

### Frontend  
- `npm start` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm test` - Executa testes
- `npm run lint` - Verificação de código

## 🚀 Deploy

### Backend
1. Configure as variáveis de ambiente de produção
2. Execute `npm install --production`
3. Inicie com `npm start`

### Frontend
1. Execute `npm run build`
2. Sirva os arquivos da pasta `build/`

## 📝 Funcionalidades

### Autenticação
- Login seguro com JWT
- Middleware de autenticação
- Proteção de rotas
- Logout automático em caso de token expirado

### Interface Gemini
- Formulário para prompts
- Controles avançados (temperature, tokens)
- Loading states
- Exibição formatada de respostas
- Histórico de interações

### Segurança
- Rate limiting
- Helmet para headers de segurança
- Validação de entrada com Joi
- Sanitização de dados
- CORS configurado

### Logging
- Winston para logs estruturados
- Logs em arquivo e console
- Diferentes níveis de log
- Rotação de arquivos

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🆘 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação da API em `/api/docs`
2. Consulte os logs de erro
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ usando Node.js, React, TypeScript e Tailwind CSS**
