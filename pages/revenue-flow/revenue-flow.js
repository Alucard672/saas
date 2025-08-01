// pages/revenue-flow/revenue-flow.js
Page({
  data: {
    totalRevenue: 15680,
    todayRevenue: 580,
    weekRevenue: 2580,
    monthRevenue: 8960,
    timeFilter: 'all',
    paymentFilter: 'all',
    flows: [
      {
        id: 1,
        orderNo: 'SO20240126001',
        customerName: '张三',
        amount: 299,
        paymentMethod: '微信支付',
        status: 'completed',
        createTime: '2024-01-26 14:30:25'
      },
      {
        id: 2,
        orderNo: 'SO20240126002',
        customerName: '李四',
        amount: 158,
        paymentMethod: '支付宝',
        status: 'completed',
        createTime: '2024-01-26 13:15:10'
      },
      {
        id: 3,
        orderNo: 'SO20240126003',
        customerName: '王五',
        amount: 89,
        paymentMethod: '现金',
        status: 'completed',
        createTime: '2024-01-26 11:45:30'
      },
      {
        id: 4,
        orderNo: 'SO20240125001',
        customerName: '赵六',
        amount: 456,
        paymentMethod: '银行卡',
        status: 'completed',
        createTime: '2024-01-25 16:20:15'
      },
      {
        id: 5,
        orderNo: 'SO20240125002',
        customerName: '钱七',
        amount: 234,
        paymentMethod: '微信支付',
        status: 'pending',
        createTime: '2024-01-25 15:10:45'
      },
      {
        id: 6,
        orderNo: 'SO20240124001',
        customerName: '孙八',
        amount: 678,
        paymentMethod: '支付宝',
        status: 'completed',
        createTime: '2024-01-24 10:30:20'
      },
      {
        id: 7,
        orderNo: 'SO20240124002',
        customerName: '周九',
        amount: 123,
        paymentMethod: '现金',
        status: 'completed',
        createTime: '2024-01-24 09:15:35'
      },
      {
        id: 8,
        orderNo: 'SO20240123001',
        customerName: '吴十',
        amount: 567,
        paymentMethod: '微信支付',
        status: 'completed',
        createTime: '2024-01-23 14:45:10'
      }
    ],
    filteredFlows: []
  },

  onLoad: function (options) {
    this.filterFlows()
    this.initChart()
  },

  onShow: function () {
    this.filterFlows()
  },

  /**
   * 时间筛选切换
   */
  onTimeFilterChange: function (e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      timeFilter: filter
    })
    this.filterFlows()
  },

  /**
   * 支付方式筛选切换
   */
  onPaymentFilterChange: function (e) {
    const payment = e.currentTarget.dataset.payment
    this.setData({
      paymentFilter: payment
    })
    this.filterFlows()
  },

  /**
   * 筛选流水数据
   */
  filterFlows: function () {
    let filtered = [...this.data.flows]
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(today.getTime() - (today.getDay() || 7 - 1) * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // 时间筛选
    if (this.data.timeFilter !== 'all') {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createTime)
        switch (this.data.timeFilter) {
          case 'today':
            return itemDate >= today
          case 'week':
            return itemDate >= weekStart
          case 'month':
            return itemDate >= monthStart
          default:
            return true
        }
      })
    }

    // 支付方式筛选
    if (this.data.paymentFilter !== 'all') {
      filtered = filtered.filter(item => item.paymentMethod === this.data.paymentFilter)
    }

    this.setData({
      filteredFlows: filtered
    })
  },

  /**
   * 获取支付方式图标
   */
  getPaymentIcon: function (paymentMethod) {
    const iconMap = {
      '微信支付': '/images/wechat-pay.png',
      '支付宝': '/images/alipay.png',
      '现金': '/images/cash-pay.png',
      '银行卡': '/images/card-pay.png'
    }
    return iconMap[paymentMethod] || '/images/cash-pay.png'
  },

  /**
   * 获取状态文本
   */
  getStatusText: function (status) {
    const statusMap = {
      'completed': '已完成',
      'pending': '待确认',
      'failed': '失败'
    }
    return statusMap[status] || '未知'
  },

  /**
   * 导出流水
   */
  exportFlow: function () {
    wx.showModal({
      title: '导出流水',
      content: '确定要导出当前筛选条件下的收入流水吗？',
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

  /**
   * 跳转到详细图表
   */
  goToDetailChart: function () {
    wx.navigateTo({
      url: '/pages/revenue-chart/revenue-chart'
    })
  },

  /**
   * 初始化图表
   */
  initChart: function () {
    const ctx = wx.createCanvasContext('revenueChart', this)
    
    // 简单的柱状图绘制
    ctx.setFillStyle('#ff6b9d')
    ctx.fillRect(20, 80, 30, 60)
    ctx.fillRect(70, 60, 30, 80)
    ctx.fillRect(120, 40, 30, 100)
    ctx.fillRect(170, 70, 30, 70)
    ctx.fillRect(220, 50, 30, 90)
    
    // 绘制标签
    ctx.setFillStyle('#666666')
    ctx.setFontSize(12)
    ctx.fillText('周一', 25, 160)
    ctx.fillText('周二', 75, 160)
    ctx.fillText('周三', 125, 160)
    ctx.fillText('周四', 175, 160)
    ctx.fillText('周五', 225, 160)
    
    ctx.draw()
  },

  /**
   * 格式化日期
   */
  formatDate: function (dateStr) {
    if (!dateStr) return '暂无'
    
    try {
      const date = new Date(dateStr)
      const now = new Date()
      const diffTime = now - date
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return '今天'
      } else if (diffDays === 1) {
        return '昨天'
      } else if (diffDays === -1) {
        return '明天'
      } else if (diffDays > 0 && diffDays <= 7) {
        return `${diffDays}天前`
      } else if (diffDays < 0 && diffDays >= -7) {
        return `${Math.abs(diffDays)}天后`
      } else {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      }
    } catch (error) {
      console.error('日期格式化错误:', error)
      return dateStr
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.filterFlows()
    wx.stopPullDownRefresh()
  }
})