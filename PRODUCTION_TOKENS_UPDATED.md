# 🔐 BEARER TOKENS PARA PRODUÇÃO - GEMINI ADMIN PANEL

## 📱 TOKENS ATUALIZADOS PARA SEU APP iOS:

### 🔥 ADMIN TOKEN (Acesso completo):
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLXVzZXItMDAxIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsInR5cGUiOiJ1c2VyX3Rva2VuIiwicGVybWlzc2lvbnMiOlsiYWRtaW46ZnVsbCIsInVzZXJzOm1hbmFnZSIsImtleXM6bWFuYWdlIiwic3lzdGVtOmNvbmZpZyJdLCJwbGFuIjoiZW50ZXJwcmlzZSIsImlhdCI6MTc1MTc1OTgwNCwiZXhwIjoxNzU0MzUxODA0LCJhdWQiOiJnZW1pbmktY2xpZW50IiwiaXNzIjoiZ2VtaW5pLWFwaSJ9.njRqiiQ_KxB-C4ecD2nEqrBsOXA6low2oqSvgkQSLrg
```

### 👤 USER TOKEN (Acesso padrão):
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDAxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJ0eXBlIjoidXNlcl90b2tlbiIsInBlcm1pc3Npb25zIjpbImFwaTp1c2UiXSwicGxhbiI6InBybyIsImlhdCI6MTc1MTc1OTgwNCwiZXhwIjoxNzU0MzUxODA0LCJhdWQiOiJnZW1pbmktY2xpZW50IiwiaXNzIjoiZ2VtaW5pLWFwaSJ9.V_xdO4tn9LiDOUfCoksu8CLYTaViEFp8NLJTFbijdHk
```

## 🌐 API FUNCIONANDO EM PRODUÇÃO:

**Base URL:** `https://gemini-admin-panel.vercel.app`

### ✅ ENDPOINTS TESTADOS E FUNCIONANDO:

#### 🏥 Health Check (sem autenticação):
```bash
curl -X GET "https://gemini-admin-panel.vercel.app/api/health"
```
**Resposta de exemplo:**
```json
{"status":"success","message":"API funcionando corretamente","timestamp":"2025-07-05T23:57:01.486Z","environment":"production"}
```

#### 💬 Chat com Gemini (com autenticação):
```bash
curl -X POST "https://gemini-admin-panel.vercel.app/api/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN_AQUI]" \
  -d '{"message": "Sua pergunta aqui"}'
```
**Resposta de exemplo:**
```json
{
  "status": "success",
  "message": "Resposta gerada com sucesso",
  "data": {
    "originalPrompt": "Olá! Você pode me dizer qual é a capital do Brasil?",
    "geminiResponse": "A capital do Brasil é **Brasília**.",
    "metadata": {
      "model": "gemini-1.5-flash",
      "candidateCount": 1,
      "finishReason": "STOP",
      "processingTime": 391,
      "userId": "admin-user-001",
      "username": "admin",
      "timestamp": "2025-07-05T23:56:54.841Z"
    }
  }
}
```

### 📱 EXEMPLO DE USO NO SEU APP iOS (Swift):

```swift
// Configuração da requisição
var request = URLRequest(url: URL(string: "https://gemini-admin-panel.vercel.app/api/chat")!)
request.httpMethod = "POST"
request.setValue("Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMDAxIiwidXNlcm5hbWUiOiJ1c2VyIiwicm9sZSI6InVzZXIiLCJ0eXBlIjoidXNlcl90b2tlbiIsInBlcm1pc3Npb25zIjpbImFwaTp1c2UiXSwicGxhbiI6InBybyIsImlhdCI6MTc1MTc1OTgwNCwiZXhwIjoxNzU0MzUxODA0LCJhdWQiOiJnZW1pbmktY2xpZW50IiwiaXNzIjoiZ2VtaW5pLWFwaSJ9.V_xdO4tn9LiDOUfCoksu8CLYTaViEFp8NLJTFbijdHk", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

// Corpo da requisição
let body = [
    "message": "Como funciona a inteligência artificial?"
]
request.httpBody = try JSONSerialization.data(withJSONObject: body)

// Executar requisição
URLSession.shared.dataTask(with: request) { data, response, error in
    if let data = data {
        let result = try JSONSerialization.jsonObject(with: data)
        print(result)
    }
}.resume()
```

## 🔧 INFORMAÇÕES TÉCNICAS:

- **JWT Secret configurado:** ✅ Produção com hash seguro
- **Gemini API Key:** ✅ Configurada e testada
- **Dependências serverless:** ✅ @google/generative-ai v0.19.0, bcryptjs
- **CORS habilitado:** ✅ Para todos os origins
- **Rate limiting:** ✅ Configurado
- **Logging:** ✅ Estruturado para produção
- **Erro de build resolvido:** ✅ Dependência @google/generative-ai adicionada
- **Conflito vercel.json:** ✅ Resolvido (removido functions + builds)

## ⏰ VALIDADE DOS TOKENS:
- **Gerados em:** 2025-07-05 23:56:44 UTC
- **Válidos até:** 2025-09-02 23:56:44 UTC (30 dias)
- **Status:** ✅ ATIVOS E TESTADOS EM PRODUÇÃO

## 🚀 STATUS DO DEPLOY:
- **Vercel URL:** https://gemini-admin-panel.vercel.app
- **Status:** ✅ ONLINE E FUNCIONANDO PERFEITAMENTE
- **Última atualização:** 2025-07-05 23:56:44 UTC
- **Erro FUNCTION_INVOCATION_FAILED:** ✅ RESOLVIDO

## 🧪 TESTES REALIZADOS:
- ✅ `/api/health` - Funcionando sem autenticação
- ✅ `/api/chat` com token ADMIN - Resposta completa do Gemini
- ✅ `/api/chat` com token USER - Resposta completa do Gemini
- ✅ Autenticação JWT - Validação correta dos tokens
- ✅ CORS - Headers configurados corretamente

**Para gerar novos tokens quando estes expirarem, execute:**
```bash
JWT_SECRET='6c240a010083ff678b86847b1f8d38c213d38e991f24d01851026ba02a54faedce27f7d6628f53fc951239c8d4119a794c013e92565a522c7c9e99e889de315b' node scripts/generate-bearer-token.js
```

## 🎯 PRÓXIMOS PASSOS PARA O APP iOS:
1. Use os tokens fornecidos acima
2. Configure a URL base: `https://gemini-admin-panel.vercel.app`
3. Implemente o cabeçalho Authorization com Bearer token
4. Trate as respostas JSON estruturadas
5. Implemente tratamento de erro para token expirado

🎉 **A API está 100% funcional em produção e pronta para integração com seu app iOS!**
