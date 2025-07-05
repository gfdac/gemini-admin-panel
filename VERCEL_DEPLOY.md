# Configuração Vercel - Projeto Monorepo

## Estrutura do Projeto
```
projeto-gemini-api/
├── frontend/          # React app
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/           # Node.js/Express API
│   ├── src/
│   ├── package.json
│   └── ...
├── vercel.json       # Configuração do Vercel
└── package.json      # Root package.json
```

## Configuração do vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "backend/src/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Frontend - Configuração da API

Ajustar o baseURL da API para produção:

```typescript
// frontend/src/services/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // No Vercel, a API fica em /api
  : 'http://localhost:5000/api';
```

## Backend - Estrutura Serverless

Converter para funções serverless:

```javascript
// backend/src/index.js (ou api/index.js)
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gemini', require('./routes/gemini'));
app.use('/api/admin', require('./routes/admin'));

// Para Vercel
module.exports = app;

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```
