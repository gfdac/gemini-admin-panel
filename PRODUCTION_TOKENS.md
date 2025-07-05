# 📱 BEARER TOKENS PARA PRODUÇÃO - APP iOS

## 🔥 URLs de Produção

**API Base URL:** `https://gemini-admin-panel.vercel.app/api`
**Frontend URL:** `https://gemini-admin-panel.vercel.app`

## 🔐 Bearer Tokens (Válidos por 30 dias)

### 👑 ADMIN TOKEN (Acesso completo)
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItMDAxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJ1c2VyX3Rva2VuIiwicGVybWlzc2lvbnMiOlsiYWRtaW46ZnVsbCIsInVzZXJzOm1hbmFnZSIsImtleXM6bWFuYWdlIiwic3lzdGVtOmNvbmZpZyJdLCJwbGFuIjoiZW50ZXJwcmlzZSIsImlhdCI6MTc1MTc1ODY1MiwiZXhwIjoxNzU0MzUwNjUyLCJhdWQiOiJnZW1pbmktY2xpZW50IiwiaXNzIjoiZ2VtaW5pLWFwaSJ9.Upl3k8Efz9-iLIOypfFflHcyDZRkORCN2npJQNcNnkk
```

### 👤 USER TOKEN (Acesso padrão)
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDAxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJ0eXBlIjoidXNlcl90b2tlbiIsInBlcm1pc3Npb25zIjpbImFwaTp1c2UiXSwicGxhbiI6InBybyIsImlhdCI6MTc1MTc1ODY1MiwiZXhwIjoxNzU0MzUwNjUyLCJhdWQiOiJnZW1pbmktY2xpZW50IiwiaXNzIjoiZ2VtaW5pLWFwaSJ9.kt-Y0BWWK_xTtSd7dquMnlj5hDT_mMqxcik0-Q9pa8I
```

## 🌐 Endpoints Disponíveis

### Chat com Gemini
- **POST** `/api/chat`
- **Body:**
```json
{
  "message": "Sua mensagem aqui",
  "model": "gemini-1.5-flash"
}
```

### Endpoints Admin (Requer ADMIN TOKEN)
- **GET** `/api/admin/dashboard` - Estatísticas
- **GET** `/api/admin/users` - Listar usuários
- **GET** `/api/admin/api-keys` - Listar chaves API
- **POST** `/api/admin/api-keys` - Criar chave API

## 📱 Exemplo de Uso no iOS (Swift)

```swift
import Foundation

// Configuração da request
let url = URL(string: "https://gemini-admin-panel-87dgb2amr-gfdacs-projects.vercel.app/api/chat")!
var request = URLRequest(url: url)
request.httpMethod = "POST"

// Headers
request.setValue("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItMDAxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJ1c2VyX3Rva2VuIiwicGVybWlzc2lvbnMiOlsiYWRtaW46ZnVsbCIsInVzZXJzOm1hbmFnZSIsImtleXM6bWFuYWdlIiwic3lzdGVtOmNvbmZpZyJdLCJwbGFuIjoiZW50ZXJwcmlzZSIsImlhdCI6MTc1MTc1ODY1MiwiZXhwIjoxNzU0MzUwNjUyLCJhdWQiOiJnZW1pbmktY2xpZW50IiwiaXNzIjoiZ2VtaW5pLWFwaSJ9.Upl3k8Efz9-iLIOypfFflHcyDZRkORCN2npJQNcNnkk", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

// Body
let body = [
    "message": "Olá! Como você está hoje?",
    "model": "gemini-1.5-flash"
]

do {
    request.httpBody = try JSONSerialization.data(withJSONObject: body)
    
    // Fazer a request
    let task = URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("Erro: \(error)")
            return
        }
        
        if let data = data {
            if let responseString = String(data: data, encoding: .utf8) {
                print("Resposta: \(responseString)")
            }
        }
    }
    
    task.resume()
} catch {
    print("Erro ao serializar JSON: \(error)")
}
```

## 🔧 Como Testar

### 1. Teste rápido com curl:
```bash
curl -X POST https://gemini-admin-panel-87dgb2amr-gfdacs-projects.vercel.app/api/chat \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItMDAxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJ1c2VyX3Rva2VuIiwicGVybWlzc2lvbnMiOlsiYWRtaW46ZnVsbCIsInVzZXJzOm1hbmFnZSIsImtleXM6bWFuYWdlIiwic3lzdGVtOmNvbmZpZyJdLCJwbGFuIjoiZW50ZXJwcmlzZSIsImlhdCI6MTc1MTc1ODY1MiwiZXhwIjoxNzU0MzUwNjUyLCJhdWQiOiJnZW1pbmktY2xpZW50IiwiaXNzIjoiZ2VtaW5pLWFwaSJ9.Upl3k8Efz9-iLIOypfFflHcyDZRkORCN2npJQNcNnkk" \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá!", "model": "gemini-1.5-flash"}'
```

### 2. Teste o dashboard admin:
```bash
curl https://gemini-admin-panel-87dgb2amr-gfdacs-projects.vercel.app/api/admin/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItMDAxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJ1c2VyX3Rva2VuIiwicGVybWlzc2lvbnMiOlsiYWRtaW46ZnVsbCIsInVzZXJzOm1hbmFnZSIsImtleXM6bWFuYWdlIiwic3lzdGVtOmNvbmZpZyJdLCJwbGFuIjoiZW50ZXJwcmlzZSIsImlhdCI6MTc1MTc1ODY1MiwiZXhwIjoxNzU0MzUwNjUyLCJhdWQiOiJnZW1pbmktY2xpZW50IiwiaXNzIjoiZ2VtaW5pLWFwaSJ9.Upl3k8Efz9-iLIOypfFflHcyDZRkORCN2npJQNcNnkk"
```

## ⚠️ Importante

1. **Tokens válidos por 30 dias** - Expire em: **31/01/2025**
2. **Use HTTPS** sempre nas requisições
3. **Admin token** dá acesso total - use com cuidado
4. **User token** é mais seguro para uso geral

## 🎯 Status do Deploy

✅ **Frontend:** Funcionando  
✅ **Backend API:** Funcionando  
✅ **Autenticação:** Configurada  
✅ **Tokens:** Gerados e válidos  

**Deploy atual:** https://gemini-admin-panel-87dgb2amr-gfdacs-projects.vercel.app

---

**Data de geração:** 5 de julho de 2025  
**Projeto:** Gemini Admin Panel  
**Ambiente:** Produção (Vercel)
