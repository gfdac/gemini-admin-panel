// Servidor adaptado para Vercel (Serverless Functions)
const app = require('./app');

// Para Vercel, exportamos a aplicação como módulo
module.exports = app;

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Frontend: http://localhost:3000`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
  });
}
