// Vercel Serverless Function Entry Point
// No Vercel, as variáveis de ambiente são injetadas automaticamente
// Não precisamos carregar .env explicitamente

const app = require('../backend/src/app');

module.exports = app;
