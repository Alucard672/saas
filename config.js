// config.js - 开发配置文件
const config = {
  // 开发模式配置
  development: {
    // 是否跳过登录检查
    skipLogin: true,
    // 默认用户信息（开发阶段使用）
    defaultUser: {
      id: 'dev-user-001',
      name: '开发测试用户',
      phone: '13800000000',
      role: 'super_admin',
      trialEndDate: null,
      isTrialActive: true,
      status: 'active'
    },
    // 是否启用云开发
    enableCloud: false,
    // 是否使用模拟数据
    useMockData: true
  },
  
  // 生产模式配置
  production: {
    skipLogin: false,
    enableCloud: true,
    useMockData: false
  }
}

// 当前环境（开发阶段设为development）
const currentEnv = 'development'

// 导出当前环境的配置
module.exports = {
  ...config[currentEnv],
  currentEnv
} 