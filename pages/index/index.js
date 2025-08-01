// pages/index/index.js
const app = getApp()

Page({
  data: {
    totalProducts: 12,
    totalSales: 8,
    lowStockCount: 3,
    monthlyRevenue: 2580,
    recentActivities: [
      {
        id: 1,
        icon: '🛒',
        text: '销售订单 SO20240125001',
        time: '2小时前'
      },
      {
        id: 2,
        icon: '📦',
        text: '添加商品：苹果手机壳',
        time: '4小时前'
      },
      {
        id: 3,
        icon: '💰',
        text: '销售订单 SO20240124003',
        time: '昨天'
      }
    ],
    lowStockProducts: [
      {
        id: 1,
        name: '苹果手机壳',
        stock: 5,
        emoji: '📱'
      },
      {
        id: 2,
        name: '无线充电器',
        stock: 3,
        emoji: '🔋'
      },
      {
        id: 3,
        name: '蓝牙耳机',
        stock: 2,
        emoji: '🎧'
      }
    ]
  },

  onLoad: function () {
    this.loadDashboardData()
  },

  onShow: function () {
    // 每次显示页面时刷新数据
    this.loadDashboardData()
  },

  // 加载仪表板数据
  loadDashboardData: function () {
    // 模拟加载数据
    wx.showLoading({
      title: '加载中...'
    })

    // 模拟网络请求延迟
    setTimeout(() => {
      wx.hideLoading()
      
      // 更新统计数据
      this.setData({
        totalProducts: Math.floor(Math.random() * 20) + 10,
        totalSales: Math.floor(Math.random() * 15) + 5,
        lowStockCount: Math.floor(Math.random() * 5) + 1,
        monthlyRevenue: Math.floor(Math.random() * 5000) + 2000
      })
    }, 1000)
  },

  // 页面跳转方法
  goToAddProduct: function () {
    wx.navigateTo({
      url: '/pages/add-product/add-product'
    })
  },


  goToAddSale: function () {
    wx.navigateTo({
      url: '/pages/add-sale/add-sale'
    })
  },

  // 新增功能导航方法
  goToPurchase: function () {
    wx.navigateTo({
      url: '/pages/purchase-orders/purchase-orders'
    })
  },

  goToRevenueFlow: function () {
    wx.navigateTo({
      url: '/pages/revenue-flow/revenue-flow'
    })
  },


  // 下拉刷新
  onPullDownRefresh: function () {
    this.loadDashboardData()
    wx.stopPullDownRefresh()
  }
})
