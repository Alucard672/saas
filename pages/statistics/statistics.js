// pages/statistics/statistics.js
Page({
  data: {
    // 时间范围
    timeRange: 'month',
    // 核心指标
    totalRevenue: 12580,
    revenueTrend: 15.8,
    totalOrders: 45,
    averageOrder: 279,
    // 详细统计
    salesAmount: 12580,
    profit: 3850,
    profitRate: 30.6,
    totalProducts: 21,
    inventoryValue: 15800,
    lowStockCount: 3,
    // 图表类型
    chartType: 'revenue',
    // 热销商品
    hotProducts: [
      {
        id: 1,
        name: '苹果手机壳',
        salesCount: 156,
        revenue: 3120,
        emoji: '📱'
      },
      {
        id: 2,
        name: '无线充电器',
        salesCount: 89,
        revenue: 2670,
        emoji: '🔋'
      },
      {
        id: 3,
        name: '蓝牙耳机',
        salesCount: 67,
        revenue: 2010,
        emoji: '🎧'
      },
      {
        id: 4,
        name: '手机支架',
        salesCount: 45,
        revenue: 1305,
        emoji: '📱'
      },
      {
        id: 5,
        name: '数据线',
        salesCount: 34,
        revenue: 510,
        emoji: '🔌'
      }
    ],
    // 客户分析
    totalCustomers: 28,
    newCustomers: 8,
    repeatCustomers: 12,
    avgCustomerValue: 449,
    // 商品明细数据
    productDetails: [
      { id: 1, name: '苹果手机壳', stock: 45, sales: 156, revenue: 3120, emoji: '📱' },
      { id: 2, name: '无线充电器', stock: 23, sales: 89, revenue: 2670, emoji: '🔋' },
      { id: 3, name: '蓝牙耳机', stock: 12, sales: 67, revenue: 2010, emoji: '🎧' },
      { id: 4, name: '手机支架', stock: 67, sales: 45, revenue: 1305, emoji: '📱' },
      { id: 5, name: '数据线', stock: 89, sales: 34, revenue: 510, emoji: '🔌' },
      { id: 6, name: '充电宝', stock: 34, sales: 28, revenue: 840, emoji: '🔋' },
      { id: 7, name: '屏幕保护膜', stock: 156, sales: 23, revenue: 345, emoji: '📱' },
      { id: 8, name: '车载支架', stock: 45, sales: 19, revenue: 570, emoji: '🚗' }
    ],
    // 销售明细数据
    salesDetails: [
      { id: 1, date: '2024-01-15', customer: '张三', amount: 299, items: 3, status: '已完成' },
      { id: 2, date: '2024-01-14', customer: '李四', amount: 156, items: 2, status: '已完成' },
      { id: 3, date: '2024-01-14', customer: '王五', amount: 89, items: 1, status: '已完成' },
      { id: 4, date: '2024-01-13', customer: '赵六', amount: 234, items: 2, status: '已完成' },
      { id: 5, date: '2024-01-13', customer: '钱七', amount: 178, items: 3, status: '已完成' },
      { id: 6, date: '2024-01-12', customer: '孙八', amount: 345, items: 4, status: '已完成' },
      { id: 7, date: '2024-01-12', customer: '周九', amount: 123, items: 1, status: '已完成' },
      { id: 8, date: '2024-01-11', customer: '吴十', amount: 267, items: 2, status: '已完成' }
    ]
  },

  // 设置时间范围
  setTimeRange: function(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({
      timeRange: range
    });
    this.updateDataByTimeRange(range);
  },

  // 根据时间范围更新数据
  updateDataByTimeRange: function(range) {
    let multiplier = 1;
    switch(range) {
      case 'today':
        multiplier = 0.1;
        break;
      case 'week':
        multiplier = 0.3;
        break;
      case 'month':
        multiplier = 1;
        break;
      case 'year':
        multiplier = 12;
        break;
    }
    
    this.setData({
      totalRevenue: Math.round(12580 * multiplier),
      totalOrders: Math.round(45 * multiplier),
      salesAmount: Math.round(12580 * multiplier),
      profit: Math.round(3850 * multiplier)
    });
  },

  // 设置图表类型
  setChartType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      chartType: type
    });
  },

  // 查看商品详情
  viewProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '商品详情',
      content: '查看商品详细信息功能开发中...',
      showCancel: false
    });
  },

  // 查看销售详情
  viewSalesDetail: function(e) {
    const salesId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '销售详情',
      content: '查看销售详细信息功能开发中...',
      showCancel: false
    });
  },

  // 导出数据
  exportData: function() {
    wx.showModal({
      title: '导出数据',
      content: '数据导出功能开发中...',
      showCancel: false
    });
  },

  onLoad: function (options) {
    // 页面加载时的初始化
  },

  onReady: function () {
    // 页面初次渲染完成
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.updateDataByTimeRange(this.data.timeRange);
  },

  onHide: function () {
    // 页面隐藏
  },

  onUnload: function () {
    // 页面卸载
  },

  onPullDownRefresh: function () {
    // 下拉刷新
    this.updateDataByTimeRange(this.data.timeRange);
    wx.stopPullDownRefresh();
  },

  onReachBottom: function () {
    // 上拉触底
  },

  onShareAppMessage: function () {
    return {
      title: '数据统计',
      path: '/pages/statistics/statistics'
    };
  }
});