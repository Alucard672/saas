// pages/settings/settings.js
const app = getApp()

Page({
  data: {
    userInfo: {
      nickName: '用户昵称',
      avatarUrl: '/images/default-avatar.png'
    },
    settings: {
      notifications: true,
      autoBackup: true,
      darkMode: false,
      soundEffects: true
    }
  },

  onLoad: function () {
    this.loadUserInfo()
  },

  onShow: function () {
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo: function () {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    }
  },

  // 获取用户信息
  getUserProfile: function () {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo
        })
        app.globalData.userInfo = res.userInfo
        wx.showToast({
          title: '获取成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.log('获取用户信息失败', err)
        wx.showToast({
          title: '获取失败',
          icon: 'error'
        })
      }
    })
  },

  // 切换设置开关
  toggleSetting: function (e) {
    const key = e.currentTarget.dataset.key
    const value = e.detail.value
    
    this.setData({
      [`settings.${key}`]: value
    })

    // 保存设置到本地存储
    wx.setStorageSync('settings', this.data.settings)
    
    wx.showToast({
      title: '设置已保存',
      icon: 'success'
    })
  },

  // 数据管理
  exportData: function () {
    wx.showModal({
      title: '导出数据',
      content: '确定要导出所有数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '导出中...'
          })
          
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '导出成功',
              icon: 'success'
            })
          }, 2000)
        }
      }
    })
  },

  importData: function () {
    wx.showModal({
      title: '导入数据',
      content: '确定要导入数据吗？这将覆盖现有数据。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '导入中...'
          })
          
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '导入成功',
              icon: 'success'
            })
          }, 2000)
        }
      }
    })
  },

  clearData: function () {
    wx.showModal({
      title: '清空数据',
      content: '确定要清空所有数据吗？此操作不可恢复！',
      confirmText: '清空',
      confirmColor: '#fa709a',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '清空中...'
          })
          
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '清空成功',
              icon: 'success'
            })
          }, 2000)
        }
      }
    })
  },

  // 关于页面
  goToAbout: function () {
    wx.showModal({
      title: '关于应用',
      content: '进销存管理系统 v1.0.0\n\n基于微信小程序云开发\n专为小型商户设计',
      showCancel: false
    })
  },

  // 意见反馈
  feedback: function () {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请联系开发者',
      showCancel: false
    })
  },

  // 检查更新
  checkUpdate: function () {
    wx.showLoading({
      title: '检查中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      wx.showModal({
        title: '检查更新',
        content: '当前已是最新版本',
        showCancel: false
      })
    }, 1000)
  }
})