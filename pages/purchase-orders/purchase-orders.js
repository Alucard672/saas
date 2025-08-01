// pages/purchase-orders/purchase-orders.js
Page({
  data: {
    searchKeyword: '',
    activeFilter: 'all',
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalAmount: 0,
    orders: [],
    filteredOrders: [],
    touchStartX: 0,
    touchStartY: 0,
    swipedIndex: -1
  },

  onLoad: function (options) {
    this.loadOrders()
  },

  onShow: function () {
    this.loadOrders()
  },

  // 格式化日期显示
  formatDate: function(dateStr) {
    if (!dateStr) return ''
    
    const date = new Date(dateStr)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    const diffTime = targetDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const month = date.getMonth() + 1
    const day = date.getDate()
    const formatStr = `${month}月${day}日`
    
    if (diffDays === 0) {
      return `今天 (${formatStr})`
    } else if (diffDays === 1) {
      return `明天 (${formatStr})`
    } else if (diffDays === -1) {
      return `昨天 (${formatStr})`
    } else if (diffDays > 1 && diffDays <= 7) {
      return `${diffDays}天后 (${formatStr})`
    } else if (diffDays < -1 && diffDays >= -7) {
      return `${Math.abs(diffDays)}天前 (${formatStr})`
    } else {
      return `${date.getFullYear()}年${formatStr}`
    }
  },

  // 加载进货单数据
  loadOrders: function () {
    wx.showLoading({
      title: '加载中...'
    })

    // 模拟进货单数据
    const mockOrders = [
      {
        id: 1,
        orderNumber: 'PO202401001',
        supplierName: 'A公司',
        status: 'pending',
        statusText: '待处理',
        itemCount: 5,
        totalAmount: 12500,
        orderDate: '2024-01-15',
        deliveryDate: '2024-01-20',
        swiped: false
      },
      {
        id: 2,
        orderNumber: 'PO202401002',
        supplierName: 'B公司',
        status: 'completed',
        statusText: '已完成',
        itemCount: 8,
        totalAmount: 25800,
        orderDate: '2024-01-10',
        deliveryDate: '2024-01-15',
        swiped: false
      },
      {
        id: 3,
        orderNumber: 'PO202401003',
        supplierName: 'C公司',
        status: 'cancelled',
        statusText: '已取消',
        itemCount: 3,
        totalAmount: 8900,
        orderDate: '2024-01-08',
        deliveryDate: '',
        swiped: false
      },
      {
        id: 4,
        orderNumber: 'PO202401004',
        supplierName: 'A公司',
        status: 'completed',
        statusText: '已完成',
        itemCount: 12,
        totalAmount: 45600,
        orderDate: '2024-01-05',
        deliveryDate: '2024-01-12',
        swiped: false
      }
    ]

    setTimeout(() => {
      wx.hideLoading()
      
      // 格式化日期显示
      const formattedOrders = mockOrders.map(order => ({
        ...order,
        orderDate: this.formatDate(order.orderDate),
        deliveryDate: this.formatDate(order.deliveryDate)
      }))
      
      const totalAmount = formattedOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0)
      
      this.setData({
        orders: formattedOrders,
        totalOrders: formattedOrders.length,
        pendingOrders: formattedOrders.filter(o => o.status === 'pending').length,
        completedOrders: formattedOrders.filter(o => o.status === 'completed').length,
        totalAmount: totalAmount
      })
      
      this.filterOrders()
    }, 1000)
  },

  // 搜索输入
  onSearchInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterOrders()
  },

  // 筛选切换
  onFilterChange: function (e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      activeFilter: filter
    })
    this.filterOrders()
  },

  // 筛选进货单
  filterOrders: function () {
    const { orders, searchKeyword, activeFilter } = this.data
    let filtered = orders

    // 按关键词筛选
    if (searchKeyword) {
      filtered = filtered.filter(order => 
        order.orderNumber.includes(searchKeyword) ||
        order.supplierName.includes(searchKeyword)
      )
    }

    // 按状态筛选
    if (activeFilter !== 'all') {
      filtered = filtered.filter(order => order.status === activeFilter)
    }

    this.setData({
      filteredOrders: filtered
    })
  },

  // 进货单点击
  onOrderTap: function (e) {
    const order = e.currentTarget.dataset.order
    const index = e.currentTarget.dataset.index
    
    // 如果当前项已滑动，则收回
    if (order.swiped) {
      this.resetSwipe()
      return
    }
    
    // 显示进货单详情
    const content = `进货单号：${order.orderNumber}\n厂商：${order.supplierName}\n商品数量：${order.itemCount}种\n订单金额：¥${order.totalAmount}\n下单时间：${order.orderDate}${order.deliveryDate ? '\n交货时间：' + order.deliveryDate : ''}`
    
    wx.showModal({
      title: '进货单详情',
      content: content,
      showCancel: false
    })
  },

  // 触摸开始
  onTouchStart: function (e) {
    this.setData({
      touchStartX: e.touches[0].clientX,
      touchStartY: e.touches[0].clientY
    })
  },

  // 触摸移动
  onTouchMove: function (e) {
    const { touchStartX, touchStartY } = this.data
    const touchMoveX = e.touches[0].clientX
    const touchMoveY = e.touches[0].clientY
    
    const deltaX = touchMoveX - touchStartX
    const deltaY = touchMoveY - touchStartY
    
    // 判断是否为水平滑动
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      const index = e.currentTarget.dataset.index
      
      if (deltaX < -50) {
        // 左滑显示操作按钮
        this.showSwipeActions(index)
      } else if (deltaX > 50) {
        // 右滑隐藏操作按钮
        this.resetSwipe()
      }
    }
  },

  // 触摸结束
  onTouchEnd: function (e) {
    // 重置触摸坐标
    this.setData({
      touchStartX: 0,
      touchStartY: 0
    })
  },

  // 显示滑动操作
  showSwipeActions: function (index) {
    this.resetSwipe()
    
    const filteredOrders = this.data.filteredOrders.map((order, i) => {
      return {
        ...order,
        swiped: i === index
      }
    })
    
    this.setData({
      filteredOrders,
      swipedIndex: index
    })
  },

  // 重置滑动状态
  resetSwipe: function () {
    const filteredOrders = this.data.filteredOrders.map(order => ({
      ...order,
      swiped: false
    }))
    
    this.setData({
      filteredOrders,
      swipedIndex: -1
    })
  },

  // 编辑进货单
  onEditOrder: function (e) {
    const order = e.currentTarget.dataset.order
    this.resetSwipe()
    
    wx.showToast({
      title: `编辑进货单：${order.orderNumber}`,
      icon: 'none'
    })
    
    // TODO: 跳转到编辑进货单页面
    // wx.navigateTo({
    //   url: `/pages/purchase-order-edit/purchase-order-edit?id=${order.id}`
    // })
  },

  // 删除进货单
  onDeleteOrder: function (e) {
    const order = e.currentTarget.dataset.order
    this.resetSwipe()
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除进货单"${order.orderNumber}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.deleteOrder(order.id)
        }
      }
    })
  },

  // 执行删除进货单
  deleteOrder: function (orderId) {
    wx.showLoading({
      title: '删除中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      const orders = this.data.orders.filter(o => o.id !== orderId)
      const totalAmount = orders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0)
      
      this.setData({
        orders,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
        totalAmount: totalAmount
      })
      
      this.filterOrders()
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    }, 1000)
  },

  // 添加进货单
  onAddOrder: function () {
    wx.showToast({
      title: '跳转到添加进货单页面',
      icon: 'none'
    })
    
    // TODO: 跳转到添加进货单页面
    // wx.navigateTo({
    //   url: '/pages/purchase-order-add/purchase-order-add'
    // })
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.loadOrders()
    wx.stopPullDownRefresh()
  }
})