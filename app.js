// app.js
const config = require('./config.js')

App({
  onLaunch() {
    // 根据配置决定是否初始化云开发
    if (config.enableCloud) {
      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      } else {
        wx.cloud.init({
          env: 'cloud1-8g123456', // 请替换为您的实际云环境ID
          traceUser: true,
        })
      }
    }

    // 开发阶段跳过登录检查
    if (!config.skipLogin) {
      this.checkLoginStatus()
    } else {
      // 开发阶段设置默认用户信息
      this.setDefaultUserInfo()
    }
  },

  // 检查登录状态
  checkLoginStatus: function () {
    const token = wx.getStorageSync('token')
    if (!token) {
      // 没有token，跳转到登录页面
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return
    }

    // 验证token有效性
    this.validateToken(token)
  },

  // 验证token
  validateToken: function (token) {
    wx.cloud.callFunction({
      name: 'auth',
      data: {
        action: 'validate',
        token: token
      }
    }).then(res => {
      if (!res.result.valid) {
        // token无效，跳转到登录页面
        wx.removeStorageSync('token')
        wx.removeStorageSync('userInfo')
        wx.reLaunch({
          url: '/pages/login/login'
        })
      }
    }).catch(err => {
      console.error('验证token失败', err)
      // 验证失败，跳转到登录页面
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
      wx.reLaunch({
        url: '/pages/login/login'
      })
    })
  },

  // 获取用户信息
  getUserInfo: function () {
    return wx.getStorageSync('userInfo')
  },

  // 获取token
  getToken: function () {
    return wx.getStorageSync('token')
  },

  // 退出登录
  logout: function () {
    wx.removeStorageSync('token')
    wx.removeStorageSync('userInfo')
    wx.reLaunch({
      url: '/pages/login/login'
    })
  },

  // 设置默认用户信息（开发阶段使用）
  setDefaultUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.setStorageSync('userInfo', config.defaultUser)
      wx.setStorageSync('token', 'dev-token-' + Date.now())
      console.log('开发模式：已设置默认用户信息')
    }
  },

  // 获取OpenID（兼容原有代码）
  getOpenid: function () {
    return new Promise((resolve, reject) => {
      const userInfo = this.getUserInfo()
      if (userInfo && userInfo.openid) {
        resolve(userInfo.openid)
      } else {
        // 如果没有用户信息，返回一个默认值
        resolve('default-openid')
      }
    })
  }
})
