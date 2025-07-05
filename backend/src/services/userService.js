const bcrypt = require('bcrypt');
const redisService = require('../config/redis');
const logger = require('../utils/logger');

class UserService {
  constructor() {
    this.USER_PREFIX = 'user:';
    this.USERS_LIST = 'users:list';
    this.USER_STATS_PREFIX = 'user:stats:';
    this.USER_ACTIVITY_PREFIX = 'user:activity:';
  }

  // Generate user ID
  generateUserId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Create user
  async createUser(userData) {
    try {
      const userId = this.generateUserId();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = {
        id: userId,
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        password: hashedPassword,
        role: userData.role || 'user',
        plan: userData.plan || 'free',
        status: userData.status || 'active',
        apiLimit: userData.apiLimit || 1000,
        apiUsed: 0,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        lastActivity: null,
        permissions: userData.permissions || ['api:use'],
        tags: userData.tags || [],
        preferences: {
          language: userData.language || 'pt-BR',
          timezone: userData.timezone || 'America/Sao_Paulo',
          notifications: userData.notifications !== false,
          twoFactorEnabled: false
        },
        billing: {
          subscriptionId: null,
          nextBillingDate: null,
          totalSpent: 0,
          paymentMethod: null
        }
      };

      // Save user to Redis
      await redisService.set(`${this.USER_PREFIX}${userId}`, user);
      
      // Add to users list
      await redisService.lpush(this.USERS_LIST, userId);
      
      // Initialize user stats
      await this.initializeUserStats(userId);
      
      logger.info('User created', { userId, username: userData.username });
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
      
    } catch (error) {
      logger.error('Error creating user', {
        username: userData.username,
        error: error.message
      });
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId) {
    try {
      const user = await redisService.get(`${this.USER_PREFIX}${userId}`);
      if (!user) {
        return null;
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
      
    } catch (error) {
      logger.error('Error getting user by ID', { userId, error: error.message });
      throw error;
    }
  }

  // Get user by username
  async getUserByUsername(username) {
    try {
      const userIds = await redisService.lrange(this.USERS_LIST, 0, -1);
      
      for (const userId of userIds) {
        const user = await redisService.get(`${this.USER_PREFIX}${userId}`);
        if (user && user.username === username) {
          return user; // Return with password for authentication
        }
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting user by username', { username, error: error.message });
      throw error;
    }
  }

  // Get all users
  async getAllUsers(options = {}) {
    try {
      const { status, role, plan, limit = 100, offset = 0 } = options;
      const userIds = await redisService.lrange(this.USERS_LIST, 0, -1);
      const users = [];

      for (const userId of userIds) {
        const user = await redisService.get(`${this.USER_PREFIX}${userId}`);
        if (!user) continue;

        // Apply filters
        if (status && user.status !== status) continue;
        if (role && user.role !== role) continue;
        if (plan && user.plan !== plan) continue;

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        users.push(userWithoutPassword);
      }

      // Apply pagination
      const total = users.length;
      const paginatedUsers = users.slice(offset, offset + limit);

      logger.debug('Users retrieved', { 
        total, 
        returned: paginatedUsers.length,
        filters: { status, role, plan }
      });

      return {
        users: paginatedUsers,
        total,
        limit,
        offset
      };

    } catch (error) {
      logger.error('Error getting all users', { error: error.message });
      throw error;
    }
  }

  // Update user
  async updateUser(userId, updateData) {
    try {
      const user = await redisService.get(`${this.USER_PREFIX}${userId}`);
      if (!user) {
        throw new Error('User not found');
      }

      // Hash password if being updated
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      const updatedUser = {
        ...user,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      await redisService.set(`${this.USER_PREFIX}${userId}`, updatedUser);
      
      logger.info('User updated', { userId, fields: Object.keys(updateData) });
      
      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
      
    } catch (error) {
      logger.error('Error updating user', { userId, error: error.message });
      throw error;
    }
  }

  // Delete user
  async deleteUser(userId) {
    try {
      const user = await redisService.get(`${this.USER_PREFIX}${userId}`);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove user data
      await redisService.del(`${this.USER_PREFIX}${userId}`);
      await redisService.del(`${this.USER_STATS_PREFIX}${userId}`);
      await redisService.del(`${this.USER_ACTIVITY_PREFIX}${userId}`);
      
      // Remove from users list
      const userIds = await redisService.lrange(this.USERS_LIST, 0, -1);
      const filteredIds = userIds.filter(id => id !== userId);
      await redisService.del(this.USERS_LIST);
      if (filteredIds.length > 0) {
        await redisService.lpush(this.USERS_LIST, ...filteredIds);
      }
      
      logger.info('User deleted', { userId, username: user.username });
      return true;
      
    } catch (error) {
      logger.error('Error deleting user', { userId, error: error.message });
      throw error;
    }
  }

  // Update last login
  async updateLastLogin(userId) {
    try {
      const user = await redisService.get(`${this.USER_PREFIX}${userId}`);
      if (!user) {
        throw new Error('User not found');
      }

      user.lastLogin = new Date().toISOString();
      user.lastActivity = new Date().toISOString();
      
      await redisService.set(`${this.USER_PREFIX}${userId}`, user);
      
      logger.debug('User last login updated', { userId });
      return true;
      
    } catch (error) {
      logger.error('Error updating last login', { userId, error: error.message });
      throw error;
    }
  }

  // Initialize user stats
  async initializeUserStats(userId) {
    try {
      const stats = {
        totalRequests: 0,
        tokensUsed: 0,
        dailyRequests: Array(7).fill(0),
        weeklyRequests: Array(7).fill(0),
        monthlyRequests: Array(12).fill(0),
        favoriteModels: [],
        avgResponseTime: 0,
        lastRequestTime: null,
        errorCount: 0,
        successCount: 0
      };

      await redisService.set(`${this.USER_STATS_PREFIX}${userId}`, stats);
      
      logger.debug('User stats initialized', { userId });
      return stats;
      
    } catch (error) {
      logger.error('Error initializing user stats', { userId, error: error.message });
      throw error;
    }
  }

  // Get user stats
  async getUserStats(userId) {
    try {
      const stats = await redisService.get(`${this.USER_STATS_PREFIX}${userId}`);
      return stats || await this.initializeUserStats(userId);
    } catch (error) {
      logger.error('Error getting user stats', { userId, error: error.message });
      throw error;
    }
  }

  // Update user stats
  async updateUserStats(userId, statsUpdate) {
    try {
      const currentStats = await this.getUserStats(userId);
      const updatedStats = { ...currentStats, ...statsUpdate };
      
      await redisService.set(`${this.USER_STATS_PREFIX}${userId}`, updatedStats);
      
      logger.debug('User stats updated', { userId });
      return updatedStats;
      
    } catch (error) {
      logger.error('Error updating user stats', { userId, error: error.message });
      throw error;
    }
  }

  // Add activity log
  async addActivityLog(userId, activity) {
    try {
      const logEntry = {
        ...activity,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      };

      await redisService.lpush(`${this.USER_ACTIVITY_PREFIX}${userId}`, logEntry);
      
      // Keep only last 100 activities
      await redisService.ltrim(`${this.USER_ACTIVITY_PREFIX}${userId}`, 0, 99);
      
      logger.debug('Activity logged', { userId, action: activity.action });
      return logEntry;
      
    } catch (error) {
      logger.error('Error adding activity log', { userId, error: error.message });
      throw error;
    }
  }

  // Get user activities
  async getUserActivities(userId, limit = 20) {
    try {
      const activities = await redisService.lrange(`${this.USER_ACTIVITY_PREFIX}${userId}`, 0, limit - 1);
      return activities;
    } catch (error) {
      logger.error('Error getting user activities', { userId, error: error.message });
      throw error;
    }
  }

  // Increment API usage
  async incrementApiUsage(userId, tokens = 0) {
    try {
      const user = await redisService.get(`${this.USER_PREFIX}${userId}`);
      if (!user) {
        throw new Error('User not found');
      }

      user.apiUsed = (user.apiUsed || 0) + 1;
      await redisService.set(`${this.USER_PREFIX}${userId}`, user);

      // Update stats
      const stats = await this.getUserStats(userId);
      stats.totalRequests += 1;
      stats.tokensUsed += tokens;
      stats.successCount += 1;
      stats.lastRequestTime = new Date().toISOString();
      
      // Update daily requests (current day)
      const today = new Date().getDay();
      stats.dailyRequests[today] += 1;

      await redisService.set(`${this.USER_STATS_PREFIX}${userId}`, stats);
      
      logger.debug('API usage incremented', { userId, tokens });
      return user;
      
    } catch (error) {
      logger.error('Error incrementing API usage', { userId, error: error.message });
      throw error;
    }
  }

  // Get user count
  async getUserCount() {
    try {
      const userIds = await redisService.lrange(this.USERS_LIST, 0, -1);
      return userIds.length;
    } catch (error) {
      logger.error('Error getting user count', { error: error.message });
      return 0;
    }
  }

  // Get active users count
  async getActiveUsersCount() {
    try {
      const userIds = await redisService.lrange(this.USERS_LIST, 0, -1);
      let activeCount = 0;

      for (const userId of userIds) {
        const user = await redisService.get(`${this.USER_PREFIX}${userId}`);
        if (user && user.status === 'active') {
          activeCount++;
        }
      }

      return activeCount;
    } catch (error) {
      logger.error('Error getting active users count', { error: error.message });
      return 0;
    }
  }
}

module.exports = new UserService();
