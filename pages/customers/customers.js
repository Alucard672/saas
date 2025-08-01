// pages/customers/customers.js
Page({
  data: {
    searchKeyword: '',
    activeFilter: 'all',
    totalCustomers: 0,
    vipCustomers: 0,
    activeCustomers: 0,
    totalSales: 0,
    customers: [],
    filteredCustomers: [],
    touchStartX: 0,
    touchStartY: 0,
    swipedIndex: -1
  },

  onLoad: function (options) {
    this.loadCustomers()
  },

  onShow: function () {
    this.loadCustomers()
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

  // 加载客户数据
  loadCustomers: function () {
    wx.showLoading({
      title: '加载中...'
    })

    // 模拟客户数据
    const mockCustomers = [
      {
        id: 1,
        name: '张三',
        phone: '13900139001',
        address: '北京市海淀区',
        level: 'vip',
        levelText: 'VIP',
        totalSpent: 15800,
        orderCount: 25,
        lastOrderDate: '2024-01-15',
        avatar: '👨',
        swiped: false
      },
      {
        id: 2,
        name: '李四',
        phone: '13900139002',
        address: '上海市闵行区',
        level: 'regular',
        levelText: '普通',
        totalSpent: 8500,
        orderCount: 12,
        lastOrderDate: '2024-01-10',
        avatar: '👩',
        swiped: false
      },
      {
        id: 3,
        name: '王五',
        phone: '13900139003',
        address: '深圳市福田区',
        level: 'vip',
        levelText: 'VIP',
        totalSpent: 25600,
        orderCount: 38,
        lastOrderDate: '2024-01-12',
        avatar: '👨‍💼',
        swiped: false
      },
      {
        id: 4,
        name: '赵六',
        phone: '13900139004',
        address: '广州市天河区',
        level: 'inactive',
        levelText: '不活跃',
        totalSpent: 2300,
        orderCount: 3,
        lastOrderDate: '2023-11-20',
        avatar: '👩‍💼',
        swiped: false
      }
    ]

    setTimeout(() => {
      wx.hideLoading()
      
      // 格式化日期显示
      const formattedCustomers = mockCustomers.map(customer => ({
        ...customer,
        lastOrderDate: this.formatDate(customer.lastOrderDate)
      }))
      
      const totalSales = formattedCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0)
      
      this.setData({
        customers: formattedCustomers,
        totalCustomers: formattedCustomers.length,
        vipCustomers: formattedCustomers.filter(c => c.level === 'vip').length,
        activeCustomers: formattedCustomers.filter(c => c.level !== 'inactive').length,
        totalSales: totalSales
      })
      
      this.filterCustomers()
    }, 1000)
  },

  // 搜索输入
  onSearchInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value
    })
    this.filterCustomers()
  },

  // 筛选切换
  onFilterChange: function (e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({
      activeFilter: filter
    })
    this.filterCustomers()
  },

  // 筛选客户
  filterCustomers: function () {
    const { customers, searchKeyword, activeFilter } = this.data
    let filtered = customers

    // 按关键词筛选
    if (searchKeyword) {
      filtered = filtered.filter(customer => 
        customer.name.includes(searchKeyword) ||
        customer.phone.includes(searchKeyword)
      )
    }

    // 按类型筛选
    if (activeFilter !== 'all') {
      filtered = filtered.filter(customer => customer.level === activeFilter)
    }

    this.setData({
      filteredCustomers: filtered
    })
  },

  // 客户点击
  onCustomerTap: function (e) {
    const customer = e.currentTarget.dataset.customer
    const index = e.currentTarget.dataset.index
    
    // 如果当前项已滑动，则收回
    if (customer.swiped) {
      this.resetSwipe()
      return
    }
    
    // 显示客户详情
    const content = `姓名：${customer.name}\n电话：${customer.phone}\n地址：${customer.address}\n消费总额：¥${customer.totalSpent}\n购买次数：${customer.orderCount}次\n最近购买：${customer.lastOrderDate}`
    
    wx.showModal({
      title: '客户详情',
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
    
    const filteredCustomers = this.data.filteredCustomers.map((customer, i) => {
      return {
        ...customer,
        swiped: i === index
      }
    })
    
    this.setData({
      filteredCustomers,
      swipedIndex: index
    })
  },

  // 重置滑动状态
  resetSwipe: function () {
    const filteredCustomers = this.data.filteredCustomers.map(customer => ({
      ...customer,
      swiped: false
    }))
    
    this.setData({
      filteredCustomers,
      swipedIndex: -1
    })
  },

  // 编辑客户
  onEditCustomer: function (e) {
    const customer = e.currentTarget.dataset.customer
    this.resetSwipe()
    
    wx.showToast({
      title: `编辑客户：${customer.name}`,
      icon: 'none'
    })
    
    // TODO: 跳转到编辑客户页面
    // wx.navigateTo({
    //   url: `/pages/customer-edit/customer-edit?id=${customer.id}`
    // })
  },

  // 删除客户
  onDeleteCustomer: function (e) {
    const customer = e.currentTarget.dataset.customer
    this.resetSwipe()
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除客户"${customer.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          this.deleteCustomer(customer.id)
        }
      }
    })
  },

  // 执行删除客户
  deleteCustomer: function (customerId) {
    wx.showLoading({
      title: '删除中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      const customers = this.data.customers.filter(c => c.id !== customerId)
      const totalSales = customers.reduce((sum, customer) => sum + customer.totalSpent, 0)
      
      this.setData({
        customers,
        totalCustomers: customers.length,
        vipCustomers: customers.filter(c => c.level === 'vip').length,
        activeCustomers: customers.filter(c => c.level !== 'inactive').length,
        totalSales: totalSales
      })
      
      this.filterCustomers()
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      })
    }, 1000)
  },

  // 添加客户
  onAddCustomer: function () {
    wx.showToast({
      title: '跳转到添加客户页面',
      icon: 'none'
    })
    
    // TODO: 跳转到添加客户页面
    // wx.navigateTo({
    //   url: '/pages/customer-add/customer-add'
    // })
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.loadCustomers()
    wx.stopPullDownRefresh()
  }
})