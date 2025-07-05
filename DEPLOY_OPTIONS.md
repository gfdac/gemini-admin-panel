# 🚀 Deploy no Vercel - Guia Completo

## 📋 Opções de Deploy

### Opção 1: Monorepo Unificado (Recomendado)
- Frontend e Backend no mesmo repositório
- API roda como Serverless Functions
- URL única para tudo

### Opção 2: Repositórios Separados
- Frontend em um projeto Vercel
- Backend em outro projeto Vercel
- URLs diferentes

### Opção 3: Frontend no Vercel + Backend em outro serviço
- Frontend no Vercel
- Backend no Railway, Render, Heroku, etc.

## 🎯 Implementação - Opção 1 (Monorepo)

### 1. Estrutura do Projeto
```
projeto-gemini-api/
├── frontend/          # React
├── backend/           # Node.js API
├── vercel.json       # Configuração
└── package.json      # Root
```

### 2. Configuração vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "backend/src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/backend/src/server.js" },
    { "src": "/(.*)", "dest": "/frontend/$1" }
  ]
}
```

### 3. Adaptações do Frontend

**services/api.ts:**
```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Vercel
  : 'http://localhost:3001/api';  // Local
```

### 4. Adaptações do Backend

**server.js (novo arquivo):**
```javascript
const app = require('./app');

// Export para Vercel
module.exports = app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

### 5. Variáveis de Ambiente no Vercel

No dashboard do Vercel, adicionar:
- `GEMINI_API_KEY`: Sua chave da API Gemini
- `JWT_SECRET`: Secret para JWT
- `NODE_ENV`: production

## 🔄 Como Funciona no Vercel

### Roteamento:
- `https://seu-app.vercel.app/` → Frontend React
- `https://seu-app.vercel.app/api/*` → Backend Node.js (Serverless)

### Build Process:
1. Vercel detecta `vercel.json`
2. Builda o frontend (React)
3. Converte backend em Serverless Functions
4. Deploy conjunto

### Limitações Serverless:
- Funções têm timeout (10s hobby, 60s pro)
- Stateless (sem sessões em memória)
- Cold starts (primeiro acesso pode ser lento)

## 📦 Steps para Deploy

### 1. Preparar o Código
```bash
# Ajustar API_BASE_URL no frontend
# Criar server.js no backend
# Criar vercel.json na raiz
```

### 2. Push para GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 3. Deploy no Vercel
1. Conectar GitHub ao Vercel
2. Importar o repositório
3. Configurar variáveis de ambiente
4. Deploy automático

### 4. Configurar Domínio (opcional)
- Adicionar domínio custom
- Configurar DNS

## ⚡ Vantagens do Monorepo

✅ **Uma URL só**: `https://seu-app.vercel.app`
✅ **Deploy automático**: Push = Deploy
✅ **CORS simplificado**: Frontend e API no mesmo domínio
✅ **Gratuito**: Plan hobby do Vercel é suficiente
✅ **SSL automático**: HTTPS out-of-the-box
✅ **CDN global**: Fast worldwide

## ⚠️ Considerações

### Performance:
- Cold starts em funções serverless
- Primeira requisição pode ser lenta
- Cache automático de assets estáticos

### Escalabilidade:
- Serverless escala automaticamente
- Sem gerenciamento de servidor
- Pay-per-use

### Debugging:
- Logs no dashboard Vercel
- Monitoring integrado
- Error tracking

## 🛠️ Alternativas

### Se quiser Backend Tradicional:
1. **Railway**: Deploy de containers
2. **Render**: Serviços web tradicionais  
3. **Heroku**: Classic PaaS
4. **DigitalOcean App Platform**: Containers managed

### Configuração para Backend Externo:
```typescript
// Frontend apontando para API externa
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://sua-api.railway.app/api'
  : 'http://localhost:3001/api';
```

## 🚀 Próximos Passos

1. ✅ Código já está preparado
2. ⏳ Criar conta no Vercel
3. ⏳ Conectar GitHub
4. ⏳ Configurar variáveis
5. ⏳ Deploy!

**Resultado:** Aplicação completa rodando em `https://seu-projeto.vercel.app` com frontend e API funcionando perfeitamente! 🎉
