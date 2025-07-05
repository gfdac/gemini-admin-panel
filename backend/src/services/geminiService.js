const axios = require('axios');
const { config } = require('../config/env');
const logger = require('../utils/logger');

// PROMPT PARA COPILOT: No src/services/geminiService.js, crie a função assíncrona callGeminiAPI(prompt) 
// que usa axios.post para a API do Gemini e retorna a resposta. Inclua tratamento de erros e logs.

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const callGeminiAPI = async (prompt, options = {}) => {
  try {
    logger.info('Calling Gemini API', { 
      promptLength: prompt.length,
      options 
    });

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxOutputTokens || 2048,
      }
    };

    const response = await axios.post(
      `${GEMINI_API_BASE_URL}/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const generatedText = response.data.candidates[0].content.parts[0].text;
      
      logger.info('Gemini API call successful', {
        responseLength: generatedText.length,
        candidateCount: response.data.candidates.length
      });

      return {
        success: true,
        response: generatedText,
        metadata: {
          model: 'gemini-pro',
          candidateCount: response.data.candidates.length,
          finishReason: response.data.candidates[0].finishReason
        }
      };
    } else {
      throw new Error('Invalid response format from Gemini API');
    }

  } catch (error) {
    logger.error('Gemini API call failed', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    if (error.response) {
      // API responded with error status
      const status = error.response.status;
      let message = 'Gemini API error';

      switch (status) {
        case 400:
          message = 'Invalid request to Gemini API';
          break;
        case 401:
          message = 'Invalid API key for Gemini';
          break;
        case 403:
          message = 'Access forbidden to Gemini API';
          break;
        case 429:
          message = 'Rate limit exceeded for Gemini API';
          break;
        case 500:
          message = 'Gemini API server error';
          break;
        default:
          message = `Gemini API error: ${status}`;
      }

      return {
        success: false,
        error: message,
        statusCode: status
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'Network error when calling Gemini API',
        statusCode: 503
      };
    } else {
      // Other error
      return {
        success: false,
        error: 'Unexpected error when calling Gemini API',
        statusCode: 500
      };
    }
  }
};

// Function to test API connectivity
const testGeminiConnection = async () => {
  try {
    const result = await callGeminiAPI('Hello, can you respond with a simple greeting?');
    return result.success;
  } catch (error) {
    logger.error('Gemini connection test failed', { error: error.message });
    return false;
  }
};

module.exports = {
  callGeminiAPI,
  testGeminiConnection
};
