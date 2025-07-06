const redisService = require('../config/redis');
const logger = require('../utils/logger');

class GeminiKeysService {
  constructor() {
    this.redisKey = 'gemini:api_keys';
    this.fallbackKeys = [];
    this.currentKeyIndex = 0;
    this.isRedisAvailable = false;
  }

  /**
   * Inicializa o serviço, conecta ao Redis e carrega chaves fallback
   */
  async initialize() {
    try {
      // Tentar conectar ao Redis
      await redisService.connect();
      this.isRedisAvailable = true;
      logger.info('GeminiKeysService: Redis connection established');
    } catch (error) {
      this.isRedisAvailable = false;
      logger.warn('GeminiKeysService: Redis unavailable, using fallback mode', {
        error: error.message
      });
    }

    // Carregar chaves de fallback do process.env
    this.loadFallbackKeys();
    
    // Se Redis estiver disponível e não tiver chaves, migrar as do env
    if (this.isRedisAvailable) {
      await this.migrateFallbackKeysToRedis();
    }
    
    logger.info('GeminiKeysService initialized', {
      redisAvailable: this.isRedisAvailable,
      fallbackKeysCount: this.fallbackKeys.length
    });
  }

  /**
   * Carrega chaves de fallback das variáveis de ambiente
   */
  loadFallbackKeys() {
    this.fallbackKeys = [];
    
    // Buscar GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc.
    let index = 1;
    let key = process.env.GEMINI_API_KEY;
    
    // Primeira chave sem sufixo
    if (key) {
      this.fallbackKeys.push({
        id: `env_key_1`,
        key: key,
        active: true,
        source: 'env',
        createdAt: new Date().toISOString()
      });
    }
    
    // Chaves numeradas
    while (true) {
      index++;
      key = process.env[`GEMINI_API_KEY_${index}`];
      if (!key) break;
      
      this.fallbackKeys.push({
        id: `env_key_${index}`,
        key: key,
        active: true,
        source: 'env',
        createdAt: new Date().toISOString()
      });
    }
    
    logger.info(`Loaded ${this.fallbackKeys.length} fallback keys from environment`);
  }

  /**
   * Migra chaves de fallback para o Redis se não existirem
   */
  async migrateFallbackKeysToRedis() {
    try {
      const existingKeys = await this.getKeysFromRedis();
      
      if (existingKeys.length === 0 && this.fallbackKeys.length > 0) {
        logger.info('Migrating fallback keys to Redis...');
        
        for (const fallbackKey of this.fallbackKeys) {
          await this.addKeyToRedis({
            ...fallbackKey,
            id: `migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            source: 'migrated_from_env'
          });
        }
        
        logger.info(`Migrated ${this.fallbackKeys.length} keys to Redis`);
      }
    } catch (error) {
      logger.error('Failed to migrate fallback keys to Redis', {
        error: error.message
      });
    }
  }

  /**
   * Obtém todas as chaves do Redis
   */
  async getKeysFromRedis() {
    try {
      if (!this.isRedisAvailable) return [];
      
      const keysData = await redisService.get(this.redisKey);
      return keysData || [];
    } catch (error) {
      logger.error('Failed to get keys from Redis', {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Salva chaves no Redis
   */
  async saveKeysToRedis(keys) {
    try {
      if (!this.isRedisAvailable) {
        throw new Error('Redis not available');
      }
      
      await redisService.set(this.redisKey, keys);
      logger.debug('Keys saved to Redis', { count: keys.length });
      return true;
    } catch (error) {
      logger.error('Failed to save keys to Redis', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Adiciona uma nova chave ao Redis
   */
  async addKeyToRedis(keyData) {
    try {
      const keys = await this.getKeysFromRedis();
      
      const newKey = {
        id: keyData.id || `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        key: keyData.key,
        name: keyData.name || `API Key ${keys.length + 1}`,
        active: keyData.active !== false,
        source: keyData.source || 'admin',
        createdAt: keyData.createdAt || new Date().toISOString(),
        lastUsed: null,
        requestCount: 0
      };
      
      keys.push(newKey);
      await this.saveKeysToRedis(keys);
      
      logger.info('New key added to Redis', { keyId: newKey.id });
      return newKey;
    } catch (error) {
      logger.error('Failed to add key to Redis', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtém próxima chave disponível (Redis primeiro, fallback depois)
   */
  async getNextKey() {
    try {
      // Tentar buscar do Redis primeiro
      if (this.isRedisAvailable) {
        const redisKeys = await this.getKeysFromRedis();
        const activeRedisKeys = redisKeys.filter(k => k.active);
        
        if (activeRedisKeys.length > 0) {
          // Rotação round-robin das chaves do Redis
          const selectedKey = activeRedisKeys[this.currentKeyIndex % activeRedisKeys.length];
          this.currentKeyIndex = (this.currentKeyIndex + 1) % activeRedisKeys.length;
          
          // Atualizar estatísticas da chave
          await this.updateKeyUsage(selectedKey.id);
          
          logger.debug('Using Redis key', { 
            keyId: selectedKey.id,
            source: 'redis'
          });
          
          return selectedKey.key;
        }
      }
      
      // Fallback para chaves do ambiente
      if (this.fallbackKeys.length > 0) {
        const activeKeys = this.fallbackKeys.filter(k => k.active);
        
        if (activeKeys.length > 0) {
          const selectedKey = activeKeys[this.currentKeyIndex % activeKeys.length];
          this.currentKeyIndex = (this.currentKeyIndex + 1) % activeKeys.length;
          
          logger.debug('Using fallback key', { 
            keyId: selectedKey.id,
            source: 'fallback'
          });
          
          return selectedKey.key;
        }
      }
      
      throw new Error('No active Gemini API keys available');
    } catch (error) {
      logger.error('Failed to get next key', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Atualiza estatísticas de uso de uma chave
   */
  async updateKeyUsage(keyId) {
    try {
      if (!this.isRedisAvailable) return;
      
      const keys = await this.getKeysFromRedis();
      const keyIndex = keys.findIndex(k => k.id === keyId);
      
      if (keyIndex >= 0) {
        keys[keyIndex].lastUsed = new Date().toISOString();
        keys[keyIndex].requestCount = (keys[keyIndex].requestCount || 0) + 1;
        
        await this.saveKeysToRedis(keys);
      }
    } catch (error) {
      logger.error('Failed to update key usage', {
        keyId,
        error: error.message
      });
    }
  }

  /**
   * Lista todas as chaves disponíveis (para painel admin)
   */
  async listKeys() {
    try {
      let allKeys = [];
      
      // Buscar do Redis
      if (this.isRedisAvailable) {
        const redisKeys = await this.getKeysFromRedis();
        allKeys = [...redisKeys];
      }
      
      // Adicionar chaves de fallback não duplicadas
      for (const fallbackKey of this.fallbackKeys) {
        const exists = allKeys.find(k => k.key === fallbackKey.key);
        if (!exists) {
          allKeys.push({
            ...fallbackKey,
            source: 'fallback_only'
          });
        }
      }
      
      return allKeys.map(key => ({
        id: key.id,
        name: key.name || `API Key`,
        active: key.active,
        source: key.source,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        requestCount: key.requestCount || 0,
        // Não retornar a chave real por segurança
        keyPreview: key.key ? `${key.key.substring(0, 8)}...` : ''
      }));
    } catch (error) {
      logger.error('Failed to list keys', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Adiciona nova chave via painel admin
   */
  async addKey(keyData) {
    try {
      if (!keyData.key || !keyData.key.trim()) {
        throw new Error('API key is required');
      }
      
      // Verificar se a chave já existe
      const existingKeys = await this.getKeysFromRedis();
      const keyExists = existingKeys.find(k => k.key === keyData.key.trim());
      
      if (keyExists) {
        throw new Error('This API key already exists');
      }
      
      const newKey = await this.addKeyToRedis({
        key: keyData.key.trim(),
        name: keyData.name || `API Key ${existingKeys.length + 1}`,
        active: keyData.active !== false,
        source: 'admin'
      });
      
      return {
        id: newKey.id,
        name: newKey.name,
        active: newKey.active,
        source: newKey.source,
        createdAt: newKey.createdAt
      };
    } catch (error) {
      logger.error('Failed to add key via admin', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Remove chave via painel admin
   */
  async removeKey(keyId) {
    try {
      if (!this.isRedisAvailable) {
        throw new Error('Redis not available - cannot remove keys');
      }
      
      const keys = await this.getKeysFromRedis();
      const filteredKeys = keys.filter(k => k.id !== keyId);
      
      if (keys.length === filteredKeys.length) {
        throw new Error('Key not found');
      }
      
      await this.saveKeysToRedis(filteredKeys);
      
      logger.info('Key removed', { keyId });
      return true;
    } catch (error) {
      logger.error('Failed to remove key', {
        keyId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Ativa/desativa chave via painel admin
   */
  async toggleKey(keyId, active) {
    try {
      if (!this.isRedisAvailable) {
        throw new Error('Redis not available - cannot toggle keys');
      }
      
      const keys = await this.getKeysFromRedis();
      const keyIndex = keys.findIndex(k => k.id === keyId);
      
      if (keyIndex < 0) {
        throw new Error('Key not found');
      }
      
      keys[keyIndex].active = active;
      await this.saveKeysToRedis(keys);
      
      logger.info('Key toggled', { keyId, active });
      return keys[keyIndex];
    } catch (error) {
      logger.error('Failed to toggle key', {
        keyId,
        active,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtém estatísticas das chaves
   */
  async getKeyStats() {
    try {
      const keys = await this.listKeys();
      
      return {
        total: keys.length,
        active: keys.filter(k => k.active).length,
        inactive: keys.filter(k => !k.active).length,
        sources: {
          redis: keys.filter(k => k.source === 'admin' || k.source === 'migrated_from_env').length,
          fallback: keys.filter(k => k.source === 'fallback_only').length
        },
        totalRequests: keys.reduce((sum, k) => sum + (k.requestCount || 0), 0),
        redisAvailable: this.isRedisAvailable
      };
    } catch (error) {
      logger.error('Failed to get key stats', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Busca uma chave específica com a chave completa
   */
  async getKey(keyId) {
    try {
      let allKeys = [];
      
      // Buscar do Redis
      if (this.isRedisAvailable) {
        const redisKeys = await this.getKeysFromRedis();
        allKeys = [...redisKeys];
      }
      
      // Adicionar chaves de fallback não duplicadas
      for (const fallbackKey of this.fallbackKeys) {
        const exists = allKeys.find(k => k.key === fallbackKey.key);
        if (!exists) {
          allKeys.push({
            ...fallbackKey,
            source: 'fallback_only'
          });
        }
      }
      
      // Encontrar a chave específica
      const key = allKeys.find(k => k.id === keyId);
      
      if (!key) {
        throw new Error('Key not found');
      }
      
      return {
        id: key.id,
        name: key.name || `API Key`,
        active: key.active,
        source: key.source,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        requestCount: key.requestCount || 0,
        // Retornar a chave completa para operações específicas (como teste)
        key: key.key
      };
    } catch (error) {
      logger.error('Failed to get key', {
        keyId,
        error: error.message
      });
      throw error;
    }
  }
}

// Create singleton instance
const geminiKeysService = new GeminiKeysService();

module.exports = geminiKeysService;
