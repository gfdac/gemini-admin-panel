#!/usr/bin/env node

/**
 * Script para gerar Bearer Token para produção
 * Use este token no seu app iOS para autenticação
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Configurações para produção
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

console.log('🔐 Gerador de Bearer Token para Produção\n');

// Função para gerar token de usuário admin
function generateAdminToken() {
  const payload = {
    id: 'admin-user-001',
    username: 'admin',
    role: 'admin',
    type: 'user_token',
    permissions: ['admin:full', 'users:manage', 'keys:manage', 'system:config'],
    plan: 'enterprise'
  };

  const token = jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: '30d', // Token válido por 30 dias
      issuer: 'gemini-api',
      audience: 'gemini-client'
    }
  );

  return token;
}

// Função para gerar token de usuário regular
function generateUserToken() {
  const payload = {
    id: 'user-001',
    username: 'user',
    role: 'user',
    type: 'user_token',
    permissions: ['api:use'],
    plan: 'pro'
  };

  const token = jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: '30d', // Token válido por 30 dias
      issuer: 'gemini-api',
      audience: 'gemini-client'
    }
  );

  return token;
}

// Gerar tokens
console.log('📱 BEARER TOKENS PARA SEU APP iOS:\n');

console.log('🔥 ADMIN TOKEN (Acesso completo):');
console.log(`Bearer ${generateAdminToken()}\n`);

console.log('👤 USER TOKEN (Acesso padrão):');
console.log(`Bearer ${generateUserToken()}\n`);

console.log('📋 COMO USAR NO SEU APP iOS:');
console.log('1. Copie um dos tokens acima');
console.log('2. Use no header Authorization: Bearer [token]');
console.log('3. URL da API: https://your-vercel-app.vercel.app/api\n');

console.log('🌐 ENDPOINTS DISPONÍVEIS:');
console.log('• POST /api/chat - Conversar com Gemini');
console.log('• GET /api/admin/users - Listar usuários (admin only)');
console.log('• GET /api/admin/api-keys - Listar chaves API (admin only)');
console.log('• GET /api/admin/dashboard - Dashboard stats (admin only)');
console.log('• POST /api/admin/api-keys - Criar chave API (admin only)\n');

console.log('📱 EXEMPLO DE USO NO iOS (Swift):');
console.log(`
var request = URLRequest(url: URL(string: "https://your-app.vercel.app/api/chat")!)
request.httpMethod = "POST"
request.setValue("Bearer [SEU_TOKEN_AQUI]", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

let body = [
    "message": "Olá, como você está?",
    "model": "gemini-1.5-flash"
]
request.httpBody = try JSONSerialization.data(withJSONObject: body)
`);

console.log('✅ Tokens gerados com sucesso! Válidos por 30 dias.');
