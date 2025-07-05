const { Redis } = require('@upstash/redis');
const logger = require('../utils/logger');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Verificar se as variáveis de ambiente estão disponíveis
      if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        throw new Error('Redis environment variables (KV_REST_API_URL, KV_REST_API_TOKEN) are not configured');
      }

      // Configuração para Upstash Redis
      this.client = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      });

      // Teste de conexão
      await this.client.ping();
      this.isConnected = true;
      
      logger.info('Redis connected successfully', {
        service: 'redis',
        provider: 'upstash'
      });

      return this.client;
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to connect to Redis', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  getClient() {
    if (!this.isConnected || !this.client) {
      throw new Error('Redis not connected. Call connect() first.');
    }
    return this.client;
  }

  async disconnect() {
    if (this.client) {
      this.isConnected = false;
      logger.info('Redis disconnected');
    }
  }

  // Utility methods for common operations
  async set(key, value, ttl = null) {
    try {
      const client = this.getClient();
      let serializedValue;
      
      // Handle different types of values
      if (typeof value === 'string') {
        serializedValue = value;
      } else if (typeof value === 'object' && value !== null) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = String(value);
      }
      
      if (ttl) {
        await client.setex(key, ttl, serializedValue);
      } else {
        await client.set(key, serializedValue);
      }
      
      logger.debug('Redis SET operation', { key, ttl });
      return true;
    } catch (error) {
      logger.error('Redis SET error', {
        key,
        error: error.message
      });
      throw error;
    }
  }

  async get(key) {
    try {
      const client = this.getClient();
      const value = await client.get(key);
      
      if (value === null || value === undefined) {
        return null;
      }
      
      // Try to parse as JSON, if fails return as string
      try {
        return JSON.parse(value);
      } catch (parseError) {
        // If it's not valid JSON, return as string
        logger.debug('Redis GET - returning as string', { key });
        return value;
      }
    } catch (error) {
      logger.error('Redis GET error', {
        key,
        error: error.message
      });
      throw error;
    }
  }

  async del(key) {
    try {
      const client = this.getClient();
      const result = await client.del(key);
      
      logger.debug('Redis DEL operation', { key, deleted: result });
      return result;
    } catch (error) {
      logger.error('Redis DEL error', {
        key,
        error: error.message
      });
      throw error;
    }
  }

  async exists(key) {
    try {
      const client = this.getClient();
      const result = await client.exists(key);
      
      logger.debug('Redis EXISTS operation', { key, exists: !!result });
      return !!result;
    } catch (error) {
      logger.error('Redis EXISTS error', {
        key,
        error: error.message
      });
      throw error;
    }
  }

  async keys(pattern) {
    try {
      const client = this.getClient();
      const keys = await client.keys(pattern);
      
      logger.debug('Redis KEYS operation', { pattern, count: keys.length });
      return keys;
    } catch (error) {
      logger.error('Redis KEYS error', {
        pattern,
        error: error.message
      });
      throw error;
    }
  }

  async incr(key) {
    try {
      const client = this.getClient();
      const result = await client.incr(key);
      
      logger.debug('Redis INCR operation', { key, value: result });
      return result;
    } catch (error) {
      logger.error('Redis INCR error', {
        key,
        error: error.message
      });
      throw error;
    }
  }

  async expire(key, seconds) {
    try {
      const client = this.getClient();
      const result = await client.expire(key, seconds);
      
      logger.debug('Redis EXPIRE operation', { key, seconds, success: !!result });
      return !!result;
    } catch (error) {
      logger.error('Redis EXPIRE error', {
        key,
        seconds,
        error: error.message
      });
      throw error;
    }
  }

  async ttl(key) {
    try {
      const client = this.getClient();
      const result = await client.ttl(key);
      
      logger.debug('Redis TTL operation', { key, ttl: result });
      return result;
    } catch (error) {
      logger.error('Redis TTL error', {
        key,
        error: error.message
      });
      throw error;
    }
  }

  // Hash operations
  async hset(key, field, value) {
    try {
      const client = this.getClient();
      let serializedValue;
      
      if (typeof value === 'string') {
        serializedValue = value;
      } else if (typeof value === 'object' && value !== null) {
        serializedValue = JSON.stringify(value);
      } else {
        serializedValue = String(value);
      }
      
      const result = await client.hset(key, field, serializedValue);
      
      logger.debug('Redis HSET operation', { key, field });
      return result;
    } catch (error) {
      logger.error('Redis HSET error', {
        key,
        field,
        error: error.message
      });
      throw error;
    }
  }

  async hget(key, field) {
    try {
      const client = this.getClient();
      const value = await client.hget(key, field);
      
      if (value === null || value === undefined) {
        return null;
      }
      
      // Try to parse as JSON, if fails return as string
      try {
        return JSON.parse(value);
      } catch (parseError) {
        return value;
      }
    } catch (error) {
      logger.error('Redis HGET error', {
        key,
        field,
        error: error.message
      });
      throw error;
    }
  }

  async hgetall(key) {
    try {
      const client = this.getClient();
      const hash = await client.hgetall(key);
      
      if (!hash || Object.keys(hash).length === 0) {
        return {};
      }
      
      // Parse JSON values
      const parsed = {};
      for (const [field, value] of Object.entries(hash)) {
        try {
          parsed[field] = JSON.parse(value);
        } catch {
          parsed[field] = value;
        }
      }
      
      logger.debug('Redis HGETALL operation', { key, fields: Object.keys(parsed).length });
      return parsed;
    } catch (error) {
      logger.error('Redis HGETALL error', {
        key,
        error: error.message
      });
      throw error;
    }
  }

  async hdel(key, field) {
    try {
      const client = this.getClient();
      const result = await client.hdel(key, field);
      
      logger.debug('Redis HDEL operation', { key, field, deleted: result });
      return result;
    } catch (error) {
      logger.error('Redis HDEL error', {
        key,
        field,
        error: error.message
      });
      throw error;
    }
  }

  // List operations
  async lpush(key, ...values) {
    try {
      const client = this.getClient();
      const serializedValues = values.map(v => {
        if (typeof v === 'string') {
          return v;
        } else if (typeof v === 'object' && v !== null) {
          return JSON.stringify(v);
        } else {
          return String(v);
        }
      });
      const result = await client.lpush(key, ...serializedValues);
      
      logger.debug('Redis LPUSH operation', { key, count: values.length });
      return result;
    } catch (error) {
      logger.error('Redis LPUSH error', {
        key,
        error: error.message
      });
      throw error;
    }
  }

  async lrange(key, start, stop) {
    try {
      const client = this.getClient();
      const values = await client.lrange(key, start, stop);
      
      const parsed = values.map(v => {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      });
      
      logger.debug('Redis LRANGE operation', { key, start, stop, count: parsed.length });
      return parsed;
    } catch (error) {
      logger.error('Redis LRANGE error', {
        key,
        start,
        stop,
        error: error.message
      });
      throw error;
    }
  }

  async ltrim(key, start, stop) {
    try {
      const client = this.getClient();
      await client.ltrim(key, start, stop);
      
      logger.debug('Redis LTRIM operation', { key, start, stop });
      return true;
    } catch (error) {
      logger.error('Redis LTRIM error', {
        key,
        start,
        stop,
        error: error.message
      });
      throw error;
    }
  }
}

// Create singleton instance
const redisService = new RedisService();

module.exports = redisService;
