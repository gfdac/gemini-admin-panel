const dotenv = require('dotenv');

// Load environment variables only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const config = {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  geminiApiKey: process.env.GEMINI_API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};

// Validate required environment variables
const requiredVars = ['JWT_SECRET', 'GEMINI_API_KEY'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  console.warn('Available env vars:', Object.keys(process.env).filter(key => key.includes('JWT') || key.includes('GEMINI')));
  if (config.nodeEnv === 'production') {
    console.warn('In production - continuing without some env vars for debugging');
    // process.exit(1); // Comentado para debug
  }
}

module.exports = { config };
