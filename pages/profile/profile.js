// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: ''
    },
    customerCount: 0,
    supplierCount: 0,
    customers: [],
    suppliers: []
  },

  onLoad: function () {
    this.loadUserInfo()
    this.loadCustomers()
    this.loadSuppliers()
  },

  onShow: function () {
    this.loadUserInfo()
    this.loadCustomers()
    this.loadSuppliers()
  },

  // 加载用户信息
  loadUserInfo: function () {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({ userInfo })
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

  // 加载客户数据
  loadCustomers: function () {
    // 模拟客户数据
    const mockCustomers = [
      {
        id: 1,
        name: '张三',
        phone: '138****1234',
        emoji: '👨',
        orderCount: 12
      },
      {
        id: 2,
        name: '李四',
        phone: '139****5678',
        emoji: '👩',
        orderCount: 8
      },
      {
        id: 3,
        name: '王五',
        phone: '137****9012',
        emoji: '👨',
        orderCount: 15
      }
    ]

    this.setData({
      customers: mockCustomers,
      customerCount: mockCustomers.length
    })
  },

  // 加载供应商数据
  loadSuppliers: function () {
    // 模拟供应商数据
    const mockSuppliers = [
      {
        id: 1,
        name: '华为科技',
        contact: '张经理',
        emoji: '🏢',
        productCount: 25
      },
      {
        id: 2,
        name: '小米科技',
        contact: '李经理',
        emoji: '🏢',
        productCount: 18
      },
      {
        id: 3,
        name: '苹果公司',
        contact: '王经理',
        emoji: '🏢',
        productCount: 32
      }
    ]

    this.setData({
      suppliers: mockSuppliers,
      supplierCount: mockSuppliers.length
    })
  },

  // 跳转到商品属性管理
  goToProductAttributes: function () {
    wx.navigateTo({
      url: '/pages/product-attributes/product-attributes'
    });
  },

  // 跳转到动态问候天气演示页面
  goToGreetingDemo: function () {
    wx.navigateTo({
      url: '/pages/greeting-demo/greeting-demo'
    });
  },

  // 跳转到Canvas装饰效果演示页面
  goToCanvasDemo: function () {
    wx.navigateTo({
      url: '/pages/canvas-demo/canvas-demo'
    });
  },

  // 跳转到分类管理页面
  goToCategoryManage: function () {
    wx.navigateTo({
      url: '/pages/category-manage/category-manage'
    })
  },

  // 跳转到单位管理页面
  goToUnitManage: function () {
    wx.navigateTo({
      url: '/pages/unit-manage/unit-manage'
    })
  },

  // 跳转到授权管理页面
  goToAuthManage: function () {
    wx.navigateTo({
      url: '/pages/auth-manage/auth-manage'
    })
  },

  // 跳转到试用期管理页面
  goToTrial: function () {
    wx.navigateTo({
      url: '/pages/trial/trial'
    })
  },

  goToStatistics: function () {
    wx.switchTab({
      url: '/pages/statistics/statistics'
    })
  },

  goToCustomers: function () {
    wx.navigateTo({
      url: '/pages/customers/customers'
    })
  },

  goToSuppliers: function () {
    wx.navigateTo({
      url: '/pages/suppliers/suppliers'
    })
  },

  // 客户管理
  addCustomer: function () {
    wx.navigateTo({
      url: '/pages/add-customer/add-customer'
    })
  },

  editCustomer: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/add-customer/add-customer?id=${id}`
    })
  },

  // 供应商管理
  addSupplier: function () {
    wx.navigateTo({
      url: '/pages/add-supplier/add-supplier'
    })
  },

  editSupplier: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/add-supplier/add-supplier?id=${id}`
    })
  },

  // 系统功能
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
  },

  feedback: function () {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请联系开发者',
      showCancel: false
    })
  },

  about: function () {
    wx.showModal({
      title: '关于应用',
      content: '进销存管理系统 v1.0.0\n\n基于微信小程序云开发\n专为小型商户设计',
      showCancel: false
    })
  }
}) 