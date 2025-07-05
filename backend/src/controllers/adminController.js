const userService = require('../services/userService');
const apiKeyService = require('../services/apiKeyService');
const requestService = require('../services/requestService');
const logger = require('../utils/logger');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await userService.getUserCount();
    const activeUsers = await userService.getActiveUsersCount();

    // Get API key statistics
    const totalApiKeys = await apiKeyService.getApiKeyCount();
    const activeApiKeys = await apiKeyService.getActiveApiKeysCount();

    // Get request statistics
    const requestStats = await requestService.getGeneralStats();
    const usageStats = await apiKeyService.getUsageStatistics();

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers
      },
      apiKeys: {
        total: totalApiKeys,
        active: activeApiKeys,
        inactive: totalApiKeys - activeApiKeys
      },
      requests: {
        total: requestStats.totalRequests,
        successful: requestStats.successfulRequests,
        failed: requestStats.failedRequests,
        successRate: requestStats.successRate,
        errorRate: requestStats.errorRate
      },
      tokens: {
        total: requestStats.totalTokens,
        avgPerRequest: requestStats.totalRequests > 0 ? 
          Math.round(requestStats.totalTokens / requestStats.totalRequests) : 0
      },
      performance: {
        avgResponseTime: requestStats.avgResponseTime || 0,
        totalResponseTime: requestStats.totalResponseTime || 0
      },
      lastUpdated: new Date().toISOString()
    };

    logger.info('Dashboard stats retrieved', { 
      userId: req.user.id,
      username: req.user.username
    });

    res.json({
      status: 'success',
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    logger.error('Error getting dashboard stats', {
      userId: req.user?.id,
      username: req.user?.username,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve dashboard statistics'
    });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const { status, role, plan, limit, offset, search } = req.query;
    
    const options = {
      status,
      role,
      plan,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    };

    let result = await userService.getAllUsers(options);

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      result.users = result.users.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchLower)) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchLower))
      );
      result.total = result.users.length;
    }

    logger.info('Users retrieved', {
      userId: req.user.id,
      username: req.user.username,
      filters: { status, role, plan, search },
      total: result.total
    });

    res.json({
      status: 'success',
      message: 'Users retrieved successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error getting users', {
      userId: req.user?.id,
      username: req.user?.username,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve users'
    });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const userData = req.body;
    userData.createdBy = req.user.id;

    const user = await userService.createUser(userData);

    logger.info('User created', {
      userId: req.user.id,
      username: req.user.username,
      newUserId: user.id,
      newUsername: user.username
    });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: user
    });

  } catch (error) {
    logger.error('Error creating user', {
      userId: req.user?.id,
      username: req.user?.username,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to create user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await userService.updateUser(userId, updateData);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    logger.info('User updated', {
      userId: req.user.id,
      username: req.user.username,
      updatedUserId: userId,
      fields: Object.keys(updateData)
    });

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    logger.error('Error updating user', {
      userId: req.user?.id,
      username: req.user?.username,
      targetUserId: req.params.userId,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to update user'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete your own account'
      });
    }

    const result = await userService.deleteUser(userId);

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    logger.info('User deleted', {
      userId: req.user.id,
      username: req.user.username,
      deletedUserId: userId
    });

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting user', {
      userId: req.user?.id,
      username: req.user?.username,
      targetUserId: req.params.userId,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete user'
    });
  }
};

// Get user details with stats
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const stats = await userService.getUserStats(userId);
    const activities = await userService.getUserActivities(userId, 20);

    res.json({
      status: 'success',
      message: 'User details retrieved successfully',
      data: {
        user,
        stats,
        activities
      }
    });

  } catch (error) {
    logger.error('Error getting user details', {
      userId: req.user?.id,
      username: req.user?.username,
      targetUserId: req.params.userId,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve user details'
    });
  }
};

// Get all API keys
const getApiKeys = async (req, res) => {
  try {
    const { status, environment, region, limit, offset, search } = req.query;
    
    const options = {
      status,
      environment,
      region,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    };

    let result = await apiKeyService.getAllApiKeys(options);

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      result.apiKeys = result.apiKeys.filter(key => 
        key.name.toLowerCase().includes(searchLower) ||
        key.description.toLowerCase().includes(searchLower) ||
        key.environment.toLowerCase().includes(searchLower)
      );
      result.total = result.apiKeys.length;
    }

    logger.info('API keys retrieved', {
      userId: req.user.id,
      username: req.user.username,
      filters: { status, environment, region, search },
      total: result.total
    });

    res.json({
      status: 'success',
      message: 'API keys retrieved successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error getting API keys', {
      userId: req.user?.id,
      username: req.user?.username,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve API keys'
    });
  }
};

// Create API key
const createApiKey = async (req, res) => {
  try {
    const keyData = req.body;
    keyData.createdBy = req.user.id;

    const apiKey = await apiKeyService.createApiKey(keyData);

    logger.info('API key created', {
      userId: req.user.id,
      username: req.user.username,
      keyId: apiKey.id,
      keyName: apiKey.name
    });

    res.status(201).json({
      status: 'success',
      message: 'API key created successfully',
      data: apiKey
    });

  } catch (error) {
    logger.error('Error creating API key', {
      userId: req.user?.id,
      username: req.user?.username,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to create API key',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update API key
const updateApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;
    const updateData = req.body;

    const apiKey = await apiKeyService.updateApiKey(keyId, updateData);

    if (!apiKey) {
      return res.status(404).json({
        status: 'error',
        message: 'API key not found'
      });
    }

    logger.info('API key updated', {
      userId: req.user.id,
      username: req.user.username,
      keyId: keyId,
      fields: Object.keys(updateData)
    });

    res.json({
      status: 'success',
      message: 'API key updated successfully',
      data: apiKey
    });

  } catch (error) {
    logger.error('Error updating API key', {
      userId: req.user?.id,
      username: req.user?.username,
      keyId: req.params.keyId,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to update API key'
    });
  }
};

// Delete API key
const deleteApiKey = async (req, res) => {
  try {
    const { keyId } = req.params;

    const result = await apiKeyService.deleteApiKey(keyId);

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'API key not found'
      });
    }

    logger.info('API key deleted', {
      userId: req.user.id,
      username: req.user.username,
      keyId: keyId
    });

    res.json({
      status: 'success',
      message: 'API key deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting API key', {
      userId: req.user?.id,
      username: req.user?.username,
      keyId: req.params.keyId,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to delete API key'
    });
  }
};

// Get API key details with stats
const getApiKeyDetails = async (req, res) => {
  try {
    const { keyId } = req.params;

    const apiKey = await apiKeyService.getApiKeyById(keyId);
    if (!apiKey) {
      return res.status(404).json({
        status: 'error',
        message: 'API key not found'
      });
    }

    const stats = await apiKeyService.getApiKeyStats(keyId);

    res.json({
      status: 'success',
      message: 'API key details retrieved successfully',
      data: {
        apiKey,
        stats
      }
    });

  } catch (error) {
    logger.error('Error getting API key details', {
      userId: req.user?.id,
      username: req.user?.username,
      keyId: req.params.keyId,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve API key details'
    });
  }
};

// Get requests history
const getRequestsHistory = async (req, res) => {
  try {
    const { 
      userId, 
      status, 
      endpoint, 
      startDate, 
      endDate, 
      limit, 
      offset 
    } = req.query;

    const options = {
      userId,
      status,
      endpoint,
      startDate,
      endDate,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    };

    const result = await requestService.getRequests(options);

    logger.info('Requests history retrieved', {
      userId: req.user.id,
      username: req.user.username,
      filters: options,
      total: result.total
    });

    res.json({
      status: 'success',
      message: 'Requests history retrieved successfully',
      data: result
    });

  } catch (error) {
    logger.error('Error getting requests history', {
      userId: req.user?.id,
      username: req.user?.username,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve requests history'
    });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;

    const generalStats = await requestService.getGeneralStats();
    const usageStats = await apiKeyService.getUsageStatistics(timeframe);

    // Get daily stats for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const dailyStats = await requestService.getDailyStats(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const stats = {
      general: generalStats,
      usage: usageStats,
      daily: dailyStats,
      timeframe,
      generatedAt: new Date().toISOString()
    };

    logger.info('System stats retrieved', {
      userId: req.user.id,
      username: req.user.username,
      timeframe
    });

    res.json({
      status: 'success',
      message: 'System statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    logger.error('Error getting system stats', {
      userId: req.user?.id,
      username: req.user?.username,
      error: error.message
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system statistics'
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserDetails,
  getApiKeys,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  getApiKeyDetails,
  getRequestsHistory,
  getSystemStats
};
